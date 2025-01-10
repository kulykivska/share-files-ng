import {
  FileToShare,
  PermissionViewModel,
  ShareUserViewModel,
  UserSelectValue
} from '../dialog.interface';
import { PermissionTypes, SortingPermissionTypes } from '../dialog.enum';
import { Subscription } from 'rxjs';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';

/**
 * @description Compares user-permission associations lists in zero and current state and
 *              after that extends exist user-permission associations list with
 *              associations for selected users.
 * @param {PermissionViewModel[]} zeroPVM Zero user-permission associations on
 *        share-dialog open.
 * @param {PermissionViewModel[]} currentPVM User-permission associations on 'share'
 *        button click.
 * @param {string[]} selectedUsersIds List of selected users ids
 * @param {PermissionTypes} permission Selected permission for users with ids form
 *        the selectedUsersIds list for specified files.
 * @returns {PermissionViewModel[]}
 */
export function combineUserPermissionAssociations(
  zeroPVM: PermissionViewModel[],
  currentPVM: PermissionViewModel[],
  selectedUsers: UserSelectValue[],
  permission: PermissionTypes,
): PermissionViewModel[] {
  let changed: boolean =
    selectedUsers.length > 0 || zeroPVM.length !== currentPVM.length;

  currentPVM.forEach((association: PermissionViewModel, index: number) => {
    changed = !deepEqual(zeroPVM[index], association) ? true : changed;
  });
  return getFinalPermissionViewModelList(
    changed,
    currentPVM,
    selectedUsers,
    permission,
  );
}

/**
 * @description Depending on changed flag value returns the merged list of selected users
 *        and currentAssociations list or empty list.
 * @param {boolean} changed Changes flag value.
 * @param {PermissionViewModel[]} currentPVM User-permission associations on 'share'
 *        button click.
 * @param {string[]} selectedUsersIds List of selected users ids
 * @param {PermissionTypes} permission Selected permission for users with ids form
 *        the selectedUsersIds list for specified files.
 * @returns {PermissionViewModel[]}
 */
function getFinalPermissionViewModelList(
  changed: boolean,
  currentPVM: PermissionViewModel[],
  selectedUsers: UserSelectValue[],
  selectedPermission: PermissionTypes,
): PermissionViewModel[] {
  return changed
    ? currentPVM.concat(
      selectedUsers.map((selectedUser: UserSelectValue) => ({
        user: {
          id: selectedUser.id,
          displayName: selectedUser.itemName,
          email: '',
          imageUrl: selectedUser.image,
        },
        isCurrentUser: false,
        permission: selectedPermission,
      })),
    )
    : [];
}

/**
 * @description Returns the result of compression of two objects or items.
 * @param object1
 * @param object2
 * @returns {boolean}
 */
// tslint:disable-next-line: typedef
function deepEqual(object1, object2): boolean {

  const keys1: string[] = Object.keys(object1);
  const keys2: string[] = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    // tslint:disable-next-line: typedef
    const val1 = object1[key];
    // tslint:disable-next-line: typedef
    const val2 = object2[key];
    const areObjects: boolean = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  return true;
}

/**
 * @description Returns the result of checking if the value is an object.
 * @param value
 * @returns {boolean}
 */
// tslint:disable-next-line: typedef
function isObject(value): boolean {
  return value !== null && typeof value === 'object';
}

/**
 * @description Creates list user-permission association.
 * @param {PermissionTypes[]} filesToShare Files to share.
 * @returns {PermissionViewModel[]}
 */
export function getPermissionViewModelList(
  filesToShare: FileToShare[],
): PermissionViewModel[] {
  const users: ShareUserViewModel[] = [];
  const permissions: { [key: string]: PermissionTypes[] } = {};
  let currentUserId: string;

  filesToShare.forEach((file: FileToShare) => {
    file.security.forEach((securityInfo: PermissionViewModel) => {
      users.push(securityInfo.user);

      permissions[securityInfo.user.id] = permissions[securityInfo.user.id]
        ? permissions[securityInfo.user.id].concat(securityInfo.permission)
        : [securityInfo.permission];
      if (file.file.currentUserId === securityInfo.user.id) {
        currentUserId = securityInfo.user.id;
      }
    });
  });

  const permissionVMWithoutDuplicates: PermissionViewModel[] = removeDuplicatedUsers(
    users,
    filesToShare.length,
    permissions,
    currentUserId,
  );

  return sortPermissionByCreator(
    sortPermissionWithPriority(permissionVMWithoutDuplicates),
  );
}

