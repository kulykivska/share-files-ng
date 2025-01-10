import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { FileToShare, ShareModalArgumentsInterface } from './dialog.interface';

@Injectable({ providedIn: 'root' })
export class ShareFilesDialogService {
  public dialogState: Subject<ShareModalArgumentsInterface> = new Subject();
  public dialogResponse: Subject<boolean | string | FileToShare[]> = new Subject();

  public dialogShare(modalArguments: ShareModalArgumentsInterface): Observable<boolean | string | FileToShare[]> {
    return this.openDialog(modalArguments);
  }

  private openDialog(modalArguments: ShareModalArgumentsInterface): Observable<boolean | string | FileToShare[]> {
    this.dialogState.next(modalArguments);
    return this.dialogResponse.asObservable();
  }
}
