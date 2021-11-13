import { Value } from './../../interfaces/value.interface';
import {ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef} from '@angular/core';
import {HostListener, Input/*, OnChanges*/, OnInit, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

interface ValueMulti {
  single: Array<Value>;
  group: Array<Value>;
}
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements OnInit, ControlValueAccessor/*, OnChanges */ {
  private typeOfValue: string;
  optionsFiltered: Array<Value>;
  optionsMultiFiltered: ValueMulti = {
    group: null,
    single: null
  };
  isActive = false;
  select: Value;
  @Input() placeholder: string;
  @Input() label?: string;
  @Input() error?: string;
  @Input() position?: 'top';

  @Input() options: Array<Value>;
  @Input() optionsMulti: ValueMulti;
  @Input() selectedValueDefault?: Value;
  @Output() valueChange = new EventEmitter();
  _time = false;
  @Input()
    get time() { return this._time; }
    set time(val) { this._time = typeof val !== 'undefined' && val !== false }
  @Input()
  get value(): Value | any {
    return this.select;
  }
  set value(val: Value | any) {
    this.select = val;
    if (val && val.hasOwnProperty('type')) {
      this.valueChange.emit(val);
      this.select = val.value;
      return;
    }
    if (this.typeOfValue) {
      this.valueChange.emit({value: this.select, type: this.typeOfValue});
      return;
    }
    this.valueChange.emit(this.select);
  }
constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event.target'])
  clickOut(event) {
    if (!this.elementRef.nativeElement.contains(event) && this.isActive) {
      this.isActive = false;
      this.optionsFiltered = null;
      this.optionsMultiFiltered.single = null;
      this.optionsMultiFiltered.group = null;
    }
  }

  ngOnInit(): void {
  }

  chooseOption(item: Value) {
    this.select = item;
    this.value = item;
    this.isActive = !this.isActive;
    this.optionsFiltered = null;
    this.optionsMultiFiltered.single = null;
    this.optionsMultiFiltered.group = null;
    if (this.typeOfValue) {
      this.onChanged({value: item, type: this.typeOfValue});
      return;
    }
    this.onChanged(item.value);
  }
  chooseOptionMulti(item: Value, type: string) {
    this.typeOfValue = type;
    this.chooseOption(item);
  }

  onChanged(val) {}
  onTouched() {}

  registerOnChange(fn: any): void { this.onChanged = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {}
  writeValue(val: any): void { this.value = val; }
}
