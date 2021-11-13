import { OptionInterface } from './../types/option.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

const INITIAL_STATE: OptionInterface[] = [
  {
    value: 'hashtag',
    name: 'По хештегам',
    isActive: true,
  },
  {
    value: 'subscriber',
    name: 'На подписчиков аккаунтов',
    isActive: true,
  },
  {
    value: 'location',
    name: 'На аккаунты в рамках локации',
    isActive: true,
  },
/*  {
    value: 'likes',
    name: 'На лайкеров аккаунтов',
    isActive: true,
  },
  {
    value: 'comment',
    name: 'На активных комментаторов',
    isActive: true,
  }, */
];

@Injectable()
export class OptionsStore {
  public options: Observable<OptionInterface[]>;

  private _options = new BehaviorSubject<OptionInterface[]>(INITIAL_STATE);

  constructor() {
    this.options = this._options.asObservable();
  }

  public getOptionById(optionId: string): OptionInterface {
    return this._options.getValue()
      .find((option: OptionInterface) => option.value === optionId);
  }

  public setActiveOption(optionId: string): void {
    this.setActiveById(optionId, true);
  }

  public setInactiveOption(optionId: string): void {
    this.setActiveById(optionId, false);
  }

  private setOptions(options: OptionInterface[]) {
    this._options.next(options);
  }

  private setActiveById(optionId: string, active: boolean): void {
    const filteredOptions = this._options.getValue()
    .map((option: OptionInterface) => {
      if (option.value === optionId) {
        const unselectedOption = Object.assign({}, option);
        unselectedOption.isActive = active;
        return unselectedOption;
      } else {
        return option;
      }
    });
    this.setOptions(filteredOptions);
  }
}
