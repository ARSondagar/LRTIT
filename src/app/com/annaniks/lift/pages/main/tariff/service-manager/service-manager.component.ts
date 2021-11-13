import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, AfterViewInit  } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, finalize, throttleTime } from 'rxjs/operators';
import { IAccount, IAccountLocal, IcalculationState } from '../../../../shared/interfaces/tariff.interface';
import { IPostTariff} from '../../../../shared/interfaces/user.details.interface';
import { IPeriodLocal, IServiceLocal } from '../../../../shared/interfaces/tariff.interface';
import { IPromoCode, IScrollValue } from '../../../../shared/interfaces/tariff.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector'
import { select, Store } from '@ngrx/store';
import { currentUserSelector } from '../../../auth/store/selectors';
import { User } from '../../../../core/models/user';
import { AuthService } from '../../../auth/auth.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { TarifDataService } from '../../../../shared/services/tarif-data.service';
import { TARIFF_SLIDER_CONFIG } from '../tariff-new/tariff-sliders-config';

const LARGE_SCREEN = 887;

const CALCULATION_STATE_ZERO: IcalculationState = {
  selectedAccount: 0,             // Выбранное число аккаунтов
  userSelectedSvc: [],            // Иыбранные пщдьзоватем сервисы
  selectedDiscountIndex: 0        // Индех выбранного периода
}

