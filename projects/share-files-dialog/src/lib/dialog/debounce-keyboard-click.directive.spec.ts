import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import '@angular/localize/init';
import { By } from '@angular/platform-browser';
import { DebounceKeyboardClickDirective } from './debounce-keyboard-click.directive';

@Component({
  template: ` <div appDebounceKeyboardClick (debounceKeyUp)="onDebounceKeyUp($event)"></div> `,
})
class TestComponent {
  public onDebounceKeyUp(event: KeyboardEvent): void {}
}

describe('DebounceKeyboardClickDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: DebounceKeyboardClickDirective;
  let element: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DebounceKeyboardClickDirective],
    });
    fixture = TestBed.createComponent(TestComponent);
    element = fixture.debugElement.query(By.directive(DebounceKeyboardClickDirective));
    directive = element.injector.get(DebounceKeyboardClickDirective);
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit the event after the debounce time', fakeAsync((done: DoneFn): void => {
    spyOn(fixture.componentInstance, 'onDebounceKeyUp');
    const keyboardEvent: KeyboardEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    element.triggerEventHandler('keyup', keyboardEvent);
    fixture.detectChanges();
    expect(fixture.componentInstance.onDebounceKeyUp).not.toHaveBeenCalled();

    tick(directive.debounceTime);

    expect(fixture.componentInstance.onDebounceKeyUp).toHaveBeenCalledWith(keyboardEvent);
  }));
});
