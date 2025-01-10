import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DialogValueChangeService } from './dialog-value.service';
import { DebounceKeyboardClickDirective } from './dialog/debounce-keyboard-click.directive';
import { DialogDirective } from './dialog/dialog.directive';
import { CopyClipboardDirective } from './dialog/share-files-ng/copy-clipboard.directive';
import { ShareFilesDialogComponent } from './dialog/share-files-ng/share-files-ng.component';
import { ShareUsersGroupComponent } from './dialog/share-users-group/share-users-group.component';
import { SharedFilesComponent } from './dialog/shared-files/shared-files.component';
import { RootDialogComponent } from './root-dialog.component';
import { ShareFilesDialogService } from './share-files-ng.service';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, AngularMultiSelectModule, NgbTooltipModule],
  declarations: [
    RootDialogComponent,
    DialogDirective,
    ShareFilesDialogComponent,
    CopyClipboardDirective,
    DebounceKeyboardClickDirective,
    ShareUsersGroupComponent,
    SharedFilesComponent,
  ],
  exports: [RootDialogComponent],
  entryComponents: [RootDialogComponent, ShareFilesDialogComponent],
  providers: [NgbActiveModal],
})
export class ShareFilesDialogModule {
  public static forRoot(): ModuleWithProviders<ShareFilesDialogModule> {
    return {
      ngModule: ShareFilesDialogModule,
      providers: [ShareFilesDialogService, DialogValueChangeService],
    };
  }
}