function round(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

@Component({
  selector: 'app-service-manager',
  templateUrl: './service-manager.component.html',
  styleUrls: ['./service-manager.component.scss']
})
export class ServiceManagerComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  statEnabled: boolean;

  selectedAccount: string;
  selectedAccountObject: IAccountLocal;
  private _availableAccounts: IAccountLocal[];

  @Input()
  get availableAccounts(): IAccountLocal[] { return this._availableAccounts; }
  set availableAccounts(value: IAccountLocal[]) {
    this._availableAccounts = _.filter(value, x => x.id > 0);
    const selectedIndex = Math.max(this._availableAccounts.findIndex(x => x.isSelected), 0);
    this.selectedOption = this._availableAccounts[selectedIndex].sAmount;
  }

  @Input()
  discountPercent: number;

  @Input()
  balans: number;

  private currentUser: User;
  private _sliders: IServiceLocal[];
  private isLoading = false;
  public dailyTotalValue = 0;
  public finishDateNew = '';

  public selectedOption: string;
  totalDiscountPercent = 0;

  @Input()
  get sliders(): IServiceLocal[] { return this._sliders; }
  set sliders(value: IServiceLocal[]) {
    this._sliders = _.filter(value, x => x.id > 0);
    this.promotionsInColumn = Math.ceil(this._sliders.length / 2);
    const newcalCulationState = Object.assign({},
                                       this._calculationState$.value,
                                       {userSelectedSvc: value.filter(x => x.isOrdered)});
    this._calculationState$.next(newcalCulationState);
  }

  promotionsInColumn: number | null = null;

  @Input()
  discounts: IPeriodLocal[];

  @Input()
  promo: IPromoCode;

  @Output()
  dailyTotal = new EventEmitter<number>();

  @ViewChild('username', {static: true}) input: ElementRef<HTMLInputElement>;

  selectAll = false;

  _accountOptionOpened = false;

  firstVisibleButton: number;
  numberOfVisibleButtons = 4;
  scrolling: IScrollValue[] = [
    { value: 0, isActive: true},
    { value: 1, isActive: false},
    { value: 2, isActive: false},
    { value: 3, isActive: false}
  ]

  @ViewChild('promoCodeInput', {static: true})
  promoCod: ElementRef;

  @ViewChild('usagePeriod', {static: true})
  usagePeriod: ElementRef;

  totalBasicPrice = 0;
  totalDiscount = 0;
  totalFinalPrice = 0;
  totalFeeFinalPriceAll = 0;
  totalFeeBasicPriceAll = 0;
  totalFeeDiscountAll = 0;
  totalDiscounted = 0;

  noDiscountTotalFeeBasicPrice = 0;
  noDiscountTotalFeeBasicPriceAll = 0;
  discountForAccounts = 0;

  listIsVisible: boolean;

  private _periodSizeObserver$: BehaviorSubject<number[]>;   // [Index_of_first_element, Number_of _visible_elements]
  public periodSizeObserver$: Observable<number[]>;

  private _calculationState$: BehaviorSubject<IcalculationState>;
  public calculationState$: Observable<IcalculationState>;

  private subscription: Subscription;

  totalFeeBasicPrice = 0;
  totalFeeDiscount = 0;
  totalFeeFinalPrice = 0;
  periodDiscount = 0;
  discountForAll = 0;
  totalWithoutDiscount = 0;

  public profileForm: FormGroup;

  sliderConfig = TARIFF_SLIDER_CONFIG;

  constructor(private store: Store,
              private deviceService: DeviceDetectorService,
              private _authSvc: AuthService,
              private _toastrService: ToastrService,
              private _tarifDataSvc: TarifDataService,
              private fb: FormBuilder
    ) {
    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
      this.profileForm = this.fb.group({
        commentsTextArea: ''
      });
    });

    this._periodSizeObserver$ = new BehaviorSubject<number[]>([0, 4]);
    this.periodSizeObserver$ = this._periodSizeObserver$.asObservable();

    this.periodSizeObserver$.pipe(
        // throttleTime(200),
        distinctUntilChanged()
      ).subscribe((x: number[]) => {
        this.firstVisibleButton = x[0];
        this.numberOfVisibleButtons = x[1];
      });
    this._calculationState$ = new BehaviorSubject<IcalculationState>(CALCULATION_STATE_ZERO);
    this.calculationState$ = this._calculationState$.asObservable();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onResize(event) {
    this.buildObserver()
  }

  ngAfterViewInit(): void {
    this.buildObserver();
  }

  private buildObserver(): void {
    const div: HTMLElement = document.getElementById('usage-period');
    if (div) {
      let countVisibleButtons: number;
      if (div.clientWidth > 835) {
        countVisibleButtons = 4;
      } else if (div.clientWidth > 600) {
        countVisibleButtons = 3;
      } else {
        countVisibleButtons = 2;
      }
      this._periodSizeObserver$.next([0, countVisibleButtons]);
    } else {
      this._periodSizeObserver$.next([0, 4]);
    }
  }

  ngOnInit() {
    this.listIsVisible = true;
    this.firstVisibleButton = 0;

    const account = this.availableAccounts.find(x => x.isSelected) || this.availableAccounts[0];
    if (!account.isSelected) {
      account.isSelected = true;
    }
    this.selectedAccount = account.amountAccounts.toString();
    this.selectedAccountObject = account;
    const newState: IcalculationState = this.buildCalculationState();

    this.discounts.forEach(x => {
      x.accountNumber = parseInt(this.selectedAccount, 10);
    });

    this._calculationState$.next(newState);
    this.subscription = this.calculationState$.subscribe(
      val => this.processCalculations(val)
    );
  }

  private buildCalculationState(): IcalculationState {
    const initialState: IcalculationState = this._calculationState$.value;
    const selectedDscIndex = Math.max(this.discounts.findIndex(x => x.isSelected), 0);
    if (!this.discounts[selectedDscIndex].isSelected) {
      this.discounts[selectedDscIndex].isSelected = true;
    }

    const rzlt: IcalculationState = Object.assign(initialState, {
      selectedAccount: parseInt(this.selectedAccount, 10),
      selectedDiscountIndex: selectedDscIndex
    });
    return rzlt;
  }

  private assignSelectedAccount(account: IAccountLocal): void {
    this.selectedAccount = account.amountAccounts.toString();
    this.selectedAccountObject = account;

    this.availableAccounts.forEach(x => {
      x.isSelected = x.id === account.id;
    })
    const numberOfAccounts = account.amountAccounts;
    this.discounts.forEach(x => {
      x.accountNumber = numberOfAccounts;
    });
    const prevState: IcalculationState = this._calculationState$.value;
    const rzlt: IcalculationState = Object.assign(prevState, {selectedAccount: numberOfAccounts});
    this._calculationState$.next(rzlt);
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

  toggleAccountOptionOpened() {
    setTimeout(() => {
      this._accountOptionOpened = !this._accountOptionOpened
      const ulElement = document.getElementById('custom-select-block');
      ulElement.style.display = this._accountOptionOpened ? 'block' : 'none';
    });
  }

  selectAccountOption(i: number, evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const selectedAcnt = this.availableAccounts[i];
    if (this.selectedAccount !== selectedAcnt.amountAccounts.toString()) {
      this.assignSelectedAccount(selectedAcnt);
    }
    this.toggleAccountOptionOpened();
  }

  getItemName(item: IAccount): string {
    return `${item.value} ${item.text}`;
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.sliders.forEach(x => {
      x.isOrdered = this.selectAll;
    });
    this.modifyPromoState();
  }
  private  modifyPromoState(): void {
    const prevState: IcalculationState = this._calculationState$.value;
    const rzlt: IcalculationState = Object.assign(prevState, {
      userSelectedSvc: this.sliders.filter(x => x.isOrdered)
    });
    this._calculationState$.next(rzlt);
  }

  toggleChecked(promo: IServiceLocal) {
    promo.isOrdered = !promo.isOrdered;
    this.selectAll = !this.sliders.some(x => !x.isOrdered);
    this.modifyPromoState();
  }

  getPromoList(isLeft: boolean): IServiceLocal[] {
    if (!this.sliders || this.sliders.length < 1 || !this.promotionsInColumn) {
      return [] as IServiceLocal[];
    }
    if (isLeft) {
      return this.sliders.slice(0, this.promotionsInColumn);
    } else {
      return this.sliders.slice(this.promotionsInColumn);
    }
  }

  getSelectedPeriod(): number {
    if (!this.discounts || this.discounts.length < 1) {
      return 30;
    }
    const i = Math.max(this.discounts.findIndex(x => x.isSelected), 0);
    return this.discounts[i].days;
  }

  getFinalprice(disc: IPeriodLocal) {
    let rzlt = disc.totalSumm;
    if ( disc.discount > 0) {
      const discountValue = Math.floor(disc.totalSumm * disc.discount / 100.0);
      rzlt -= discountValue;
    }
    return rzlt;
  }

  toggleDiscount(index: number) {
    const prevState: IcalculationState = this._calculationState$.value;
    const rzlt: IcalculationState = Object.assign(prevState, {
      selectedDiscountIndex: index
    });
    this._calculationState$.next(rzlt);
  }

  scrollHorizontal(scrollIndex: number) {
    for (let i = 0; i < this.scrolling.length; i++) {
      if (i === scrollIndex) {
        this.scrolling[i].isActive = true;
        this.firstVisibleButton = i;

      } else {
        this.scrolling[i].isActive = false;
      }
    }
  }

  processCalculations(state: IcalculationState) {
    const numberOfAccounts = state.selectedAccount;
    // discountPercents[0] - discount for accounts
    // discountPercents[1] - discount for all services
    // discountPercents[2] - discount for period

    // discountPercents[3] - количество дней
    // discountPercents[4] - summ for selected services ignoring days and accaunts (продвижение)

    const discountPercents: number[] = this.calculatDiscounts()
    this.calculateTotals(numberOfAccounts, discountPercents);

    const dicountCopy = Array.from(this.discounts);
    dicountCopy.forEach(x => this.calculatePeriods(x, numberOfAccounts, discountPercents));
    this.discounts = dicountCopy;

    this.dailyTotal.emit(this.dailyTotalValue);
    this.finishDateNew = this._tarifDataSvc.getValidUntilDate(this.balans, this.dailyTotalValue);
  }

  private calculatePeriods(dsc: IPeriodLocal, numberOfAccounts: number, discountPercents: number[]) {
    dsc.accountNumber = numberOfAccounts;
    dsc.totalSummNoDiscount = Math.round(numberOfAccounts * discountPercents[4] * dsc.days / 30);
    const discountValue = Math.round(dsc.totalSummNoDiscount - dsc.totalSummNoDiscount *
      (1 - dsc.discount / 100) * (1 -  discountPercents[1] / 100) * (1 - discountPercents[0] / 100)
    );
    dsc.totalSummDiscounted = dsc.totalSummNoDiscount - discountValue;
  }
  private calculateTotals(numberOfAccounts: number, discountPercents: number[]) {
    this.noDiscountTotalFeeBasicPriceAll = Math.round(
      Math.round(numberOfAccounts * discountPercents[4] * discountPercents[3] / 30)
    );
    this.totalDiscount = Math.round(this.noDiscountTotalFeeBasicPriceAll - this.noDiscountTotalFeeBasicPriceAll *
      (1 - discountPercents[2] / 100) * (1 -  discountPercents[1] / 100) * (1 - discountPercents[0] / 100)
    );
    this.totalDiscounted = this.noDiscountTotalFeeBasicPriceAll - this.totalDiscount;
    this.dailyTotalValue = Math.round(this.totalDiscounted / discountPercents[3]);
    this.totalDiscountPercent = discountPercents[2];
  }
  private calculatDiscounts(): number[] {
    const rzlt: number[] = [];
    const hasUnselected = this.sliders.some(x => !x.isOrdered);
    const i = Math.max(this.discounts.findIndex(x => x.isSelected), 0);

    rzlt.push(this.selectedAccountObject ? this.selectedAccountObject.discount : 0);  // 0
    rzlt.push(hasUnselected ? 0 : this.discountPercent);                              // 1
    rzlt.push(this.discounts[i].discount);                                            // 2

    rzlt.push(this.discounts[i].days);                                                // 3
    rzlt.push(this.sliders.reduce(                                                    // 4
        (acc: number, x: IServiceLocal) => x.isOrdered ? acc + x.price : acc, 0)
    );
    return rzlt;
  }

  onClickSubmit() {
    const rzlt: IPostTariff = this.collectPostTariff();
    this.isLoading = true;
    this._authSvc.setServices(rzlt).pipe(
      finalize(() => {
        this.isLoading = false;
    })).subscribe(
      resp => {
        console.log(resp);
        if (resp.code === 200 && resp.data && resp.data.confirmation && resp.data.confirmation.confirmation_url) {
          window.location.href = resp.data.confirmation.confirmation_url;
        }
      },
      err => {
        console.log(err);
        this._toastrService.error(err.error.data);
    });
  }

  private collectPostTariff(): IPostTariff {
    const i: number = Math.max(this.discounts.findIndex(x => x.isSelected), 0);
    const selDiscount: IPeriodLocal = this.discounts[i];
    const j =  Math.max(this.availableAccounts.findIndex(x => x.isSelected), 0);
    const selAccount: IAccountLocal = this.availableAccounts[j];

    const rzlt: IPostTariff = {
      userId: this.currentUser.id,
      services: this.sliders.map(x => {
        return {
          id: x.id,
          active: x.isOrdered,
        };
      }),
      accounts: {
        id: selAccount.id
      },
      periods: {
        id: selDiscount.id
      }
    };

    return rzlt;
  }

  onClickSave() {
    const rzlt: IPostTariff = this.collectPostTariff();
    this.isLoading = true;
    this._authSvc.saveServices(rzlt).pipe(
      finalize(() => {this.isLoading = false;
    })).subscribe(
      resp => {
        console.log(resp);
        this.isLoading = false;
        this._toastrService.success('Изменение успешно сохранены');
      },
      err => {
        console.log(err);
        this._toastrService.error(err.error.data);
    });
  }

}
