import {Component, forwardRef, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ]
})
export class DatepickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  unsubscribe$ = new Subject<void>();
  dateControl = new FormControl(null);
  @Input() disableToDate?: string;
  constructor() { }

  ngOnInit() {
    this.handleDateControlChanges();
  }

  handleDateControlChanges(): void {
    this.dateControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: Date) => {
        this.onChange(value);
      });
  }

  writeValue(value: Date): void {
    console.log(value);
    this.dateControl.setValue(value);
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  onTouched = () => { };

  onChange = _ => { };
  disabledDate = (current: Date): boolean => {
    if (!this.disableToDate) { return false; }
    return moment(new Date(this.disableToDate)).diff(current, 'days') > 0;
  };
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
