import { catchError, map, tap } from 'rxjs/operators';
import { User, UserExt } from './../../core/models/user';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BasicUser } from '../../core/models/basic-user';
import { ServerResponse } from '../../core/models/server-response';
import { LoginData } from '../../core/models/login';
import { TokenResponse } from '../../core/models/auth';
import { IAllServices, IPostTariff, IUserDetails } from '../../shared/interfaces/user.details.interface';
import { ItransactionWeb } from '../../shared/interfaces/tariff.interface';
import { AppService } from 'src/app/app.service';

@Injectable()
export class AuthService {
  constructor(private _httpClient: HttpClient,
              private appSvc: AppService) {}

  public login(
    loginData: LoginData
  ): Observable<ServerResponse<TokenResponse>> {
    let params: HttpParams = new HttpParams();
    params = params.set('authorization', 'false');
    return this._httpClient.post<ServerResponse<TokenResponse>>(
      'login',
      loginData
    );
  }

  public register(user: BasicUser): Observable<ServerResponse<TokenResponse>> {
    let params: HttpParams = new HttpParams();
    params = params.set('authorization', 'false');
    return this._httpClient.post<ServerResponse<TokenResponse>>(
      'registration',
      user
    );
  }

  public getCurrentUser(): Observable<ServerResponse<UserExt>> {
    return this._httpClient.get<ServerResponse<UserExt>>('me').pipe(
      catchError(err => {
        console.log(err);
        throw err;
      })
    );
  }

  public getTransactions(userId: number, pageNbr: number): Observable<ServerResponse<ItransactionWeb[]>> {
    const url = `getTransactions/user/${userId}/page/${pageNbr}`;
    return this._httpClient.get<ServerResponse<ItransactionWeb[]>>(url);
  }
  public getAllServices(): Observable<ServerResponse<IAllServices>> {
    const url = 'getServicesAll';
    return this._httpClient.get<ServerResponse<IAllServices>>(url);
  }
  public setServices(data: IPostTariff): Observable<any> {
    return this._httpClient.post<any>('setServices', data);
  }
  public saveServices(data: IPostTariff): Observable<any> {
    return this._httpClient.post<any>('saveServices', data);
  }

  public switchUser(accountId: number): Observable<{}> {
    return this._httpClient.post<{}>('instagram/switch-account', {
      accountId: accountId,
    });
  }

  public activate(payload) {
    return this._httpClient.post('activate', payload);
  }

  public forgot(body) {
    return this._httpClient.post('remember-password', body);
  }

  public newPass(body) {
    return this._httpClient.post('remember-password-confirm', body);
  }

  public getUserId() {
    return localStorage.getItem('userId');
  }
  public setUserId(value) {
    localStorage.setItem('userId', value);
  }

}
