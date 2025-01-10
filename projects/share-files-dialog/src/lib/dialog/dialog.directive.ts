import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[share-dialog-host]',
})
export class DialogDirective {
  public constructor(public viewContainerRef: ViewContainerRef) {}
}
