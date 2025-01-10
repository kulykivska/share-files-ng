import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';

import { DialogValueChangeService } from './dialog-value.service';
import { FileToShare, FormsValueChanged, ModalDialog, ShareModalArgumentsInterface } from './dialog.interface';
import { unsubscribeAll } from './dialog/share-files-ng.helper';
import { FilesShareDialogDelegateI } from './dialog/share-files-ng/share-files-ng-delegates.interface';
import { ShareFilesDialogComponent } from './dialog/share-files-ng/share-files-ng.component';
import { ShareFilesDialogService } from './share-files-ng.service';

@Component({
  selector: 'dntl-share-dialog',
  templateUrl: './root-dialog.component.html',
})
export class RootDialogComponent implements OnInit, OnDestroy {
  /**
   * @subscriptions$ - subscriptions for all subscribe methods
   * @dynamicModalComponent - dynamic component transferable as argument for open modal instance
   * @modalRef - reference to the newly opened modal returned by the `NgbModal.open()` method.
   * @dialogResponse - Observable returns data after close modalRef.result
   * @modalArguments - arguments to be shown as modal content
   */
  public subscriptions$: Subscription[] = [];
  public modalRef: NgbModalRef;
  public filesShareDialog: ModalDialog;
  public isFormChanged: boolean;
  public dialogResponse: Subject<boolean | string | FileToShare[]>;
  private dialogArguments: ShareModalArgumentsInterface;
  private filesShareDialogDelegate: FilesShareDialogDelegateI;

  public constructor(
    public filesShareDialogService: ShareFilesDialogService,
    public modalService: NgbModal,
    private valueChangeService: DialogValueChangeService,
  ) {}

  public ngOnInit(): void {
    this.dialogSubscriptionInit();
    this.subscribeToModalWindowChanges();
  }

  public ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions$);
  }
  /**
   * @description Tracks the clie along the backdrop and, if there are changes
   *             in the form, shows a modal window with a warning about not saving the data.
   * @param {HTMLElement} target
   */
  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    if (target.classList.contains('modal-window-backdrop') && this.dialogArguments.context.hasChangesCheck) {
      if (this.isFormChanged) {
        this.subscriptions$.push(
          this.filesShareDialogDelegate.showModalWindow().subscribe((value: boolean) => {
            if (value) {
              this.valueChangeService.updateValue({ searchForm: false, usersForm: false });
              this.modalService.dismissAll();
            }
          }),
        );
      }
    }
  }

  public openDialog(): void {
    this.modalRef = this.modalService.open(this.filesShareDialog, {
      centered: true,
      beforeDismiss: () => {
        if (this.dialogArguments.context.hasChangesCheck) {
          return !this.isFormChanged;
        }
        return true;
      },
      windowClass: 'modal-window-backdrop',
    });

    if (!this.modalRef) {
      return;
    }

    this.initModalArguments();
    this.onCloseDialogAction();
  }

  public initModalArguments(): void {
    this.modalRef.componentInstance.arguments = this.dialogArguments.context;
    this.modalRef.componentInstance.setUsersSuggestionDelegate(this.dialogArguments.usersSuggestionDialogDelegate);
    this.modalRef.componentInstance.setFilesShareDelegate(this.dialogArguments.filesShareDialogDelegate);
  }

  /* The promise that is resolved when the modal is closed and rejected when the modal is dismissed. */
  public onCloseDialogAction(): void {
    this.modalRef.result.then(
      (result: boolean | string | FileToShare[]) => this.dialogResponse.next(result),
      (error: boolean) => this.dialogResponse.next(error),
    );
  }

  /**
   * Subscription for modal state within notificationService
   * @modalArguments - receiving variables
   * @setModalComponent - set dynamic component for modal
   * @openDialog - main method for show necessary modal
   */
  private dialogSubscriptionInit(): void {
    this.dialogResponse = this.filesShareDialogService.dialogResponse;
    this.subscriptions$.push(
      this.filesShareDialogService.dialogState.subscribe(
        (modalArguments: ShareModalArgumentsInterface) => {
          this.dialogArguments = modalArguments;
          this.filesShareDialog = ShareFilesDialogComponent;
          this.filesShareDialogDelegate = modalArguments.filesShareDialogDelegate;
          this.openDialog();
        },
        (error: Error) => this.dialogResponse.next(`${error}`),
      ),
    );
  }

  private subscribeToModalWindowChanges(): void {
    this.subscriptions$.push(
      this.valueChangeService.valueChanged.subscribe((value: FormsValueChanged) => {
        this.isFormChanged = value.searchForm || value.usersForm;
      }),
    );
  }
}
