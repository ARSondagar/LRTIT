import { AccountConectInterface } from './../../shared/interfaces/accountConnect.interface';
import { VerifyLoginInterface } from './../../core/models/account';
// import { InstagramAccountChangeModal } from './../../core/modals/instagram-account-change/instagram-account-change.modal';
import { AccountVerificationModal } from './../../core/modals/account-verification/account-verification.modal';
import {
  currentInstagramSelector,
  currentUserSelector,
} from './../auth/store/selectors';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  Observable,
  throwError,
  BehaviorSubject,
  Subject,
  forkJoin,
  of,
} from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { ServerResponse } from '../../core/models/server-response';
import { User, InstagramAccount, UserExt } from '../../core/models/user';
import { map, catchError, filter, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import {
  AccountConnectData,
  TwoFactorLoginData,
  ChallengeLoginData,
  SubscriptionData,
} from '../../core/models/account';
import { ArticleShort } from '../../core/models/article';
import { AccountSettings } from '../../core/models/account-settings';
import { JoinTariff } from '../../core/models/tariff';
import { Router } from '@angular/router';
import { ChangeInstagramAccountRequest } from '../../core/models/change-password-recuest';
import { ToastrService } from 'ngx-toastr';
import { VerificationCode } from '../../core/models/verification-code';
import { ActionModal } from '../../core/modals/action-modal/action.modal';
import { MatDialog } from '@angular/material';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { switchUserAction } from '../auth/store/actions/switchUser.action';
import { getCurrentUserAction } from '../auth/store/actions/getCurrentUser.action';
import { CheckInstagramConnectInterface } from './types/check-instagram-connect.interface';
import { IConnectionState } from '../../core/models/IConnection.state';
import { IPayment } from '../../shared/interfaces/payment.interface';

@Injectable({providedIn: 'root'})
export class MainService {
  private dialog;
  private _isShowDisabledView = true;
  private _accountSettingsVariants: AccountSettings = {} as AccountSettings;
  private _accountSettings$: BehaviorSubject<AccountSettings> = new BehaviorSubject<AccountSettings>(
    null
  );

  // private _accountConnection$: Subject<{
  //   isOpen: boolean;
  //   accountData?: any;
  // }> = new Subject<{ isOpen: boolean; accountData?: any }>();
  private _accountConnection$ = new BehaviorSubject<IConnectionState>({isOpen: false, accountData: null});
  public accountConnection: Observable<IConnectionState> = this._accountConnection$.asObservable();
  public get accConnectionState() {
    return this._accountConnection$.getValue();
  }
  public set accConnectionState(value: IConnectionState) {
    this._accountConnection$.next(value);
  }


  private _socketState$: BehaviorSubject<false | 'sms' | 'challange'> = new BehaviorSubject<false | 'sms' | 'challange'>(false);
  public socketState$: Observable<false | 'sms' | 'challange'> = this._socketState$.asObservable();
  public set socketState(value: any) {
    this._socketState$.next(value);
  }
  public get socketState() {
    return this._socketState$.getValue();
  }

  private _accountsState$: BehaviorSubject<any> = new BehaviorSubject<any>(
    false
  );

  private _dialogState = new BehaviorSubject(false);
  public dialogState: Observable<boolean> = this._dialogState.asObservable();

  public set dlgState(value: boolean) {
    this._dialogState.next(value);
  }
  public get dlgState() {
    return this._dialogState.getValue();
  }

  public socket;

  public _currentInstagram: InstagramAccount | null = null;
  public get currentInstagram(): InstagramAccount {
    if (!this._currentInstagram) {
      this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
        this._currentInstagram = resp;
        if (!this._currentInstagram) {
          this._router.navigateByUrl('add-instagram-account');
        }
      });
    }
    return this._currentInstagram;
  }
  public set currentInstagram(value: InstagramAccount) {
    this._currentInstagram = value;
  }

  private _showSubmenu$ = new BehaviorSubject<boolean>(true);
  public showSubmenu$: Observable<boolean> = this._showSubmenu$.asObservable();

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: CookieService,
    private _authService: AuthService,
    private _matDialog: MatDialog,
    private _router: Router,
    private store: Store,
    private _toastrService: ToastrService,
    private _dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    private _dialogData: {
      isFirstAccount?: boolean;
      type?: 'sms' | 'challange';
    }
  ) {
    // this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
    //   this.currentInstagram = resp;
    //   if (!this.currentInstagram) {
    //     this._router.navigateByUrl('/add-instagram-account');
    //   }
    // });
  }

  public showHideSubmenu(isVisible: boolean) {
    this._showSubmenu$.next(isVisible);
  }

  public initSocket(): void {
    this.socket = io(environment.socketIG, {
      transports: ['websocket'],
      reconnectionDelay: 10,
    });

    this.socket.on('connect', (socket) => {
      console.log('socket is connected');
    });
    this.socket.on('challange', (socket) => {
      console.log('socket', socket);
      this._socketState$.next(socket.type);
    });
    this.socket.on('check-instagram-connection', (socket) => {
      console.log('CHECK INST', socket);
      this._accountsState$.next(socket);
    });
  }

  public instagramTry(): Observable<any> {
    return this._httpClient.post<any>('instagram-try', {});
  }

  public payment(data: IPayment): Observable<any> {
    return this._httpClient.post<IPayment>('addFunds', data);
  }

  public checkInstagramConnection(
    userId: number
  ): Observable<CheckInstagramConnectInterface[]> {
    console.log('CALLED');
    return this._httpClient.get<CheckInstagramConnectInterface[]>(
      `check-Instagram-connection?userId=${userId}`
    );
  }

  public sendChallengeSMS(code) {
    console.log('sendChallengeSMS', code);
    this.socket.emit('challange', code);
  }

  public sendTFASMS(code) {
    console.log('sendtwo', code);
    this.socket.emit('two', code);
  }

  public sendChallengeButton() {
    console.log('sendChallengeButton');
    this.socket.emit('challange', '123');
  }
  public getSocketState() {
    return this._socketState$;
  }
