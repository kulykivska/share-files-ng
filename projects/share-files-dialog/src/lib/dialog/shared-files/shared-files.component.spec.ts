import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import '@angular/localize/init';
import { findElement, findNativeElement } from '../../base-test.helpers.spec';
import { FileToShare } from '../../dialog.interface';
import { attachedFilesContentMock, getFilesToShareMock } from '../share-files-ng.mock';
import { SharedFilesComponent } from './shared-files.component';

describe('SharedFilesComponent', () => {
  let component: SharedFilesComponent;
  let fixture: ComponentFixture<SharedFilesComponent>;
  const filesToShareMock: FileToShare[] = getFilesToShareMock();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharedFilesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedFilesComponent);
    component = fixture.componentInstance;
    component.filesToShare = getFilesToShareMock();
  });

  function hasNotElement(dataTestId: string): void {
    expect(findElement(fixture, dataTestId)).toBeNull();
  }

  function hasStyleClass(dataTestId: string, className: string): void {
    expect(findNativeElement(fixture, dataTestId).classList).toContain(className);
  }

  describe('#has_attachedFilesContent', () => {
    beforeEach(() => {
      component.attachedFilesContent = attachedFilesContentMock;
      fixture.detectChanges();
    });

    filesToShareMock.forEach((fileToShare: FileToShare, index: number) => {
      it(`should have '${attachedFilesContentMock.fileTypeStyleMapper[fileToShare.file.type]}' style for ${
        fileToShare.file.type
      } file with name '${fileToShare.file.name}'`, () => {
        hasStyleClass(`file-ext-icon-${index}`, attachedFilesContentMock.fileTypeStyleMapper[fileToShare.file.type]);
      });
    });
  });

  describe('#has_not_attachedFilesContent', () => {
    beforeEach(() => {
      component.attachedFilesContent = null;
      fixture.detectChanges();
    });

    filesToShareMock.forEach((fileToShare: FileToShare, index: number) => {
      it(`should not have icon for ${fileToShare.file.type} file with name '${fileToShare.file.name}'`, () => {
        hasNotElement(`file-ext-icon-${index}`);
      });
    });
  });

  describe('#has_not_fileTypeStyleMapper', () => {
    beforeEach(() => {
      component.attachedFilesContent = { fileTypeStyleMapper: null };
      fixture.detectChanges();
    });

    filesToShareMock.forEach((fileToShare: FileToShare, index: number) => {
      it(`should not have icon for ${fileToShare.file.type} file with name '${fileToShare.file.name}'`, () => {
        hasNotElement(`file-ext-icon-${index}`);
      });
    });
  });

  describe('#file_names', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    filesToShareMock.forEach((fileToShare: FileToShare, index: number) => {
      it(`should display '${fileToShare.file.name}' as file name`, () => {
        expect(findNativeElement(fixture, `file-name-${index}`).innerText).toEqual(fileToShare.file.name);
      });
    });
  });
});
