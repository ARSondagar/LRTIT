import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { IAccount1, IAccountLocal, IPeriodLocal, IServiceBase, ItransactionLocal } from '../../../../shared/interfaces/tariff.interface';
import { IServiceLocal, Itarif } from '../../../../shared/interfaces/tariff.interface';
import { IUserDetails } from '../../../../shared/interfaces/user.details.interface';
import { TarifDataService } from '../../../../shared/services/tarif-data.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-tariff-new',
  templateUrl: './tariff-new.component.html',
  styleUrls: ['./tariff-new.component.scss']
})
export class TariffNewComponent implements OnInit {

  public showPreviewBlock$: Observable<number>;
  private allServices: IServiceLocal[];
  private allAccaunts: IAccountLocal[];

  private history: ItransactionLocal[];
  public dailyDiscount = 0;
  public dailyDiscountNew = 0;
  public finishDate = '';   // Пересчитанный срок действия услуг
  public finishDateNew = ''; // Срок действия услуг в базе данных
  private userDetails: IUserDetails;
  private pageNumber: number;
  public loading = true;
//  private countLeft: number;
  private allPeriods: IPeriodLocal[];

  private discountAll = 20;   // TODO: get it from service?

  constructor(
    private _appSvc: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _tarifDataSvc: TarifDataService
  ) {
    this.showPreviewBlock$ = this._appSvc.headerIsVisible$;
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      _appSvc.setHeaderFlag(0);
    });
    this.finishDate = this._tarifDataSvc.endOfYear().toLocaleDateString('ru-RU');
}

  ngOnInit() {
    this.activatedRoute.data.subscribe(x => {
      this.allServices = x.data.allServices.services;
      this.allAccaunts = x.data.allServices.accounts;
      this.allPeriods = x.data.allServices.periods;
      this.history = x.data.allTransactions;
      this.userDetails = x.data.userDetails;

      this.dailyDiscount = this.userDetails.debiting;
      this.finishDate = this._tarifDataSvc.getValidUntilDate(this.userDetails.balance, this.dailyDiscount);
      this.finishDateNew = this.finishDate;

      this.formatAllAccaunts(this.userDetails.amountAccounts);
      this.formatAssignedServices(this.userDetails.services);
      this.pageNumber = 1;
      this.loading = false;
    });
  }

  dailyDiscountChanged(value: number) {
    setTimeout(() => {
      this.dailyDiscountNew = value;
      this.finishDateNew = this._tarifDataSvc.getValidUntilDate(this.userDetails.balance, this.dailyDiscountNew);
    });
  }

  onGetMoreTransaction(evt): void {
    if (this.pageNumber < 1) {
      return;
    }
    this.loading = true;
    this._tarifDataSvc.getTransactions(this.pageNumber += 1).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(
      (trn: ItransactionLocal[]) => {
        if (!trn || trn.length < 1) {
          this.pageNumber = 0
        } else {
          this.history = this.history.concat(trn);
        }
      },
      (err: any) => {
        console.log(err);
        this.pageNumber = 0
      }
    )
  }

  private formatAssignedServices(userServices: IServiceBase[]): void {
    const activeServices = _.filter(userServices, x => x.active);
    const svcSorted = _.sortBy(activeServices, x => x.id);
    const idList: number[] = _.map(svcSorted, x => x.id);

    this.allServices.forEach(svc => {
      svc.isOrdered = idList.findIndex(x => x === svc.id) >= 0
    });
    this.allServices.sort((a, b) => a.id >= b.id ? 1 : -1);

    const selIndex = Math.max(this.allAccaunts.findIndex(x => x.isSelected), 0);
    const accountNumber = this.allAccaunts[selIndex].amountAccounts;
    this.allServices.unshift({
      id: 0,
      name: 'Статистика',
      active: true,
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOrdered: true,
      feeForMonth: 0
    });
    this.allServices.push({
      id: 0,
      name: `Количество аккаунтов - ${accountNumber} шт.`,
      active: true,
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOrdered: true,
      feeForMonth: 0
    });
  }

  private formatAllAccaunts(amountAccounts: IAccount1): void {
    const selId: number = amountAccounts ? amountAccounts.id : 0;
    if (this.allAccaunts) {
      this.allAccaunts.forEach(acc => {
        acc.isSelected = acc.id === selId;
        acc.sAmount = `00${acc.amountAccounts}`.substr(-2, 2);
        acc.text = this.russianText(acc.amountAccounts, acc.amountAccounts.toString());
      });
    }
  }

  private russianText(value: number, sValue: string): string {
    let text: string;
    switch (value) {
      case 1:
        text = 'акаунт';
        break;
      case 2:
      case 3:
      case 4:
        text = 'акаунта';
        break;
      default:
        text = 'акаунтов';
        break;
    }
    return `${sValue} ${text}`;
  }

}
