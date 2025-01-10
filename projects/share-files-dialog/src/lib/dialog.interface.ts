import {
  FilesShareDialogDelegateI,
  UsersSuggestionServiceI
} from './dialog/share-files-ng/share-files-ng-delegates.interface';
import { FileTypes, PermissionTypes } from './dialog.enum';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';

/**
 * @description User model to display in multiple selector
 *              (angular2-multiselect-dropdown).
 */
export interface UserSelectValue {
  id: string;
  itemName: string;
  image?: string;
}

/**
 * @description Share file dialog context content/arguments.
 */
export interface DialogContextArguments {
  texting: DialogTextingResources;
  styles: DialogCustomStyles;
  shareLinkAble?: boolean;
  injectedPermission?: PermissionTypes;
  permissionsLabels?: PermissionsLabels;
  filesToShare: FileToShare[];
  linksSeparator?: string;
  attachedFilesContent?: AttachedFilesContent;
  hasChangesCheck?: boolean;
}

/**
 * @description Content to display attached files.
 *    // TODO: Add a possibility to select how icons should be displayed: as styles or as images.
 */
export interface AttachedFilesContent {
  fileTypeStyleMapper: { [key in FileTypes]: string };
}

/**
 * @description Textings to display in share-files dialog. Has default values.
 */
export interface DialogTextingResources {
  title?: string;
  shareToLabel?: string;
  inputPlaceholder?: string;
  notSelectedItemLabel?: string;
  orGetLinkLabel?: string;
  noLinkLabel?: string;
  existingLinkDescription?: string;
  copyToClipboardLabel?: string;
  copyTooltipLabel?: string;
  removeLinkLabel?: string;
  getShareableLinkLabel?: string;
  shareButtonLabel?: string;
}

/**
 * @description Custom share-files dialog styles. Have default values.
 */
export interface DialogCustomStyles {
  shareButtonStyle?: string;
  unshareButtonStyle?: string;
}

/**
 * @description Share user view model.
 */
export interface ShareUserViewModel {
  id: string;
  displayName: string;
  email: string;
  imageUrl: string;
}

/**
 * @description Permission view model. Contains user-permission association.
 */
export interface PermissionViewModel {
  user: ShareUserViewModel;
  isCurrentUser: boolean;
  permission: PermissionTypes;
}

/**
 * @description File view model.
 */
export interface FileViewModel {
  entityId: string;
  currentUserId: string;
  name: string;
  publicUrl: string;
  isDirectory: boolean;
  type?: FileTypes;
}

/**
 * @description File to share model. Contains file and security
 *              (list of user-permission association) association.
 */
export interface FileToShare {
  file: FileViewModel;
  security: PermissionViewModel[];
}

// tslint:disable-next-line: no-empty-interface
export interface ModalDialog {}

/**
 * @description Share file dialog arguments.
 */
export interface ShareModalArgumentsInterface {
  context: DialogContextArguments;
  usersSuggestionDialogDelegate: UsersSuggestionServiceI;
  filesShareDialogDelegate: FilesShareDialogDelegateI;
}

/**
 * @description Permissions labels to display in permission selector.
 */
export interface PermissionsLabels {
  multiple: string;
  owner: string;
  reader: string;
  writer: string;
}

export interface ListOfBasicUsersInfo {
  items: UserBasicInfo[];
}

export interface UserBasicInfo {
  user_id: string;
  displayed_name: string;
  image_url?: string;
}

export interface FormsValueChanged {
  searchForm: boolean;
  usersForm: boolean;
}
