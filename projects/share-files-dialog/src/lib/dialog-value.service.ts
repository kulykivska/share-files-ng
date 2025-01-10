import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormsValueChanged } from './dialog.interface';
import { isEqualObjects } from './dialog/share-files-ng.helper';

@Injectable({
  providedIn: 'root',
})
export class DialogValueChangeService {
  private savedFormValue$: BehaviorSubject<object> = new BehaviorSubject({});
  private valueChanged$: BehaviorSubject<FormsValueChanged> =
    new BehaviorSubject<FormsValueChanged>({searchForm: false, usersForm: false});

  public get savedFormValueChanged(): Observable<object> {
    return this.savedFormValue$.asObservable();
  }

  public get valueChanged(): Observable<FormsValueChanged> {
    return this.valueChanged$.asObservable();
  }

  public updateValue(value: FormsValueChanged): void {
    this.valueChanged$.next(value);
  }

  public updateSearchFormValue(value: boolean): void {
    const currentValue: FormsValueChanged = this.valueChanged$.getValue();
    currentValue.searchForm = value;
    this.valueChanged$.next(currentValue);
  }

  public updateUsersFormValue(value: boolean): void {
    const currentValue: FormsValueChanged = this.valueChanged$.getValue();
    currentValue.usersForm = value;
    this.valueChanged$.next(currentValue);
  }

  public saveFormValue(value: object): void {
    this.savedFormValue$.next(value);
  }

  public formChangeDetection(value: object, startValue: object): boolean {
    if (value && startValue) {
      return !isEqualObjects(value, startValue);
    } else {
      return false;
    }
  }
}
