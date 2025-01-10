import { TestBed } from '@angular/core/testing';
import { getSpy } from './base-test.helpers.spec';

import { DialogValueChangeService } from './dialog-value.service';
import { FormsValueChanged } from './dialog.interface';

describe('DialogValueChangeService', () => {
  let service: DialogValueChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(DialogValueChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  [
    {
      title: 'should set value into subject for both of forms',
      method: 'updateValue',
      startValue: { searchForm: true, usersForm: true },
      expectedValue: { searchForm: true, usersForm: true },
    },
    {
      title: 'should set true value for search form',
      method: 'updateSearchFormValue',
      startValue: true,
      expectedValue: { searchForm: true, usersForm: false },
    },
    {
      title: 'should set true value for users form',
      method: 'updateUsersFormValue',
      startValue: true,
      expectedValue: { searchForm: false, usersForm: true },
    },
  ].forEach((item: {
    title: string;
    method: string;
    startValue: boolean | FormsValueChanged;
    expectedValue: boolean | FormsValueChanged;
  }) => {
    it(`${item.title}`, () => {
      const nextSpy: jasmine.Spy = getSpy(service['valueChanged$'], 'next');
      service[item.method](item.startValue);

      expect(nextSpy).toHaveBeenCalledWith(item.expectedValue);
    });
  });

  it('should set value into subject', () => {
    const nextSpy: jasmine.Spy = getSpy(service['savedFormValue$'], 'next');
    service.saveFormValue({ name: 'sss'});

    expect(nextSpy).toHaveBeenCalledWith({ name: 'sss' });
  });

  [
    {
      title: 'should return false with similar objects',
      value: { name: 'sss' },
      startValue: { name: 'sss' },
      expectedValue: false,
    },
    {
      title: 'should return true with different objects',
      value: { name: 'sss' },
      startValue: { name: 'ssssda' },
      expectedValue: true,
    },
    {
      title: 'should return false when one of the objects is null',
      value: null,
      startValue: { name: 'ssssda' },
      expectedValue: false,
    },
    {
      title: 'should return false when both of the objects is null',
      value: null,
      startValue: null,
      expectedValue: false,
    },
  ].forEach(
    (element: {
      title: string;
      value: { name: string; };
      startValue: { name: string; };
      expectedValue: boolean;
    }) => {
      it(`${element.title}`, () => {
        const result: boolean = service.formChangeDetection(element.value, element.startValue);
        expect(result).toEqual(element.expectedValue);
      });
    },
  );
});
