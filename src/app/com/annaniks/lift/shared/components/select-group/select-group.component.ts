import {Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
interface ValueOption {
  value: string;
  name: string;
}
interface ValueGroup {
  value: string;
  placeholder?: string;
  options: Array<ValueOption>;
}
@Component({
  selector: 'app-select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectGroupComponent),
      multi: true
    }
  ]
})
export class SelectGroupComponent implements OnInit, ControlValueAccessor {
  active: number = null;
  select;
  @Input() placeholder ? = '';
  @Input() label?: string;
  @Input() error?: string;
  _options = null;
  @Input()
    get options(): Array<ValueGroup> {
        return this._options;
    }
    set options(val: Array<ValueGroup>) {
        this._options = val;
        this.select = val.map(item => ({value: item.value, option: null}));
    }
  @Output() valueChange = new EventEmitter();
  @Input()
  get value(): ValueOption | any {
    return this.select;
  }
  set value(val: ValueOption | any) {
    this.select = val;
    this.valueChange.emit(this.select);
  }
  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  clickOut(event) {
    if (!this.elementRef.nativeElement.contains(event) &&  typeof this.active === 'number') {
      this.active = null;
    }
  }

  ngOnInit(): void {
  }
  chooseOption(option: ValueOption, item: ValueGroup) {
    this.select.forEach(x => {
      if (x.value === item.value) {
        x.option = option;
      }
    });
    this.value = this.select;
    this.active = null;
    this.onChanged(this.select);
  }

  onChanged(val) {}
  onTouched() {}

  registerOnChange(fn: any): void { this.onChanged = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {}
  writeValue(val: any): void { this.value = val; }

  onBtn(i: number) {
    if (this.active !== i) {
      this.active = i;
      return;
    }
    this.active = null;
  }

  getTitle(item: ValueGroup): string {
    const select = this.select.find(x => x.value === item.value);
    return select.option ? select.option.name : item.placeholder;
  }
  isPlaceholder(item: ValueGroup): boolean {
    return !this.select.find(x => x.value === item.value).option;
  }
}