/**
 * @description Makes deep copy of item without binding to its memory link.
 * @param item
 * @returns {T}
 */
export function deepCopy<T>(item: T): T {
  // tslint:disable-next-line: typedef
  let copy;

  if (item === null || typeof item !== 'object') {
    return item;
  }

  if (item instanceof Array) {
    copy = [];
    // tslint:disable-next-line: typedef
    item.forEach((obj) => {
      copy.push(deepCopy(obj));
    });
    return copy;
  }

  if (item instanceof Object) {
    copy = {};
    for (const attr in item) {
      if (item.hasOwnProperty(attr)) {
        copy[attr] = deepCopy(item[attr]);
      }
    }
    return copy;
  }

  throw new Error(`Unable to copy obj! Its type isn't supported.`);
}

/**
 * @description Compares user permissions for different files and returns 'multiple'
 *              if user has not equal permissions for it.
 * @param {number} filesCount Files to share count.
 * @param {PermissionTypes[]} permissions List of permissions.
 * @returns {PermissionTypes}
 */
function combinePermissions(
  filesCount: number,
  permissions: PermissionTypes[],
): PermissionTypes {
  if (permissions.length < filesCount) {
    return PermissionTypes.multiple;
  }

  return permissions.reduce((prev: PermissionTypes, current: PermissionTypes) =>
    prev !== current ? PermissionTypes.multiple : prev,
  );
}

/**
 * @description Filters the repeated users by id and sets user-permission association.
 * @param {ShareUserViewModel[]} users
 * @param {number} filesCount Files to share count.
 * @param {{ [key: string]: PermissionTypes[] }} permissions Files to share count.
 * @returns {PermissionViewModel[]}
 */
function removeDuplicatedUsers(
  users: ShareUserViewModel[],
  filesCount: number,
  permissions: { [key: string]: PermissionTypes[] },
  currentUserId: string,
): PermissionViewModel[] {
  const filteredUsers: ShareUserViewModel[] = users.filter(
    (obj: ShareUserViewModel, pos: number, arr: ShareUserViewModel[]) =>
      arr.map((user: ShareUserViewModel) => user['id']).indexOf(obj['id']) === pos,
  );

  return filteredUsers.map((user: ShareUserViewModel) => ({
    user,
    isCurrentUser: currentUserId === user.id,
    permission: combinePermissions(filesCount, permissions[user.id]),
  }));
}

/**
 * @description Sorts permissionViewModelList with set by SortingPermissionTypes enum priority.
 * @param {PermissionViewModel[]} permissionViewModels
 * @returns {PermissionViewModel[]}
 */
function sortPermissionWithPriority(
  permissionViewModels: PermissionViewModel[],
): PermissionViewModel[] {
  return permissionViewModels.sort(
    (a: PermissionViewModel, b: PermissionViewModel) =>
      SortingPermissionTypes[a.permission] - SortingPermissionTypes[b.permission],
  );
}

/**
 * @description Sorts permissionViewModelList with set by file creator to top of the list.
 * @param {PermissionViewModel[]} permissionViewModels
 * @returns {PermissionViewModel[]}
 */
function sortPermissionByCreator(
  permissionViewModels: PermissionViewModel[],
): PermissionViewModel[] {
  return permissionViewModels.sort(
    (a: PermissionViewModel, b: PermissionViewModel) =>
      Number(b.isCurrentUser) - Number(a.isCurrentUser),
  );
}

/**
 * @description Unsubscribes from all subscriptions in case list isn't empty.
 * @param { Subscription[] } subscriptions$
 */
export function unsubscribeAll(subscriptions$: Subscription[]): void {
  if (subscriptions$.length > 0) {
    subscriptions$.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}

export function isEqualObjects(value: object, startValue: object): boolean {
  return JSON.stringify(startValue) === JSON.stringify(value);
}

export const MULTI_SELECT_SETTINGS: Partial<DropdownSettings> = {
  singleSelection: false,
  enableSearchFilter: false,
  enableCheckAll: false,
  maxHeight: 175,
  noDataLabel: '',
  tagToBody: false,
  text: 'Not selected',
};
