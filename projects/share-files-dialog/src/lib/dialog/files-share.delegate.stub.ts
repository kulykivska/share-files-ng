import { Observable } from 'rxjs';
import { FileToShare, ListOfBasicUsersInfo } from '../dialog.interface';
import { getFilesToShareMock } from './share-files-ng.mock';
import { FilesShareDialogDelegateI } from './share-files-ng/share-files-ng-delegates.interface';
import { ShareFilesDialogComponent } from './share-files-ng/share-files-ng.component';

export class FilesShareDialogDelegate implements FilesShareDialogDelegateI {
  public getShareableLink(dialog: ShareFilesDialogComponent, files: FileToShare[]): Promise<FileToShare[]> {
    return Promise.resolve(getFilesToShareMock());
  }

  public removeLink(dialog: ShareFilesDialogComponent, files: FileToShare[]): Promise<FileToShare[]> {
    return Promise.resolve([]);
  }

  public shareFiles(dialog: ShareFilesDialogComponent, filesToShare: FileToShare[]): Promise<FileToShare[]> {
    return Promise.resolve([]);
  }

  public getSharedUsers(dialog: ShareFilesDialogComponent, filesToShare: string[]): Promise<ListOfBasicUsersInfo[]> {
    return Promise.resolve([]);
  }

  public showModalWindow(): Observable<boolean> {
    return new Observable();
  }
}
