# ShareFilesDialog

This library was created using [Angular CLI](https://github.com/angular/angular-cli) version 12.2.17.

## Description

`ShareFilesDialog` provides components and services for creating dialog windows that allow users to share files with others. The library supports various types of permissions for users, as well as the ability to create and delete shared links to files.

## Installation

To install the library, run the following command:

```sh
npm install share-files-ng
```


## Import Module

Import the ShareFilesDialogModule into your Angular module:

```
import { ShareFilesDialogModule } from 'share-files-ng';

@NgModule({
  imports: [
    ShareFilesDialogModule.forRoot(),
    // other modules
  ],
})
export class AppModule {}
```

## Example Usage
Create a component that will use the dialog window for file sharing:

```
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShareFilesDialogService, DialogContextArguments, FileToShare, PermissionTypes } from 'share-files-ng';

@Component({
  selector: 'app-file-share',
  template: `<button (click)="openShareDialog()">Share Files</button>`,
})
export class FileShareComponent {
  constructor(private modalService: NgbModal, private shareFilesDialogService: ShareFilesDialogService) {}

  openShareDialog(): void {
    const filesToShare: FileToShare[] = [
      {
        file: {
          entityId: '1',
          currentUserId: 'user1',
          name: 'example.txt',
          publicUrl: 'http://example.com/example.txt',
          isDirectory: false,
          type: 'document',
        },
        security: [
          { user: { id: 'user1', displayName: 'User One', email: 'user1@example.com', imageUrl: '' }, isCurrentUser: true, permission: PermissionTypes.owner },
        ],
      },
    ];

    const dialogArgs: DialogContextArguments = {
      texting: { title: 'Share Files' },
      styles: { shareButtonStyle: 'btn-primary' },
      filesToShare,
    };

    this.shareFilesDialogService.dialogShare(dialogArgs).subscribe((result) => {
      console.log('Dialog result:', result);
    });
  }
}
```

## Running the Development Server
Run ng serve to start the development server. Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.

## Creating Components
Run ng generate component component-name --project share-files-ng to create a new component. You can also use ng generate directive|pipe|service|class|guard|interface|enum|module --project share-files-ng.

## Build
Run ng build share-files-ng to build the project. The build artifacts will be stored in the dist/ directory.

## Publishing
After building your library with ng build share-files-ng, go to the dist folder cd dist/share-files-ng and run npm publish.

## Running Unit Tests
Run ng test share-files-ng to execute the unit tests via [Karma](https://karma-runner.github.io).
