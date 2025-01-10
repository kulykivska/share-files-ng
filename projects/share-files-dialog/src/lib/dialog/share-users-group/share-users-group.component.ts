import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { combineLatest, Subscription } from 'rxjs';
import { DialogValueChangeService } from '../../dialog-value.service';
import { PermissionTypes } from '../../dialog.enum';
import { PermissionsLabels, PermissionViewModel } from '../../dialog.interface';

@Component({
  selector: 'dntl-share-users-group',
  templateUrl: './share-users-group.component.html',
  styleUrls: ['./share-users-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareUsersGroupComponent implements OnChanges, OnInit, AfterContentInit, OnDestroy {
  @Input() public showFilesAsAttachment: boolean = false;
  @Input() public permissionViewModels: PermissionViewModel[] = [];
  @Input() public permissionsLabels: PermissionsLabels;
  @Input() public hasInjectedPermission: boolean = false;
  @Input() public unshareButtonStyle: string;
  @Input() public selectedUserIds: string[];

  public shareUsersGroup: FormGroup;
  public PermissionTypes: typeof PermissionTypes = PermissionTypes;

  @Output() private onPermissionViewModelsChanged: EventEmitter<PermissionViewModel[]> = new EventEmitter();
  @Output() private onUnshareFileAction: EventEmitter<string> = new EventEmitter();

  private subscription$: Subscription;

  public constructor(private formBuilder: FormBuilder, private valueChangeService: DialogValueChangeService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.permissionViewModels && changes.permissionViewModels.currentValue) {
      this.initFormGroup();
    }

    if (changes.selectedUsersId && changes.selectedUsersId.currentValue) {
      const oldArray: string[] = changes.selectedUsersId.previousValue;
      const newArray: string[] = changes.selectedUsersId.currentValue;
      const newValue: string = newArray.find((item: string) => !oldArray.includes(item));

      this.removeUser(newValue);
    }
  }

  public ngOnInit(): void {
    this.subscribeOnFormChanges();
  }

  public ngAfterContentInit(): void {
    this.valueChangeService.saveFormValue(this.shareUsersGroup.value);
  }

  public ngOnDestroy(): void {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }

  public onUnshareFile(shareUserContent: PermissionViewModel): void {
    this.shareUsersGroup.removeControl(shareUserContent.user.id);
    this.onUnshareFileAction.emit(shareUserContent.user.id);
  }

  public removeUser(newValue: string): void {
    if (newValue) {
      this.shareUsersGroup.removeControl(newValue);
    }
  }

  public removeAllUsers(): void {
    if (this.selectedUserIds) {
      this.selectedUserIds.forEach((userId: string) => {
        this.shareUsersGroup.removeControl(userId);
        this.onUnshareFileAction.emit(userId);
      });
      this.valueChangeService.updateSearchFormValue(false);
    }
  }

  private initFormGroup(): void {
    if (!this.shareUsersGroup) {
      this.shareUsersGroup = this.formBuilder.group({});
    }

    this.permissionViewModels.forEach((content: PermissionViewModel) => {
      this.shareUsersGroup.addControl(
        content.user.id,
        this.formBuilder.control(content.permission || PermissionTypes.reader),
      );
    });
  }

  private subscribeOnFormChanges(): void {
    this.subscription$ = combineLatest(
      this.shareUsersGroup.valueChanges,
      this.valueChangeService.savedFormValueChanged,
    ).subscribe(([value, startValue]: [{ [key: string]: PermissionTypes }, object]) => {
      this.permissionViewModels.forEach((content: PermissionViewModel) => {
        content.permission = value[content.user.id];
      });
      this.valueChangeService.updateUsersFormValue(this.valueChangeService.formChangeDetection(value, startValue));
      this.onPermissionViewModelsChanged.emit(this.permissionViewModels);
    });
  }
}
