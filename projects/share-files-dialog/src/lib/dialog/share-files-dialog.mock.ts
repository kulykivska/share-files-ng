import { FileTypes, PermissionTypes } from '../dialog.enum';
import {
  AttachedFilesContent,
  DialogContextArguments,
  DialogTextingResources,
  FileToShare,
  ListOfBasicUsersInfo,
  PermissionViewModel,
  PermissionsLabels,
  ShareUserViewModel,
} from '../dialog.interface';

export const user1: ShareUserViewModel = {
  id: 'aaaaa1',
  displayName: 'Eleonora',
  email: 'eleonora@example.com',
  imageUrl: '',
};

export const user2: ShareUserViewModel = {
  id: 'aaaaa2',
  displayName: 'Bob',
  email: '',
  imageUrl: '',
};

export const user3: ShareUserViewModel = {
  id: 'aaaaa3',
  displayName: 'Vasya',
  email: '',
  imageUrl: '',
};

export const fileWithoutType: FileToShare = {
  file: {
    entityId: '0',
    currentUserId: 'aaaaa1',
    name: 'file_without_type',
    publicUrl: 'example.com/ssdsd1',
    isDirectory: false,
  },
  security: [
    { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
    { user: user2, isCurrentUser: false, permission: PermissionTypes.owner },
  ],
};

export function getFilesToShareMock(): FileToShare[] {
  return [
    {
      file: {
        entityId: '1',
        currentUserId: 'aaaaa1',
        name: 'ddd1',
        publicUrl: 'example.com/ssdsd1',
        isDirectory: false,
        type: FileTypes.AUDIO,
      },
      security: [
        { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
        { user: user2, isCurrentUser: false, permission: PermissionTypes.owner },
      ],
    },
    {
      file: {
        entityId: '2',
        currentUserId: 'aaaaa1',
        name: 'ddd2',
        publicUrl: 'example.com/ssdsddasfd2',
        isDirectory: false,
        type: FileTypes.VIDEO,
      },
      security: [
        { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
        { user: user2, isCurrentUser: false, permission: PermissionTypes.reader },
      ],
    },
    {
      file: {
        entityId: '3',
        currentUserId: 'aaaaa1',
        name: 'ddd3',
        publicUrl: 'example.com/shjshjs/sajkaj3s',
        isDirectory: false,
        type: FileTypes.DOCUMENT,
      },
      security: [
        { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
        { user: user2, isCurrentUser: false, permission: PermissionTypes.owner },
      ],
    },
    {
      file: {
        entityId: '4',
        currentUserId: 'aaaaa1',
        name: 'ddd4',
        publicUrl: 'example.com/4dhfjasd8/ssdsd',
        isDirectory: false,
        type: FileTypes.IMAGE,
      },
      security: [
        { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
        { user: user2, isCurrentUser: false, permission: PermissionTypes.reader },
      ],
    },
  ];
}

export function listOfBasicUsersInfoMock(): ListOfBasicUsersInfo[] {
  return [
    {
      items: [
        {
          user_id: 'aaaaa1',
          displayed_name: 'Eleonora',
          image_url: '',
        },
        {
          user_id: 'aaaaa2',
          displayed_name: 'Bob',
          image_url: '',
        },
        {
          user_id: 'aaaaa3',
          displayed_name: '',
          image_url: '',
        },
      ],
    },
  ];
}

export function expectedPermissionViewModels(): PermissionViewModel[] {
  return [
    { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
    { user: user2, isCurrentUser: false, permission: PermissionTypes.multiple },
  ];
}

export function updatedPermissionViewModels(): PermissionViewModel[] {
  return [
    { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
    { user: user2, isCurrentUser: false, permission: PermissionTypes.owner },
  ];
}

export function updatedPermissionViewModelsOnSelect(): PermissionViewModel[] {
  return [
    { user: user1, isCurrentUser: true, permission: PermissionTypes.owner },
    { user: user2, isCurrentUser: false, permission: PermissionTypes.multiple },
    { user: user3, isCurrentUser: false, permission: PermissionTypes.reader },
  ];
}

export const attachedFilesContentMock: AttachedFilesContent = {
  fileTypeStyleMapper: {
    [FileTypes.AUDIO]: 'icon-file-audio',
    [FileTypes.VIDEO]: 'icon-file-video',
    [FileTypes.IMAGE]: 'icon-file-image',
    [FileTypes.DOCUMENT]: 'icon-file-document',
  },
};

export const defaultPermissionsLabels: PermissionsLabels = {
  multiple: 'Multiple',
  owner: 'Owner',
  reader: 'Reader',
  writer: 'owner',
};

export const defaultTextings: DialogTextingResources = {
  title: 'Files',
  shareToLabel: 'To user:',
};

export const argumentsMock: (
  shareLinkAble?: boolean,
  injectedPermission?: PermissionTypes,
  filesToShare?: FileToShare[],
) => DialogContextArguments = (
  shareLinkAble: boolean = false,
  injectedPermission: PermissionTypes = PermissionTypes.owner,
  filesToShare: FileToShare[] = getFilesToShareMock(),
) => {
  const args: DialogContextArguments = {
    texting: defaultTextings,
    styles: {
      unshareButtonStyle: 'icon-cross',
    },
    filesToShare,
    shareLinkAble,
    permissionsLabels: defaultPermissionsLabels,
    injectedPermission,
    attachedFilesContent: {
      fileTypeStyleMapper: {
        [FileTypes.AUDIO]: 'icon-file-audio',
        [FileTypes.VIDEO]: 'icon-file-video',
        [FileTypes.IMAGE]: 'icon-file-image',
        [FileTypes.DOCUMENT]: 'icon-file-document',
      },
    },
    hasChangesCheck: true,
  };
  return args;
};
