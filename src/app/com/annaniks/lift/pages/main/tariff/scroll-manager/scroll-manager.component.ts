import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPeriodLocal } from '../../../../shared/interfaces/tariff.interface';

@Component({
  selector: 'app-scroll-manager',
  templateUrl: './scroll-manager.component.html',
  styleUrls: ['./scroll-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollManagerComponent implements OnInit {

  @Output() onChangePeriod: EventEmitter<number> = new EventEmitter();

  @Input()
  discounts: IPeriodLocal[];

  @Input()
  firstVisibleButton = 0;

  private _numberOfVisibleButtons: number;
  public lastVisibleButton: number;
  @Input() set numberOfVisibleButtons(value: number) {
    this._numberOfVisibleButtons = value;
    this.lastVisibleButton = this.firstVisibleButton + this._numberOfVisibleButtons - 1;
  }

  constructor() { }

  ngOnInit() {
  }

  public getPeriodText(index: number): string {
    const value = this.discounts[index].accountNumber;
    if (index < 1 && value < 5) {
      return `1 аккаунт`;
    } else {
      if (value < 2) {
        return `${value} аккаунт`;      // 1
      } else if (value > 4) {
        return `${value} аккаунтов`;    // 5, 6, ...
      } else {
        return `${value} аккаунта`;     // 2, 3, 4
      }
    }
  }

  toggleDiscount(index: number, evt: any) {
    evt.stopPropagation();
    this.discounts.forEach((x: IPeriodLocal, i: number) => {
      x.isSelected = index === i;
    });
    this.onChangePeriod.emit(index);
  }

  scrollRight(evt) {
    evt.stopPropagation();
    if (this.firstVisibleButton + this._numberOfVisibleButtons < this.discounts.length) {
      this.firstVisibleButton += 1;
      this.lastVisibleButton += 1;
    }
  }
  scrollLeft(evt) {
    evt.stopPropagation();
    if (this.firstVisibleButton > 0) {
      this.firstVisibleButton -= 1;
      this.lastVisibleButton -= 1;
    }
  }
}
