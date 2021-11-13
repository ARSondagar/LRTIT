import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ItransactionLocal, ItransactionWeb } from '../interfaces/tariff.interface';
import { IService, IServiceLocal } from '../interfaces/tariff.interface';
import { select, Store } from '@ngrx/store';
import { currentUserSelector } from '../../pages/auth/store/selectors';
import { User } from '../../core/models/user';
import { AuthService } from '../../pages/auth/auth.service';
import { ServerResponse } from '../../core/models/server-response';
import { catchError, map } from 'rxjs/operators';
import { IAllServices, IUserDetails } from '../interfaces/user.details.interface';
import { AppService } from 'src/app/app.service';
import { CookieService } from 'ngx-cookie';
import jwt_decode from 'jwt-decode';
import { TokenResponse } from '../../core/models/auth';
import { loginSuccessAction } from '../../pages/auth/store/actions/login.action';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TarifDataService {

  private currentUser: User;
  private get crntUserId(): number {
    return !this.currentUser ? this.processCookies() : this.currentUser.id;
  }

  constructor(
    private store: Store,
    private _authSvc: AuthService,
    private _router: Router,
    private cookieService: CookieService,
    private appSvc: AppService
  ) {
    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
    });
  }

  public getCurrentUserDetails(): Observable<IUserDetails> {

    const currentUserId = this.crntUserId;
    if (currentUserId < 1) {
      this._router.navigateByUrl('/login');
    }

    return this.appSvc.getCurrentUserDetails(currentUserId).pipe(
      map((res: ServerResponse<IUserDetails>) => res.data),
      catchError(err => {
        console.error(err.message);
        return of(this.createEmptyUserDetails());
      })
    );
  }

  private processCookies(): number {
    const accessTokenS: string = this.cookieService.get('accessTokenS');
    const refreshTokenS: string = this.cookieService.get('refreshTokenS');
    if (!accessTokenS || !refreshTokenS) {
      return 0;
    }
    const decoded: any = jwt_decode(accessTokenS);
    const currentUserId: string = decoded.data.userId;
    if (Math.floor((new Date).getTime() / 1000) >= decoded.exp) {
      return 0;
    }

    const nUserid: number = parseInt(currentUserId, 10);
    const tokenResponse: TokenResponse = {
      userId: nUserid,
      refreshToken: refreshTokenS,
      accessToken: accessTokenS
    }
    this.store.dispatch(loginSuccessAction({tokenResponse}));
    return nUserid;
  }

  public getAllServices(): Observable<IAllServices> {
    return this._authSvc.getAllServices().pipe(
      map((res: ServerResponse<IAllServices>) => res.data),
      catchError(err => {
        console.error(err.message);
        return of(this.createEmptyAllServices());
      })
    );
  }

  private convertTransaction(x: ItransactionWeb): ItransactionLocal {
    let tpName: string;
    if (x.type === 4) {
      tpName = 'Возврат средств или вывод с баланса.';
    } else if (x.type === 3) {
      tpName = 'Пополнение баланса.';
    } else if (x.type === 2) {
      tpName = 'Списание с баланса за оказанные услуги.';
    } else {
      tpName = 'Оплата сервиса.';
    }

    const rzlt: ItransactionLocal = {
      id: x.id,
      balance: x.balance,
      debiting: x.debiting,
      funcId: x.funcId,
      type: x.type,
      userId: x.userId,
      createdAt: new Date(x.createdAt),
      updatedAt: x.updatedAt ? new Date(x.updatedAt) : null,
      typeName: tpName
    };
    return rzlt;
  }

  public getTransactions(pageNbr: number): Observable<ItransactionLocal[]> {
    return this._authSvc.getTransactions(this.crntUserId, pageNbr).pipe(
      map((res: ServerResponse<ItransactionWeb[]>) => {
        const tmp: ItransactionLocal[] = [];
        res.data.forEach(x => {
          tmp.push(this.convertTransaction(x))
        });
        return tmp;
      }),
      catchError(err => {
        console.error(err.message);
        return of(this.createEmptyTransactions());
      })
    );
  }

  public getValidUntilDate(balans: number, dailyDiscount: number): string {
    const lastDay = new Date();
    if (balans >= dailyDiscount && Math.abs(dailyDiscount) >= 0.01) {
      const days = Math.round(balans / dailyDiscount);
      lastDay.setDate(lastDay.getDate() + days);
    }
    const fullDate = lastDay.toLocaleString('ru-RU');
    const dateAndTime: string[] = fullDate.split(',');
    return dateAndTime[0];
  }

  public endOfYear(): Date {
    const currentDate = new Date();
    return new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  }


  private getRussianText(value: number): string {
    let rzlt: string;
    switch (value) {
      case 1:
        rzlt = 'аккаунт';
        break;
      case 2:
      case 3:
      case 4:
        rzlt = 'аккаунта';
        break;
      default:
        rzlt = 'аккаунтов';
        break;
    }
    return rzlt;
  }

  private svcLocalConverter(svc: IService, orderedSvc: number[]): IServiceLocal {
    return {
      id: svc.id,
      name: svc.name,
      active: svc.active,
      price: svc.price,
      createdAt: new Date(svc.createdAt),
      updatedAt: new Date(svc.updatedAt),
      isOrdered: _.some(orderedSvc, x => x === svc.id),
      feeForMonth: 0
    };
  }

  private createEmptyUserDetails(): IUserDetails {
    return {
      userId: 0,
      amountAccounts: {
        id: 0,
        amountAccounts: 0,
        discount: 0
      },
      balance: 0,
      debiting: 0,
      services: []
    };
  }

  private createEmptyAllServices(): IAllServices {
    return {
      accounts: [],
      periods: [],
      services: []
    };
  }

  private createEmptyTransactions(): ItransactionLocal[] {
    return [];
  }
}
