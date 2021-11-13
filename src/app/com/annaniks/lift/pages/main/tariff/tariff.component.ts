import { Component, OnInit, OnDestroy } from '@angular/core';
import { TariffService } from './tariff.service';
import { TariffTransaction, Tariff, TariffPayload, Promocode } from '../../../core/models/tariff';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MainService } from '../main.service';
import { NavbarService } from '../../../core/services/navbar.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Globals } from '../../../core/services/globals';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-tariff',
    templateUrl: 'tariff.component.html',
    styleUrls: ['tariff.component.scss']
})

export class TariffComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public tariff: Tariff;
    public localImage: string = 'assets/images/boy.png';
    public tariffTransaction: TariffTransaction[] = [];
    public amountWithPackage = 0;
    public totalAmount = 0;
    public totalAmountForAMonth = 0;
    public totalAmountForThreeMonths = 0;
    public totalAmountForSixMonths = 0;
    public totalAmountForTwelveMonths = 0;
    public page: number = 1;
    public loading: boolean = false;
    public tarifForm: FormGroup;
    public promocodeControl = new FormControl('')
    public promocode: Promocode;
    public missingPromocode: boolean;
    constructor(
        private _tariffService: TariffService,
        private _mainService: MainService,
        private _navbarService: NavbarService,
        private _fb: FormBuilder,
        private _toastrService: ToastrService,
        public globals: Globals,
    ) {
        this._navbarService.setNavbarItems([]);
    }

    ngOnInit() {
        // this._getTariff();
        this._initForm();
        // this._getTariffTransaction();
    }


    private _getTariff(): void {
        this._tariffService.getTariff()
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                this.tariff = { image: 'assets/images/post2.png', current: 'Текущий тариф', type: 'Оптимальный', paid: '15.03.2020' };
                this.localImage = this.tariff.image;
            })
    }

    private _initForm(): void {
        console.log('Initing Form');

        this.tarifForm = this._fb.group({
            accountCount: 1,
            statistics: false,
            likes: false,
            autosubscribe: this._fb.group({
                status: false,
                watchStories: false,
                manageComments: false,
                direct: false,
                fortuna: false,
                unsubscribe: false
            }),
            promocode: this._fb.group({
                status: false,
                value: ''
            }),
            autoposting: false,
            tariffPackage: '30'
        })

        this.tarifForm.get('autosubscribe.status').valueChanges.subscribe((status: boolean) => {
            if (status) {
                this.tarifForm.get('autosubscribe').patchValue({
                    watchStories: true,
                    manageComments: true,
                    direct: true,
                    fortuna: true,
                    unsubscribe: true
                })
            } else {
                this.tarifForm.get('autosubscribe').patchValue({
                    watchStories: false,
                    manageComments: false,
                    direct: false,
                    fortuna: false,
                    unsubscribe: false
                })
            }
        })

        this.tarifForm.valueChanges.subscribe(data => {
            this.totalAmount = this._updateTotalAmount(data)
            this.totalAmountForAMonth = this.totalAmount;
            this.totalAmountForThreeMonths = Math.floor(this.totalAmount * 3 - this.totalAmount * 3 * 0.1);
            this.totalAmountForSixMonths = Math.floor(this.totalAmount * 6 - this.totalAmount * 6 * 0.2);
            this.totalAmountForTwelveMonths = Math.floor(this.totalAmount * 12 - this.totalAmount * 12 * 0.3);
            switch (data.tariffPackage) {
                case '30':
                    this.amountWithPackage = this.totalAmount;
                    break;
                case '90':
                    this.amountWithPackage = this.totalAmountForThreeMonths;
                    break;
                case '180':
                    this.amountWithPackage = this.totalAmountForSixMonths;
                    break;
                case '365':
                    this.amountWithPackage = this.totalAmountForTwelveMonths;
                    break;
                default:
                    this.amountWithPackage = this.totalAmount;
                    break;
            }
            if (!data.promocode.status) {
                this.tarifForm.get('promocode').get('value').disable({ emitEvent: false })
            } else {
                this.tarifForm.get('promocode').get('value').enable({ emitEvent: false })
            }
        })
    }

    public onClickSeeMore(): void {
        this.page = this.page + 1;
        this._getTariffTransaction();
    }

    private _updateTotalAmount(fv: any): number {
        let tempAmount = 0;
        if (fv.autoposting) {
            tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.autoposting)
        }
        if (fv.likes) {
            tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.likes)
        }

        if (fv.autosubscribe.status) {
            if (fv.autosubscribe.watchStories) {
                tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.watchStories)
            }
            if (fv.autosubscribe.direct) {
                tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.direct)
            }
            if (fv.autosubscribe.fortuna) {
                tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.fortuna)
            }
            if (fv.autosubscribe.unsubscribe) {
                tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.unsubscribe)
            }
            if (fv.autosubscribe.manageComments) {
                tempAmount += this._applyDiscountByAmountOfAccount(this.globals.tariffBasePrices.manageComments)
            }
        }
        return tempAmount;
    }

    private _applyDiscountByAmountOfAccount(basePrice: number): number {
        const accountCount: number = this.tarifForm.get('accountCount').value;
        console.log(accountCount, basePrice);

        if (accountCount == 1) {
            return accountCount * basePrice
        }

        if (accountCount > 1 && accountCount <= 5) {
            return basePrice * accountCount * 0.9
        }

        if (accountCount > 5 && accountCount <= 10) {
            return basePrice * accountCount * 0.8
        }

        if (accountCount > 10 && accountCount <= 20) {
            return basePrice * accountCount * 0.7
        }

        if (accountCount > 20 && accountCount <= 30) {
            return basePrice * accountCount * 0.6
        }

        if (accountCount > 30 && accountCount <= 50) {
            return basePrice * accountCount * 0.5
        }

    }

    private _getTariffTransaction(): void {
        this.loading = true;
        this._tariffService.getTariffTransaction((this.page - 1) * 10, this.page * 10)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                this.tariffTransaction.push(...data.data)
                const tariffTransactionStatuses = this._mainService.accountSettingsVariantsSync.transactionStatuses;
                this.tariffTransaction.map((element, index) => {
                    tariffTransactionStatuses.map((el, ind) => {
                        if (element.status === el.id) {
                            element.statusStr = el.name;
                        }
                    })
                })
                this.loading = false;
            })
    }

    public applyTariff(): void {
        if (this.amountWithPackage == 0) {
            this._toastrService.error('Вы нечего не выбрали')
            return
        }
        this.loading = true;
        const formValue = this.tarifForm.value;
        let expire = new Date();
        expire.setDate(expire.getDate() + Number(formValue.tariffPackage));
        const sendingData: TariffPayload = {
            isAutoPosting: formValue.autoposting,
            isDirect: formValue.autosubscribe.status ? formValue.autosubscribe.direct : false,
            isFortuna: formValue.autosubscribe.status ? formValue.autosubscribe.fortuna : false,
            isLike: formValue.likes,
            managesComments: formValue.autosubscribe.status ? formValue.autosubscribe.manageComments : false,
            isStatistic: formValue.statistics,
            totalAmount: this.amountWithPackage,
            isUnsubscribe: formValue.autosubscribe.status ? formValue.autosubscribe.unsubscribe : false,
            isWatchStories: formValue.autosubscribe.status ? formValue.autosubscribe.watchStories : false,
            expiredDay: +formValue.tariffPackage,
            expired: expire,
            accountCount: formValue.accountCount,
            promocodeId: formValue.promocode.status && this.promocode ? this.promocode.id : null
        }
        console.log(sendingData);
        this._tariffService.postTariff(sendingData)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((response) => {
                console.log(response);

            })
    }

    public getPromocodeInfo(): void {
        this._tariffService.getPromocodes(this.tarifForm.value.promocode.value)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((response) => {
                this.missingPromocode = false;
                this.promocode = response.data
            }, () => {
                this.missingPromocode = true;
            })
    }

    public resetForm(): void {
        this.tarifForm.reset();
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}