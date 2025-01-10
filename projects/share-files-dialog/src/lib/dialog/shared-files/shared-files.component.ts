import { Component, Input } from '@angular/core';

import { AttachedFilesContent, FileToShare } from '../../dialog.interface';

@Component({
  selector: 'dntl-shared-files',
  templateUrl: './shared-files.component.html',
  styleUrls: ['./shared-files.component.scss'],
})
export class SharedFilesComponent {
  @Input() public filesToShare: FileToShare[] = [];
  @Input() public attachedFilesContent?: AttachedFilesContent;
}
