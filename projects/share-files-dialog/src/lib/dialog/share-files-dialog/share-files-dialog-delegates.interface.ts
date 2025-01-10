import { Observable } from 'rxjs';
import { FileToShare, ListOfBasicUsersInfo, ShareUserViewModel } from '../../dialog.interface';
import { ShareFilesDialogComponent } from './share-files-ng.component';

export interface UsersSuggestionServiceI {
  suggestUsers(dialog: SharedComponent, keyword: string): Promise<ShareUserViewModel[]>;
}

export interface SharedComponent {
  onSearchKeywordChanged(event: KeyboardEvent): void;
  onDeSelectAllUsers(): void;
}

export interface FilesShareDialogDelegateI {
  getShareableLink(dialog: ShareFilesDialogComponent, files: FileToShare[]): Promise<FileToShare[]>;
  removeLink(dialog: ShareFilesDialogComponent, files: FileToShare[]): Promise<FileToShare[]>;
  shareFiles(dialog: ShareFilesDialogComponent, filesToShare: FileToShare[]): Promise<FileToShare[]>;
  getSharedUsers?(dialog: ShareFilesDialogComponent, userList: string[]): Promise<ListOfBasicUsersInfo[]>;
  showModalWindow?(): Observable<boolean>;
}
