import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbActiveModal, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { findElementBySelector, findNativeElement, getAllElemsByClassName, getSpy } from '../../base-test.helpers.spec';
import { DialogValueChangeService } from '../../dialog-value.service';
import { FileTypes, PermissionTypes } from '../../dialog.enum';
import {
  DialogContextArguments,
  FileToShare,
  ListOfBasicUsersInfo,
  PermissionViewModel,
  ShareUserViewModel,
  UserSelectValue,
} from '../../dialog.interface';
import { DebounceKeyboardClickDirective } from '../debounce-keyboard-click.directive';
import { FilesShareDialogDelegate } from '../files-share.delegate.stub';
import { deepCopy } from '../share-files-ng.helper';
import {
  argumentsMock,
  expectedPermissionViewModels,
  fileWithoutType,
  getFilesToShareMock,
  listOfBasicUsersInfoMock,
  updatedPermissionViewModels,
  updatedPermissionViewModelsOnSelect,
} from '../share-files-ng.mock';
import { ShareUsersGroupComponent } from '../share-users-group/share-users-group.component';
import { SharedFilesComponent } from '../shared-files/shared-files.component';
import { user, UsersSuggestionServiceStub } from '../user-suggestion.service.stub';
import { CopyClipboardDirective } from './copy-clipboard.directive';
import { ShareFilesDialogComponent } from './share-files-ng.component';