/*
  private _checkUserAccountsState(user: User): void {
    //  this.store;
    // this._authService.setUserState(user);
    if (user) {
      if (user.instagramAccounts && user.instagramAccounts.length === 0) {
        this.setShowDisabledView(true);
        this._router.navigate(['']);
        this._accountConnection$.next({ isOpen: true });
      } else {
        this._checkIsHaveUnActiveAccount(user.instagramAccounts);
        this.setShowDisabledView(false);
      }
    } else {
      this._router.navigate(['']);
      this._accountConnection$.next({ isOpen: true });
      this.setShowDisabledView(true);
      return;
    }
    if (
      !this.currentInstagram ||
      (this.currentInstagram && !this.currentInstagram.id)
    ) {
      if (user && user.instagramAccounts && user.instagramAccounts.length > 0) {
        const instagramAccount =
          user.instagramAccounts.find((element) => element.selected === true) ||
          user.instagramAccounts[0];
        this.store.dispatch(switchUserAction({ instagramAccount }));
        // this._authService.setAccount(selectedAccount);
      }
    }
  }
*/
  public _createImportantToastr(message: string): void {
    const toastrRef = this._toastrService.error(
      message,
      'Важная информация !!!',
      {
        disableTimeOut: true,
        positionClass: 'toast-top-full-width',
        progressBar: true,
      }
    );
    toastrRef.onHidden.subscribe(() => {
      this._router.navigate(['/profile'], {
        queryParams: { tab: 'personal-settings' },
      });
    });
  }


  public logOut(): Observable<ServerResponse<{}>> {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + this._cookieService.get('refreshTokenS')
    );
    let params = new HttpParams();
    params = params.set('authorization', 'false');
    return this._httpClient.post<ServerResponse<{}>>(
      'logout',
      {},
      { headers, params }
    );
  }

  public getMe(
  ): Observable<ServerResponse<User>> {
    this.setShowDisabledView(true);
    return this._httpClient.get<ServerResponse<UserExt>>('me').pipe(
      catchError((err) => {
        this.setShowDisabledView(true);
        this._authService.setAuthState(null);
        return throwError(err);
      })
    );
  }

  public setShowDisabledView(isShow: boolean): void {
    this._isShowDisabledView = isShow;
    if (isShow) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      return;
    }
    document.body.style.overflow = 'auto';
  }

  public setSubscriptionType(
    subscriptionData: SubscriptionData
  ): Observable<any> {
    return this._httpClient.post('subscription', subscriptionData);
  }

  public getAccountSettingsVariants(): Observable<AccountSettings> {
    return this._httpClient
      .get<ServerResponse<AccountSettings>>('settings')
      .pipe(
        map((data) => {
          this._accountSettingsVariants = data.data;
          this._accountSettings$.next(this._accountSettingsVariants);
          return data.data;
        })
      );
  }

  public accountConnect(
    data: AccountConnectData
  ): Observable<AccountConectInterface> {
    return this._httpClient.post<AccountConectInterface>(
      'instagram-connect',
      data
    );
  }

  public resetMainProperties(): void {
    this._accountSettingsVariants = {} as AccountSettings;
    this._accountSettings$.next({} as AccountSettings);
  }

  // TODO: TEST IT
  public twoFactorLogin(data: VerifyLoginInterface): Observable<any> {
    return this._httpClient.post('instagram-two-auth', data);
  }

  public instagramSMSAuth(data: VerifyLoginInterface): Observable<any> {
    return this._httpClient.post('instagram-sms-auth', data);
  }

  // public twoFactorLogin(data: TwoFactorLoginData): Observable<any> {
  //   return this._httpClient.post("two-factor-login", data);
  // }

  public challengeLogin(data: ChallengeLoginData): Observable<any> {
    return this._httpClient.post('checkpoint-challenge', data);
  }

  public deleteInstaAccount(id: number) {
    return this._httpClient.delete(`instagram-connect/${id}`);
  }

  public getShowDisabledView(): boolean {
    return this._isShowDisabledView;
  }

  public joinToTariff(data: JoinTariff): Observable<any> {
    return this._httpClient.post('tariff', data);
  }

  public accountSettingsVariants(): Observable<{}> {
    return this._accountSettings$.asObservable();
  }

  public getArticles(): Observable<ServerResponse<ArticleShort[]>> {
    return this._httpClient.get<ServerResponse<ArticleShort[]>>(
      'article/wizard'
    );
  }

  public openAccountConnectionModal(accontData?: any): void {
    this._accountConnection$.next({
      isOpen: true,
      accountData: accontData ? accontData : null,
    });
  }

  public closeAccountConnectionModal(): void {
    this._accountConnection$.next({ isOpen: false });
  }

  get accountSettingsVariantsSync(): AccountSettings {
    return this._accountSettingsVariants;
  }

  get accountConnectionState(): Observable<{
    isOpen: boolean;
    accountData?: any;
  }> {
    return this._accountConnection$
      .asObservable()
      .pipe(filter((event) => event != null));
  }

  public changeInstagramAccountPassword(
    body: ChangeInstagramAccountRequest
  ): Observable<ServerResponse<ChangeInstagramAccountRequest>> {
    return this._httpClient.post<ServerResponse<ChangeInstagramAccountRequest>>(
      'instagram/change-password',
      body
    );
  }

  public resendCode(accountId: number): Observable<{}> {
    return this._httpClient.post<{}>('instagram/resend-code', {
      accountId: accountId,
    });
  }

  public _refreshUser(): Observable<any> {
    return of(this.store.dispatch(getCurrentUserAction()));
  }
  public _switchUser(instagramAccount: InstagramAccount): void {
    this.store.dispatch(switchUserAction({ instagramAccount }));
  }

  public verificationCode(body): Observable<ServerResponse<VerificationCode>> {
    return this._httpClient.post<ServerResponse<VerificationCode>>(
      'instagram/verification-code',
      body
    );
  }

  public openActionModal(): Observable<string> {
    const dialogRef = this._matDialog.open(ActionModal, {
      width: '400px',
      panelClass: 'action-modal',
    });
    return dialogRef.afterClosed();
  }

  public checkSession(userId: number, instagramId: number): Observable<any> {
    const url = `check-session/user/${userId}/account/${instagramId}`
    return this._httpClient.get(url);
  }

}
