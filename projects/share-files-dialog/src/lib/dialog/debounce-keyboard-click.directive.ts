import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appDebounceKeyboardClick]',
})
export class DebounceKeyboardClickDirective implements OnInit, OnDestroy {
  @Input() public debounceTime: number = 200;
  @Output() public debounceKeyUp: EventEmitter<KeyboardEvent> = new EventEmitter();

  private keyboardClick: Subject<Event> = new Subject();
  private subscription: Subscription;

  @HostListener('keyup', ['$event'])
  public clickEvent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.keyboardClick.next(event);
  }

  public ngOnInit(): void {
    this.subscription = this.keyboardClick
      .pipe(debounceTime(this.debounceTime))
      .subscribe((e: Event) => this.debounceKeyUp.emit(e as KeyboardEvent));
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