describe('ShareFilesDialogComponent', () => {
  let component: ShareFilesDialogComponent;
  let fixture: ComponentFixture<ShareFilesDialogComponent>;
  let valueService: DialogValueChangeService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ShareFilesDialogComponent,
        ShareUsersGroupComponent,
        SharedFilesComponent,
        CopyClipboardDirective,
        DebounceKeyboardClickDirective,
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserDynamicTestingModule,
        AngularMultiSelectModule,
        NgbTooltipModule,
      ],
      providers: [NgbModal, NgbActiveModal],
    })
      .overrideComponent(ShareFilesDialogComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareFilesDialogComponent);
    component = fixture.componentInstance;
    component.setFilesShareDelegate(new FilesShareDialogDelegate());
    component.setUsersSuggestionDelegate(new UsersSuggestionServiceStub());
    valueService = TestBed.get(DialogValueChangeService);
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('#ngOnInit', () => {
    function ngOnInitExpect(args: DialogContextArguments, hasMultiplePermission: boolean): void {
      const fileMock: FileToShare[] = getFilesToShareMock();
      const models: PermissionViewModel[] = expectedPermissionViewModels();
      const checkInputModalArgumentsSpy: jasmine.Spy = getSpy(component, 'checkInputModalArguments');
      const buildFormSpy: jasmine.Spy = getSpy(component, 'buildForm');
      const toggleHasMultiplePermissionFlagSpy: jasmine.Spy = getSpy(component, 'toggleHasMultiplePermissionFlag');
      const setDefaultFileTypeSpy: jasmine.Spy = getSpy(component, 'setDefaultFileType');
      const setPermissionViewModelsSpy: jasmine.Spy = getSpy(component, 'setPermissionViewModels');
      const subscribeToModalWindowChangesSpy: jasmine.Spy = getSpy(component, 'subscribeToModalWindowChanges');

      component.arguments = args;
      fixture.detectChanges();

      expect(checkInputModalArgumentsSpy).toHaveBeenCalled();
      expect(setDefaultFileTypeSpy).toHaveBeenCalled();
      expect(setPermissionViewModelsSpy).toHaveBeenCalled();
      expect(buildFormSpy).toHaveBeenCalled();
      expect(toggleHasMultiplePermissionFlagSpy).toHaveBeenCalled();
      expect(component.link).toEqual(
        `${fileMock[0].file.publicUrl}; ${fileMock[1].file.publicUrl}; ` +
          `${fileMock[2].file.publicUrl}; ${fileMock[3].file.publicUrl}`,
      );
      expect(component.currentPermissionViewModels).toEqual(models);
      expect(component['zeroPermissionViewModels']).toEqual(models);
      expect(getAllElemsByClassName(fixture, 'custom-select').length).toBe(args.injectedPermission ? 2 : 0);
      expect(getAllElemsByClassName(fixture, 'share-link-container').length).toBe(args.shareLinkAble ? 1 : 0);
      expect(component.hasMultiplePermission).toEqual(hasMultiplePermission);
      expect(subscribeToModalWindowChangesSpy).toHaveBeenCalled();
    }

    it(
      'should call checkInputModalArguments() and buildForm() methods and check data for ' +
        'injectedPermission mode and without shareLink',
      () => {
        ngOnInitExpect(argumentsMock(true, null), true);
      },
    );

    it(
      'should call checkInputModalArguments() and buildForm() methods and check data for ' +
        'not injectedPermission mode and with shareLink',
      () => {
        ngOnInitExpect(argumentsMock(), false);
      },
    );
  });

  describe('#ngAfterContentInit', () => {
    it('should subscribe to check of search form value', () => {
      component.arguments = argumentsMock();
      component.shareForm = new FormGroup({
        shareInput: new FormControl([]),
        permissionSelector: new FormControl('reader'),
      });
      fixture.detectChanges();

      const subscribeToControlValueChangesSpy: jasmine.Spy = getSpy(component, 'subscribeToControlValueChanges');
      const updateValueSpy: jasmine.Spy = getSpy(component['valueChangeService'], 'updateSearchFormValue');
      component.shareForm.setValue({
        shareInput: ['info'],
        permissionSelector: 'reader',
      });
      component.ngAfterContentInit();

      expect(subscribeToControlValueChangesSpy).toHaveBeenCalled();
      expect(updateValueSpy).toHaveBeenCalled();
    });
  });

  describe('#setDefaultFileType', () => {
    it('should set DOCUMENT type for files without file type', () => {
      component.arguments = argumentsMock(false, null, [fileWithoutType]);
      fixture.detectChanges();
      expect(component.arguments.filesToShare[0].file.type).toEqual(FileTypes.DOCUMENT);
    });
  });

  describe('#onDismiss', () => {
    it(`should call onDismiss() method on close btn click`, () => {
      component.arguments = argumentsMock(false, null, [fileWithoutType]);
      fixture.detectChanges();

      const onDismissSpy: jasmine.Spy = getSpy(component, 'onDismiss');
      const dismissSpy: jasmine.Spy = getSpy(component['activeModal'], 'dismiss');
      const updateValueSpy: jasmine.Spy = getSpy(valueService, 'updateValue');

      findNativeElement(fixture, 'modal-btn-dismiss').click();
      fixture.detectChanges();

      expect(onDismissSpy).toHaveBeenCalled();
      expect(updateValueSpy).toHaveBeenCalledWith({ searchForm: false, usersForm: false });
      expect(dismissSpy).toHaveBeenCalledWith(false);
    });

    [
      {
        title: 'should call dismissAll() method on refuse button click and close both of modals',
        clickResult: true,
      },
      {
        title: 'should close helper modal, but do not close main shared modal',
        clickResult: false,
      },
    ].forEach((item: { title: string; clickResult: boolean }) => {
      it(`${item.title}`, () => {
        valueService.updateSearchFormValue(true);
        component.arguments = argumentsMock(false, null, [fileWithoutType]);
        fixture.detectChanges();

        const showModalWindowSpy: jasmine.Spy = getSpy(
          component['filesShareDialogDelegate'],
          'showModalWindow',
        ).and.returnValue(of(item.clickResult));
        const onDismissSpy: jasmine.Spy = getSpy(component, 'onDismiss');
        const dismissAllSpy: jasmine.Spy = getSpy(component['modalService'], 'dismissAll');
        const updateValueSpy: jasmine.Spy = getSpy(valueService, 'updateValue');

        findNativeElement(fixture, 'modal-btn-dismiss').click();
        fixture.detectChanges();

        expect(onDismissSpy).toHaveBeenCalled();
        expect(showModalWindowSpy).toHaveBeenCalled();
        expect(updateValueSpy).toHaveBeenCalledTimes(item.clickResult ? 1 : 0);
        expect(dismissAllSpy).toHaveBeenCalledTimes(item.clickResult ? 1 : 0);
      });
    });
  });

  describe('#onOpenDropdown', () => {
    it(`search input should be in focus on open dropdown `, fakeAsync(() => {
      component.arguments = argumentsMock(false, null, [fileWithoutType]);
      const onOpenDropdownSpy: jasmine.Spy = getSpy(component, 'onOpenDropdown');

      fixture.detectChanges();

      const dropdownSelect: HTMLElement = fixture.debugElement.query(By.css('.c-btn')).nativeElement;
      dropdownSelect.dispatchEvent(new Event('click'));

      fixture.detectChanges();

      const focusSpy: jasmine.Spy = getSpy(component.searchInput.nativeElement, 'focus');

      expect(onOpenDropdownSpy).toHaveBeenCalled();
      tick(0);
      expect(focusSpy).toHaveBeenCalled();
      flush();
    }));
  });

  describe('#onCloseDropdown', () => {
    it(`should trigger promise and response on close dropdown `, fakeAsync(() => {
      component.arguments = argumentsMock();
      component.associations = deepCopy(expectedPermissionViewModels());
      fixture.detectChanges();

      const onCloseDropdownSpy: jasmine.Spy = getSpy(component, 'onCloseDropdown');
      const filesToShare: ListOfBasicUsersInfo[] = listOfBasicUsersInfoMock();
      const promise: Promise<ListOfBasicUsersInfo[]> = Promise.resolve(filesToShare);
      const filesShareDialogDelegateSpy: jasmine.Spy = getSpy(
        component['filesShareDialogDelegate'],
        'getSharedUsers',
      ).and.callFake(() => promise);

      findElementBySelector(fixture, 'angular2-multiselect').triggerEventHandler('onClose', null);
      fixture.detectChanges();
      tick(0);
      expect(onCloseDropdownSpy).toHaveBeenCalled();
      expect(filesShareDialogDelegateSpy).toHaveBeenCalled();
      flush();
    }));
  });

  describe('#onSearchKeywordChanged', () => {
    beforeEach(() => {
      component.arguments = argumentsMock(false, null, [fileWithoutType]);
      fixture.detectChanges();
    });

    function onKeywordExpect(users: UserSelectValue[], error: boolean = false): void {
      const onSearchKeywordChangedSpy: jasmine.Spy = getSpy(component, 'onSearchKeywordChanged');
      const suggestUsersSpy: jasmine.Spy = getSpy(component['usersSuggestionService'], 'suggestUsers');
      const updateValueSpy: jasmine.Spy = getSpy(valueService, 'updateValue');

      if (error) {
        suggestUsersSpy.and.returnValue(Promise.reject([]));
      }

      const searchInput: HTMLInputElement = findNativeElement(fixture, 'search-input') as HTMLInputElement;

      const event: KeyboardEvent = new KeyboardEvent('debounceKeyUp');
      searchInput.value = 'test';
      searchInput.dispatchEvent(event);
      fixture.detectChanges();

      expect(onSearchKeywordChangedSpy).toHaveBeenCalled();
      expect(suggestUsersSpy).toHaveBeenCalled();
      expect(suggestUsersSpy.calls.argsFor(0)[1]).toEqual('test');
      fixture.whenStable().then(() => {
        expect(updateValueSpy).toHaveBeenCalled();
        expect(component.suggestedUsers).toEqual(users);
      });
    }

    it('should call onSearchKeywordChanged() method on keyup event and updated suggestedUsers list', () => {
      const userMock: ShareUserViewModel = user();
      onKeywordExpect([{ id: userMock.id, itemName: userMock.displayName }]);
    });

    it('should call onSearchKeywordChanged() method on keyup event and make suggestedUsers list empty', () => {
      onKeywordExpect([], true);
    });
  });

  describe('#onDeSelectAllUsers', () => {
    it('should clear selectedUsers list', () => {
      component.arguments = argumentsMock(false, null, [fileWithoutType]);
      fixture.detectChanges();

      component.selectedUsers = [{ id: 'skskks', itemName: 'sshhsh' }];
      fixture.detectChanges();

      expect(component.selectedUsers.length).toBe(1);

      const onDeSelectAllUsersSpy: jasmine.Spy = getSpy(component, 'onDeSelectAllUsers');
      const removeAllUsersSpy: jasmine.Spy = getSpy(component['usersGroupComponent'], 'removeAllUsers');

      findElementBySelector(fixture, 'angular2-multiselect').triggerEventHandler('onDeSelectAll', {});
      fixture.detectChanges();

      expect(onDeSelectAllUsersSpy).toHaveBeenCalled();
      expect(component.selectedUsers.length).toBe(0);
      expect(removeAllUsersSpy).toHaveBeenCalled();
    });
  });

  describe('#onUnshareFileAction', () => {
    function unshareFileExpect(selector: string, eventName: string, value?: UserSelectValue): void {
      const args: DialogContextArguments = argumentsMock();
      component.arguments = args;
      fixture.detectChanges();

      const onUnshareFileActionSpy: jasmine.Spy = getSpy(component, 'onUnshareFileAction');
      const updateValueSpy: jasmine.Spy = getSpy(valueService, 'updateSearchFormValue');
      const toggleHasMultiplePermissionFlagSpy: jasmine.Spy = getSpy(component, 'toggleHasMultiplePermissionFlag');

      findElementBySelector(fixture, selector).triggerEventHandler(
        eventName,
        value ? value : args.filesToShare[0].security[1].user.id,
      );
      fixture.detectChanges();

      expect(onUnshareFileActionSpy).toHaveBeenCalledWith(value ? value : args.filesToShare[0].security[1].user.id);
      expect(component.currentPermissionViewModels.length).toBe(args.filesToShare[0].security.length - 1);
      expect(component.associations).toEqual([args.filesToShare[0].security[0]]);
      expect(component.currentPermissionViewModels).toEqual([args.filesToShare[0].security[0]]);
      expect(updateValueSpy).toHaveBeenCalled();
      expect(toggleHasMultiplePermissionFlagSpy).toHaveBeenCalled();
    }

    it('should remove user with specified id from currentPermissionViewModels list', () => {
      unshareFileExpect('dntl-share-users-group', 'onUnshareFileAction');
    });

    it('should remove user with specified id from currentPermissionViewModels list', () => {
      unshareFileExpect('angular2-multiselect', 'onDeSelect', {
        id: 'aaaaa2',
        itemName: 'Bob',
        image: '',
      });
    });
  });

  describe('#onItemSelect', () => {
    it('should set new value after selected one of users from the search list', () => {
      component.arguments = argumentsMock();
      component.currentPermissionViewModels = expectedPermissionViewModels();
      component['zeroPermissionViewModels'] = deepCopy(expectedPermissionViewModels());
      fixture.detectChanges();

      const onItemSelectSpy: jasmine.Spy = getSpy(component, 'onItemSelect');

      findElementBySelector(fixture, 'angular2-multiselect').triggerEventHandler('onSelect', {
        id: 'aaaaa3',
        itemName: 'Vasya',
        image: '',
      });
      fixture.detectChanges();

      expect(component.associations).toEqual(updatedPermissionViewModelsOnSelect());
      expect(onItemSelectSpy).toHaveBeenCalled();
      expect(component.selectedUserIds).toEqual(['aaaaa3']);
    });
  });

  describe('#shareFiles', () => {
    beforeEach(() => {
      component.arguments = argumentsMock(false, PermissionTypes.owner);
      fixture.detectChanges();
    });

    function shareFilesExpect(
      currentPVM: PermissionViewModel[],
      updatedPVM: PermissionViewModel[],
      closeDialog: boolean,
    ): void {
      component.currentPermissionViewModels = currentPVM;
      component['zeroPermissionViewModels'] = deepCopy(currentPVM);
      component.associations = currentPVM === updatedPVM ? [] : updatedPVM;
      fixture.detectChanges();

      const filesToShare: FileToShare[] = getFilesToShareMock();
      const promise: Promise<FileToShare[]> = Promise.resolve(filesToShare);
      const shareFilesSpy: jasmine.Spy = getSpy(component, 'shareFiles');
      const reduceMultiplePermissionsSpy: jasmine.Spy = getSpy(component, 'reduceMultiplePermissions');
      const closeSpy: jasmine.Spy = getSpy(component['activeModal'], 'close');
      const shareFilesHandlerSpy: jasmine.Spy = getSpy(component, 'shareFilesHandler');
      const filesShareDialogDelegateSpy: jasmine.Spy = getSpy(
        component['filesShareDialogDelegate'],
        'shareFiles',
      ).and.callFake(() => promise);

      findNativeElement(fixture, 'share-btn').click();
      fixture.detectChanges();

      expect(shareFilesSpy).toHaveBeenCalled();
      expect(reduceMultiplePermissionsSpy).toHaveBeenCalled();
      expect(component.currentPermissionViewModels).toEqual(updatedPVM);

      if (closeDialog) {
        expect(closeSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalledWith(component.arguments.filesToShare);
        expect(shareFilesHandlerSpy).not.toHaveBeenCalled();
        return;
      }

      expect(shareFilesHandlerSpy).toHaveBeenCalled();
      expect(filesShareDialogDelegateSpy).toHaveBeenCalled();
      tick();

      promise.then(() => {
        expect(closeSpy).toHaveBeenCalledWith(filesToShare);
      });
    }

    it('should call shareFilesHandler() method without closing the dialog', fakeAsync(() => {
      shareFilesExpect(expectedPermissionViewModels(), updatedPermissionViewModels(), false);
    }));

    it('should close the dialog', fakeAsync(() => {
      const models: PermissionViewModel[] = updatedPermissionViewModels();
      shareFilesExpect([], [], true);
    }));
  });

  function linkHandlerExpect(
    methodName: string,
    error: boolean = true,
    btnId: string = 'btn-remove-link',
    expectedLink: string = '',
  ): void {
    const componentMethodSpy: jasmine.Spy = getSpy(component, methodName);
    const delegateMethodSpy: jasmine.Spy = getSpy(component['filesShareDialogDelegate'], methodName);

    if (error) {
      delegateMethodSpy.and.returnValue(Promise.reject([]));
    }

    findNativeElement(fixture, btnId).click();
    fixture.detectChanges();

    expect(componentMethodSpy).toHaveBeenCalled();
    expect(delegateMethodSpy).toHaveBeenCalled();
    expect(delegateMethodSpy.calls.argsFor(0)[1]).toBe(component.arguments.filesToShare);
    fixture.whenStable().then(() => {
      expect(component.link).toEqual(expectedLink);
    });
  }

  describe('#getShareableLink', () => {
    function getShareableLinkExpect(error: boolean = true, expectedLink?: string): void {
      component.arguments = argumentsMock(true);
      fixture.detectChanges();

      component.link = '';
      fixture.detectChanges();

      linkHandlerExpect('getShareableLink', error, 'get-shareable-link-btn', expectedLink);
    }

    it('should call getShareableLink() method on get-link btn click and update link prop', () => {
      const fileMock: FileToShare[] = getFilesToShareMock();
      getShareableLinkExpect(
        false,
        `${fileMock[0].file.publicUrl}; ${fileMock[1].file.publicUrl}; ` +
          `${fileMock[2].file.publicUrl}; ${fileMock[3].file.publicUrl}`,
      );
    });

    it('should call getShareableLink() method on get-link btn click and set empty link', () => {
      getShareableLinkExpect();
    });
  });

  describe('#removeLink', () => {
    function removeLinkExpect(error: boolean = true, link: string = ''): void {
      component.arguments = argumentsMock(true);
      fixture.detectChanges();

      linkHandlerExpect('removeLink', error, 'btn-remove-link', link);
    }

    it('Link should stay the same on error', () => {
      const testLink = 'testLink';

      component.link = testLink;

      removeLinkExpect(true, testLink);
    });

    it('should call getShareableLink() method on get-link btn click and update link prop', () => {
      removeLinkExpect(false);
    });

    it('should call getShareableLink() method on get-link btn click and set empty link', () => {
      removeLinkExpect();
    });
  });
});
// tslint:disable-next-line: max-file-line-count
