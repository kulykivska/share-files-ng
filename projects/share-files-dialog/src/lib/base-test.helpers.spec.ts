import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// tslint:disable: no-any typedef
export const fakeEvent: any = {
  preventDefault: () => {},
  stopPropagation: () => {},
};

export function findElementBySelector<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}

export function findElement<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(`[data-test-id="${selector}"]`));
}

export function findNativeElement<T>(fixture: ComponentFixture<T>, selector: string): HTMLElement {
  return findElement(fixture, selector).nativeElement;
}

export function emitClickOnElement<T>(fixture: ComponentFixture<T>, selector: string): void {
  findNativeElement(fixture, selector).click();
}

export function emitCancelClick(
  fixture: ComponentFixture<any>,
  selector: string,
  router: string,
  method: string,
  path?: string,
): void {
  const cancelSpy: jasmine.Spy<() => void> = getSpy(fixture.componentInstance, 'cancel');
  const navigation: jasmine.Spy<any> = getSpy(fixture.componentInstance[router], method);

  emitClickOnElement(fixture, selector);
  fixture.detectChanges();

  expect(cancelSpy).toHaveBeenCalled();
  path ? expect(navigation).toHaveBeenCalledWith(path) : expect(navigation).toHaveBeenCalled();
}

export function getSpy(object: any, method: string): jasmine.Spy<any> {
  return spyOn<any>(object, method).and.callThrough();
}

export function callUnsubscribeOnDestroy(targetClass: any, subscription$: string): void {
  targetClass.ngOnInit();
  spyOn(targetClass[subscription$], 'unsubscribe');
  targetClass.ngOnDestroy();
  expect(targetClass[subscription$].unsubscribe).toHaveBeenCalledTimes(1);
}

export function checkHint(fixture: ComponentFixture<any>, selector: string, expectedHint: string): void {
  const element: HTMLElement = findNativeElement(fixture, selector);
  expect(element.innerText).toEqual(expectedHint);
}

/**
 * Finds html element by its data-test-id
 * @param { ComponentFixture<T> } fixture
 * @param { string } id
 */
export function getElemById<T>(fixture: ComponentFixture<T>, id: string) {
  return fixture.nativeElement.querySelector(`[data-test-id="${id}"]`);
}

/**
 * Finds all html elements by it class name
 * @param { ComponentFixture<T> } fixture
 * @param { string } style
 */
export function getAllElemsByClassName<T>(fixture: ComponentFixture<T>, style: string) {
  return fixture.nativeElement.querySelectorAll(`.${style}`);
}

/**
 * Finds debug element by component name
 * @param { ComponentFixture<T> } fixture
 * @param T
 */
export function getElemByDirective<T>(fixture: ComponentFixture<T>, T): DebugElement {
  return fixture.debugElement.query(By.directive(T));
}

/**
 * Finds list of debug elements by component name
 * @param { ComponentFixture<T> } fixture
 * @param T
 */
export function getElemsByDirective<T>(fixture: ComponentFixture<T>, T): DebugElement[] {
  return fixture.debugElement.queryAll(By.directive(T));
}

/**
 * Returns fetched from the injector a T directive instance
 * @param { DebugElement } elem
 * @param T
 */
export function getDirective<T>(elem: DebugElement, T): T {
  return elem.injector.get(T);
}
// tslint:enable: no-any typedef
