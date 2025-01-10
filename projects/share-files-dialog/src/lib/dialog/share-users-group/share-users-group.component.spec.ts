import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { findElement, getAllElemsByClassName, getSpy } from '../../base-test.helpers.spec';
import { PermissionTypes } from '../../dialog.enum';
import { PermissionViewModel } from '../../dialog.interface';
import { defaultPermissionsLabels, expectedPermissionViewModels, user1, user2 } from '../share-files-ng.mock';
import { ShareUsersGroupComponent } from './share-users-group.component';

describe('ShareUsersGroupComponent', () => {
  let component: ShareUsersGroupComponent;
  let fixture: ComponentFixture<ShareUsersGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareUsersGroupComponent],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareUsersGroupComponent);
    component = fixture.componentInstance;
    component.permissionViewModels = expectedPermissionViewModels();
    component.permissionsLabels = defaultPermissionsLabels;
    component.ngOnChanges({ permissionViewModels: new SimpleChange(undefined, expectedPermissionViewModels(), false) });
  });

  describe('#ngOnInit', () => {
    it('should subscribe to check of search form value', () => {
      const saveFormValueSpy: jasmine.Spy = getSpy(component['valueChangeService'], 'saveFormValue');
      fixture.detectChanges();

      expect(saveFormValueSpy).toHaveBeenCalled();
    });
  });

  describe('#ngAfterContentInit', () => {
    it('call subscribeOnFormChanges when component initialized', () => {
      const subscribeOnFormChangesSpy: jasmine.Spy = getSpy(component, 'subscribeOnFormChanges');
      fixture.detectChanges();

      expect(subscribeOnFormChangesSpy).toHaveBeenCalled();
    });
  });

  describe('#shared', () => {
    describe('#ngOnChanges && #initFormGroup', () => {
      it('should call initFormGroup and subscribeOnFormChanges when permissionViewModels changes first time', () => {
        const initFormGroupSpy: jasmine.Spy = getSpy(component, 'initFormGroup');

        component.ngOnChanges({
          permissionViewModels: new SimpleChange(undefined, expectedPermissionViewModels(), false),
        });

        expect(initFormGroupSpy).toHaveBeenCalled();
        expect(component.shareUsersGroup).toBeDefined();
        expect(Object.keys(component.shareUsersGroup.controls).length).toEqual(component.permissionViewModels.length);
      });

      it('should call initFormGroup but not call subscribeOnFormChanges when permissionViewModels changes', () => {
        const initFormGroupSpy: jasmine.Spy = getSpy(component, 'initFormGroup');
        const subscribeOnFormChangesSpy: jasmine.Spy = getSpy(component, 'subscribeOnFormChanges');

        component.ngOnChanges({
          permissionViewModels: new SimpleChange(expectedPermissionViewModels(), expectedPermissionViewModels(), false),
        });

        expect(initFormGroupSpy).toHaveBeenCalled();
        expect(subscribeOnFormChangesSpy).not.toHaveBeenCalled();
      });
    });

    describe('#subscribeOnFormChanges', () => {
      beforeEach(() => {
        component.hasInjectedPermission = false;
        fixture.detectChanges();
      });

      function subscribeOnFormChangesExpect(isFormChanged: boolean): void {
        const updatedModels: PermissionViewModel[] = [
          { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
          { user: user2, isCurrentUser: false, permission: PermissionTypes.writer },
        ];
        const defaultModels: PermissionViewModel[] = expectedPermissionViewModels();
        const emitSpy: jasmine.Spy = getSpy(component['onPermissionViewModelsChanged'], 'emit');
        const updateValueSpy: jasmine.Spy = getSpy(component['valueChangeService'], 'updateUsersFormValue');

        if (isFormChanged) {
          component.shareUsersGroup
            .get(component.permissionViewModels[1].user.id)
            .setValue(updatedModels[1].permission);
          fixture.detectChanges();
        }

        expect(component.permissionViewModels).toEqual(isFormChanged ? updatedModels : defaultModels);
        expect(emitSpy).toHaveBeenCalledTimes(isFormChanged ? 1 : 0);
        expect(updateValueSpy).toHaveBeenCalledTimes(isFormChanged ? 1 : 0);
      }

      it('should update shareUsersContent and emit it to parent component and made update flag true', () => {
        subscribeOnFormChangesExpect(true);
      });

      it('should not update shareUsersContent', () => {
        subscribeOnFormChangesExpect(false);
      });
    });

    describe('#onUnshareFile', () => {
      it(
        `should hide 'unshare' button for owner permission and not hide for it for other ` + `permission types`,
        () => {
          expect(findElement(fixture, 'unshare-btn-0')).toBeNull();
          expect(findElement(fixture, 'unshare-btn-1')).toBeDefined();
        },
      );

      it(`should not hide 'unshare' button, fire on 'unshare' btn click and call onUnshareFile() method`, () => {
        component.hasInjectedPermission = true;
        const onUnshareFileSpy: jasmine.Spy = getSpy(component, 'onUnshareFile');
        const emitSpy: jasmine.Spy = getSpy(component['onUnshareFileAction'], 'emit');
        fixture.detectChanges();

        findElement(fixture, 'unshare-btn-1').triggerEventHandler('click', 'aaaaa1');
        fixture.detectChanges();

        expect(onUnshareFileSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(component.permissionViewModels[1].user.id);
        expect(Object.keys(component.shareUsersGroup.controls).length).toEqual(
          component.permissionViewModels.length - 1,
        );
      });
    });
  });

  describe('#selector_visibility', () => {
    function selectorVisibilityExpect(visible: boolean): void {
      component.hasInjectedPermission = visible;
      fixture.detectChanges();

      // tslint:disable-next-line: typedef
      const selector = getAllElemsByClassName(fixture, 'custom-select');

      visible ? expect(selector.length).toBe(2) : expect(selector.length).toBe(0);
    }

    it(`should display selector for user's permission`, () => {
      selectorVisibilityExpect(true);
    });

    it(`should not display selector for user's permission`, () => {
      selectorVisibilityExpect(false);
    });
  });

  describe('#removeAllUsers', () => {
    it('should call removeAllUsers with array wiht user and remove him', () => {
      component.selectedUserIds = ['aaaaa1'];
      fixture.detectChanges();

      const emitSpy: jasmine.Spy = getSpy(component['onUnshareFileAction'], 'emit');
      const updateSearchFormValueSpy: jasmine.Spy = getSpy(component['valueChangeService'], 'updateSearchFormValue');
      const removeControlSpy: jasmine.Spy = getSpy(component['shareUsersGroup'], 'removeControl');

      component.removeAllUsers();

      expect(emitSpy).toHaveBeenCalled();
      expect(updateSearchFormValueSpy).toHaveBeenCalled();
      expect(removeControlSpy).toHaveBeenCalled();
    });

    it('should not call removeAllUsers with empty array', () => {
      component.selectedUserIds = [];
      fixture.detectChanges();

      const emitSpy: jasmine.Spy = getSpy(component['onUnshareFileAction'], 'emit');
      const removeControlSpy: jasmine.Spy = getSpy(component['shareUsersGroup'], 'removeControl');

      component.removeAllUsers();

      expect(emitSpy).not.toHaveBeenCalled();
      expect(removeControlSpy).not.toHaveBeenCalled();
    });
  });

  describe('#removeUser', () => {
    it('should call removeUser when selectedUsersId changes', () => {
      const newValue: string = 'newUserId';
      const oldArray: string[] = ['oldUserId1', 'oldUserId2'];
      const newArray: string[] = ['newUserId', 'oldUserId2'];

      component.selectedUserIds = newArray;
      const removeUserSpy: jasmine.Spy = getSpy(component, 'removeUser');
      const removeControlSpy: jasmine.Spy = getSpy(component['shareUsersGroup'], 'removeControl');

      const changes: SimpleChanges = {
        selectedUsersId: {
          currentValue: newArray,
          previousValue: oldArray,
          firstChange: false,
          isFirstChange: () => false,
        },
      };

      component.ngOnChanges(changes);

      expect(removeUserSpy).toHaveBeenCalledWith(newValue);
      expect(removeControlSpy).toHaveBeenCalled();
    });

    it('should not call removeUser when selectedUsersId is not changed', () => {
      const removeUserSpy: jasmine.Spy = getSpy(component, 'removeUser');

      const changes: SimpleChanges = {
        selectedUsersId: {
          currentValue: null,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false,
        },
      };

      component.ngOnChanges(changes);

      expect(removeUserSpy).not.toHaveBeenCalled();
    });
  });
});
