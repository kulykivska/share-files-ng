import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import {
  DialogContextArguments,
  FileToShare,
  FormsValueChanged,
  PermissionsLabels,
  PermissionViewModel,
  ShareUserViewModel,
  UserSelectValue
} from '../../dialog.interface';
import {
  FilesShareDialogDelegateI,
  SharedComponent,
  UsersSuggestionServiceI
} from './share-files-ng-delegates.interface';
import {
  combineUserPermissionAssociations,
  deepCopy,
  getPermissionViewModelList,
  MULTI_SELECT_SETTINGS
} from '../share-files-ng.helper';
import { FileTypes, PermissionTypes } from '../../dialog.enum';
import {
  filesShareToStringAdapter,
  listOfBasicUsersToShareUserViewModel,
  shareUserViewModelToUserSelectValueAdapter
} from './dialog.adapter';
import { ListOfBasicUsersInfo } from '../../dialog.interface';
import { DialogValueChangeService } from '../../dialog-value.service';
import { Subscription } from 'rxjs';
import { ShareUsersGroupComponent } from '../share-users-group/share-users-group.component';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';

@Component({
  selector: 'dntl-share-files-ng',
  templateUrl: './share-files-ng.component.html',
  styleUrls: ['./share-files-ng.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareFilesDialogComponent implements SharedComponent, OnInit, AfterContentInit, OnDestroy {
  @ViewChild('searchInput', { static: false }) public searchInput: ElementRef;
  @ViewChild(ShareUsersGroupComponent, { static: false }) public usersGroupComponent: ShareUsersGroupComponent;

  @Input() public arguments: DialogContextArguments;

  public readonly DEFAULT_SETTINGS: Partial<DropdownSettings> = MULTI_SELECT_SETTINGS;

  public shareForm: FormGroup;
  public shareInput: FormControl;
  public emptySearchForm: object = {
    shareInput: [],
    permissionSelector: 'reader',
  };
  public isFormChanged: boolean = false;
  public selectedUserIds: string[] = [];
  public link: string;
  public hasMultiplePermission: boolean = false;
  public PermissionTypes: typeof PermissionTypes = PermissionTypes;
  public permissionsLabels: PermissionsLabels = {
    multiple: 'Multiple',
    owner: 'Owner',
    reader: 'Reader',
    writer: 'Writer',
  };

  public suggestedUsers: UserSelectValue[] = [];
  public selectedUsers: UserSelectValue[] = [];
  public currentPermissionViewModels: PermissionViewModel[] = [];
  public associations: PermissionViewModel[];

  public searchSettings: Partial<DropdownSettings> = {
    singleSelection: false,
    text: '',
    enableSearchFilter: true,
    enableCheckAll: false,
    classes: 'custom-angular2-multiselect w-100',
  };

  private usersSuggestionService: UsersSuggestionServiceI;
  private filesShareDialogDelegate: FilesShareDialogDelegateI;
  private zeroPermissionViewModels: PermissionViewModel[] = [];
  private lastKeyword: string = '';
  private destroyed: boolean = false;
  private subscriptions$: Subscription[] = [];

  public constructor(
    private activeModal: NgbActiveModal,
    private detector: ChangeDetectorRef,
    private modalService: NgbModal,
    private valueChangeService: DialogValueChangeService,
  ) { }

  public setUsersSuggestionDelegate(
    usersSuggestionDialogDelegate: UsersSuggestionServiceI,
  ): void {
    this.usersSuggestionService = usersSuggestionDialogDelegate;
  }

  public setFilesShareDelegate(
    filesShareDialogDelegate: FilesShareDialogDelegateI,
  ): void {
    this.filesShareDialogDelegate = filesShareDialogDelegate;
  }

  public ngOnInit(): void {
    this.searchSettings = { ...this.DEFAULT_SETTINGS, ...this.searchSettings };

    this.checkInputModalArguments();
    this.buildForm();
    this.subscribeToModalWindowChanges();
  }

  public ngAfterContentInit(): void {
    this.subscribeToControlValueChanges();
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
  }

  public removeLink(): void {
    this.filesShareDialogDelegate
      .removeLink(this, this.arguments.filesToShare)
      .then(() => (this.link = ''))
      .catch(() => (this.link = ''))
      .finally(() => this.detectChanges());
  }

  public getShareableLink(): void {
    this.filesShareDialogDelegate
      .getShareableLink(this, this.arguments.filesToShare)
      .then((filesToShare: FileToShare[]) => {
        this.link = filesShareToStringAdapter(
          filesToShare,
          this.arguments.linksSeparator,
        );
      })
      .catch(() => (this.link = ''))
      .finally(() => this.detectChanges());
  }

  /**
   * @description Called on search field value changes. Calls suggestUsers() method.
   * @param {KeyboardEvent} event
   */

  public onSearchKeywordChanged(event: KeyboardEvent): void {
    this.lastKeyword =
      event && event.target && event.target['value']
        ? event.target['value']
        : this.lastKeyword;
    this.usersSuggestionService
      .suggestUsers(this, this.lastKeyword)
      .then((users: ShareUserViewModel[]) => {
        this.suggestedUsers = shareUserViewModelToUserSelectValueAdapter(users);
      })
      .catch((users: ShareUserViewModel[]) => {
        this.suggestedUsers = shareUserViewModelToUserSelectValueAdapter(users);
      })
      .finally(() => this.detectChanges());
  }
  /**
   * @description Called when a user is clicked in the search window.
   *              Refreshes the list of users after receiving data.
   * @param {UserSelectValue} user
   */
  public onItemSelect(user: UserSelectValue): void {
    this.selectedUserIds.push(user.id);
    this.associations = combineUserPermissionAssociations(
      this.zeroPermissionViewModels,
      deepCopy(this.currentPermissionViewModels),
      [user],
      this.arguments.injectedPermission || this.shareForm.get('permissionSelector').value,
    );
    this.currentPermissionViewModels = this.associations;
    this.zeroPermissionViewModels = deepCopy(this.currentPermissionViewModels);
  }

  /**
   * @description Called on 'share' button click. Preprocessing a permissionViewModels
   *              list with initial values and tests changes existence.
   *              In case no changes closes the dialog without any actions.
   */
  public shareFiles(): void {
    this.reduceMultiplePermissions();
    if (!this.associations) {
      this.associations = this.currentPermissionViewModels;
    }

    if (this.associations.length === 0) {
      this.activeModal.close(this.arguments.filesToShare);
      return;
    }
    this.shareFilesHandler();
  }

  /**
   * @description Clears selectedUsers list.
   */
  public onDeSelectAllUsers(): void {
    this.selectedUsers = [];
    this.usersGroupComponent.removeAllUsers();
  }

  /**
   * @description Filters/removes from currentPermissionViewModels list all items with
   *              specified userId or UserSelectValue value. Updates hasMultiplePermission flag value.
   * @param {string | UserSelectValue} userId
   */
  public onUnshareFileAction(userId: string | UserSelectValue): void {
    const updatedList: PermissionViewModel[] = this.currentPermissionViewModels.filter(
      (user: PermissionViewModel) => {
        const currentUserID: string = typeof userId === 'string' ? userId : userId.id;
        this.selectedUserIds.push( typeof userId === 'string' ? userId : userId.id);
        if (user.user.id === currentUserID) {
          if (typeof userId === 'string') {
            const filteredValue: UserSelectValue[] = this.shareInput.value.filter(
              (selectedUser: UserSelectValue) => selectedUser.id !== currentUserID,
            );
            this.shareInput.setValue(filteredValue);
          }
          return false;
        }
        return true;
      },
    );
    this.usersGroupComponent.removeUser(typeof userId === 'string' ? userId : userId.id);
    this.currentPermissionViewModels = updatedList;
    this.associations = updatedList;
    this.valueChangeService.updateSearchFormValue(false);
    this.toggleHasMultiplePermissionFlag();
    this.detectChanges();
  }

  /**
   * @description When you click on the cross, it checks whether changes have been made to the forms
   *              and if changes have been made, it shows an additional modal window with information
   *              about the entered data not being saved.
   */
  public onDismiss(): void {
    if (this.isFormChanged && this.arguments.hasChangesCheck) {
      this.subscriptions$.push(
        this.filesShareDialogDelegate.showModalWindow().subscribe((value: boolean) => {
          if (value) {
            this.valueChangeService.updateValue({searchForm: false, usersForm: false});
            this.modalService.dismissAll();
          }
        }),
      );
    } else {
      this.valueChangeService.updateValue({searchForm: false, usersForm: false});
      this.activeModal.dismiss(false);
    }
  }

  /**
   * @description Updates hasMultiplePermission flag value depending on hasInjectedPermission mode.
   * @param {boolean} hasInjectedPermission
   */
  public toggleHasMultiplePermissionFlag(
    hasInjectedPermission: boolean = !!this.arguments.injectedPermission,
  ): void {
    this.hasMultiplePermission = hasInjectedPermission
      ? false
      : this.currentPermissionViewModels.filter(
      (association: PermissionViewModel) =>
        association.permission === PermissionTypes.multiple,
    ).length > 0;
  }

  public changePermissionForUser(value: PermissionViewModel[]): void {
    this.toggleHasMultiplePermissionFlag();
    this.associations = value;
  }

  public toggleTooltip(tooltip: NgbTooltip): void {
    tooltip.open();
    setTimeout(() => {
      tooltip.close();
    }, 1000);
  }

  public onOpenDropdown(): void {
    if ( this.searchInput ) {
      setTimeout(() => (this.searchInput.nativeElement as HTMLInputElement).focus());
    }
  }

  public onCloseDropdown(): void {
    if ( this.associations && this.associations.length > 0 ) {
      this.filesShareDialogDelegate.getSharedUsers(
        this,
        this.associations.map((viewModael: PermissionViewModel) => viewModael.user.id),
      )
        .then((value: ListOfBasicUsersInfo[]) => {
          const usersList: PermissionViewModel[] = listOfBasicUsersToShareUserViewModel(value, this.associations);
          this.currentPermissionViewModels = usersList;
          this.zeroPermissionViewModels = deepCopy(this.currentPermissionViewModels);
        }).finally(() => this.detectChanges());
    }
  }

  /**
   * @description Calls shareFiles() method of filesShareDialogDelegate with updated files.
   */
  private shareFilesHandler(): void {
    this.arguments.filesToShare.forEach(
      (fileToShare: FileToShare) => (fileToShare.security = this.associations),
    );

    this.filesShareDialogDelegate
      .shareFiles(this, this.arguments.filesToShare)
      .then((filesToShare: FileToShare[]) => {
        this.valueChangeService.updateValue({searchForm: false, usersForm: false});
        this.activeModal.close(filesToShare);
      })
      .catch(() => {});
  }

  /**
   * @description Inits properties values with dialog arguments data.
   */
  private checkInputModalArguments(): void {
    this.link = filesShareToStringAdapter(
      this.arguments.filesToShare,
      this.arguments.linksSeparator,
    );

    this.searchSettings.text =
      this.arguments.texting.notSelectedItemLabel || 'Not selected';

    if (this.arguments.permissionsLabels) {
      this.permissionsLabels = this.arguments.permissionsLabels;
    }

    this.setDefaultFileType();
    this.setPermissionViewModels();
  }

  /**
   * @description Sets FileTypes.DOCUMENT as file type for all files without type.
   */
  private setDefaultFileType(): void {
    if (this.arguments.filesToShare) {
      this.arguments.filesToShare.forEach((fileToShare: FileToShare) => {
        if (!fileToShare.file.type) {
          fileToShare.file.type = FileTypes.DOCUMENT;
        }
      });
    }
  }

  /**
   * @description Sets up zero (original) and current permission view models state,
   *              inits hasMultiplePermission flag value.
   */
  private setPermissionViewModels(): void {
    this.currentPermissionViewModels = getPermissionViewModelList(
      this.arguments.filesToShare,
    );
    this.zeroPermissionViewModels = deepCopy(this.currentPermissionViewModels);

    this.toggleHasMultiplePermissionFlag();
  }

  private buildForm(): void {
    this.shareInput = new FormControl(null, []);

    this.shareForm = new FormGroup({
      shareInput: this.shareInput,
      permissionSelector: new FormControl(
        this.arguments.injectedPermission || PermissionTypes.reader,
      ),
    });

    this.detectChanges();
  }

  /**
   * @description Updates permission property value with dialog injectedPermission argument
   *              for all associations that have a multiple permission conflict
   *              depending on injectedPermission mode.
   */
  private reduceMultiplePermissions(): void {
    this.toggleHasMultiplePermissionFlag(false);
    if (this.arguments.injectedPermission && this.hasMultiplePermission) {
      this.currentPermissionViewModels.forEach((association: PermissionViewModel) => {
        if (association.permission !== PermissionTypes.owner) {
          association.permission = this.arguments.injectedPermission;
        }
      });
    }
  }

  private detectChanges(): void {
    if (!this.destroyed) {
      this.detector.detectChanges();
    }
  }

  private subscribeToModalWindowChanges(): void {
    this.subscriptions$.push(
      this.valueChangeService.valueChanged.subscribe((value: FormsValueChanged) => {
        this.isFormChanged = value.searchForm || value.usersForm;
      }),
    );
  }

  private subscribeToControlValueChanges(): void {
    this.subscriptions$.push(
      this.shareForm.valueChanges.subscribe(
        (value: object) => {
          this.valueChangeService.updateSearchFormValue(
            this.valueChangeService.formChangeDetection(value, this.emptySearchForm));
        },
      ),
    );
  }
}
// tslint:disable-next-line: max-file-line-count
