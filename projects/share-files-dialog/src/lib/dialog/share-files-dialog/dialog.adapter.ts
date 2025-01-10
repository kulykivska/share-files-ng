import {
  FileToShare,
  ListOfBasicUsersInfo,
  PermissionViewModel,
  ShareUserViewModel,
  UserBasicInfo,
  UserSelectValue,
} from '../../dialog.interface';

/**
 * @description Converts ShareUserViewModel[] model to ShareUserViewModel
 * @param Suggested users list. Instance of ShareUserViewModel[].
 */
export function shareUserViewModelToUserSelectValueAdapter(users: ShareUserViewModel[]): UserSelectValue[] {
  return users.map((user: ShareUserViewModel) => {
    return {
      itemName: user.displayName,
      id: user.id,
      image: user.imageUrl,
    };
  });
}

export function listOfBasicUsersToShareUserViewModel(
  users: ListOfBasicUsersInfo[],
  assosiations: PermissionViewModel[],
): PermissionViewModel[] {
  const model: PermissionViewModel[] = [];
  assosiations.forEach((viewModel: PermissionViewModel) => {
    const currentUser: UserBasicInfo = users[0].items.find((user: UserBasicInfo) => user.user_id === viewModel.user.id);
    if (currentUser) {
      model.push({
        user: {
          id: currentUser.user_id,
          displayName: currentUser.displayed_name,
          email: '',
          imageUrl: currentUser.image_url,
        },
        permission: viewModel.permission,
        isCurrentUser: viewModel.isCurrentUser,
      });
    }
  });
  return model;
}

/**
 * @description Converts FileToShare[] model to string
 * @param filesToShare Files to share. Instance of FileToShare[]
 * @param linkSeparator Links separator. Default value is '; '. Instance of string.
 */
export function filesShareToStringAdapter(filesToShare: FileToShare[], linkSeparator: string): string {
  return filesToShare.map((fileToShare: FileToShare) => fileToShare.file.publicUrl).join(linkSeparator || '; ');
}
