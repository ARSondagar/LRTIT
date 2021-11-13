import { VerifyLoginInterface } from './../../models/account';
import { InstagramAccount } from './../../models/user';
import { currentUserSelector } from './../../../pages/auth/store/selectors';
import { getCurrentUserAction } from './../../../pages/auth/store/actions/getCurrentUser.action';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services/loading-service';
import { ServerResponse } from 'src/app/com/annaniks/lift/core/models/server-response';
import { User } from 'src/app/com/annaniks/lift/core/models/user';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { MainService } from '../../../pages/main/main.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  TwoFactorLoginData,
  ChallengeLoginData,
  SubscriptionData,
} from '../../models/account';
import { Subject, Observable } from 'rxjs';
import { UserType } from '../../models/account-settings';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UtilsService } from '../../services';
import { select, Store } from '@ngrx/store';

@Component({
  templateUrl: 'account-connection.modal.html',
  styleUrls: ['account-connection.modal.scss'],
})
export class AccountConnectionModalComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject<void>();

  public isDisable = false;

  private _isTwoFactorAuth = false;
  private _isChallangeAuth = false;
  private _twoFactorIdentifier: string;
  public isFirstAccount = false;
  public type: 'default' | 'sms' | 'two' | 'challange' = 'default';
  public loginForm: FormGroup;
  public tariffForm: FormGroup;
  public actionForm: FormGroup;
  public promotionForm: FormGroup;
  public challengeCodeForm: FormGroup;

  public twaCodeForm: FormGroup;

  public showCode = false;
  public errorMessage: string;
  public loading = false;
  public itsMeLoading = false;
  public userTypes: UserType[] = [];

  public titleConnect = 'Добавление аккаунта Instagram';

  currentInstagram: InstagramAccount;
  currentUser: User;
  twaLoading = false;
  instagramSMSLoading = false;
  currentInstagramId: number;

  ngOnInit() {
    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
    });

    this.userTypes = this._mainService.accountSettingsVariantsSync.userTypes;
    this.isFirstAccount =
      this._dialogData && this._dialogData.isFirstAccount !== undefined
        ? this._dialogData.isFirstAccount
        : true;

    if (this._dialogData.instagramId) {
      this.currentInstagramId = this._dialogData.instagramId;
    }

    this.type = this._dialogData.type || 'default';
    this._formBuilder();
    this._mainService.getSocketState().subscribe((data: any) => {
      if (data) {
        this.type = data;
      }
    });

    if (this._dialogData.account) {
      this.isDisable = this._dialogData.isDisable;
      this.titleConnect = 'Переподключение аккаунта Instagram';
      this.loginForm.patchValue({
        login: this._dialogData.account.login
      })
      this.loginForm.get('login').disable();
    }
  }

  constructor(
    private _fb: FormBuilder,
    private _mainService: MainService,
    private _loadingService: LoadingService,
    private _router: Router,
    private store: Store,
    private _dialogRef: MatDialogRef<AccountConnectionModalComponent>,
    private _authService: AuthService,
    private _utilsService: UtilsService,
    @Inject(MAT_DIALOG_DATA)
    private _dialogData: {
      isFirstAccount?: boolean;
      type?: 'sms' | 'two' | 'challange';
      isDisable?: boolean;
      instagramId?: number | null;
      account?: InstagramAccount;
    }
  ) {
    if (this._dialogData) {
      if (this._dialogData.account) {
        this.currentInstagram = this._dialogData.account;
      }
      if (this._dialogData.instagramId) {
        this.currentInstagramId = this._dialogData.instagramId;
      }
    }
  }

  private _formBuilder(): void {
    this.loginForm = this._fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.tariffForm = this._fb.group({
      tariff: [null, Validators.required],
    });
    this.challengeCodeForm = this._fb.group({
      code: [null, Validators.required],
    });
    this.twaCodeForm = this._fb.group({
      code: [null, Validators.required],
    });

    this.promotionForm = this._fb.group({
      autosubscription: [false],
      autoreviewstories: [false],
      bonus: [false],
    });
    this.actionForm = this._fb.group({
      action: [null, Validators.required],
    });
  }
  public getValidationError(field: string, errorName: string): boolean {
    return (
      this.loginForm.get(field).hasError(errorName) &&
      this.loginForm.get(field).touched
    );
  }
  public onSubmit(): void {
    const formValue = this.loginForm.get('login').value;
    const formPasswd = this.loginForm.get('password').value;
    const values = {
      login: formValue || this._mainService.currentInstagram.login,
      password: formPasswd,
    };
    this._connectAccount(values);
  }

  private _connectAccount(loginValues: any): void {
    this.loading = true;
    this.errorMessage = undefined;

    this._mainService
      .accountConnect({
        username: loginValues.login,
        password: loginValues.password,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(
        (resp) => {
          const data = resp.data;
          if (!data.success) {
            if (!!data.challange && data.challange.length > 0) {
              this.currentInstagram = data.account;
              switch (data.challange) {
                case 'challenge sms':
                  this.type = 'sms';
                  break;
                case 'challenge':
                  this.type = 'sms';
                  break;
                case 'two':
                  this.type = 'two';
                  break;
              }
            }
          } else {
            this.loginForm.get('login').disable();
            this.loginForm.get('password').disable();

            this._dialogRef.close(data);
          }
        },
        (err) => {
          const error = err.error;
          const response = error.data;
          if (response === 'account is exits') {
            this._dialogRef.close({isAccountConnected: true});
            return;
          }

          if (response.invalid_credentials) {
            this.errorMessage = response.message;
          } else if (typeof response === 'string') {
            this.errorMessage = response;
          }
          if (
            response.two_factor_required ||
            (response.error_type &&
              response.error_type === 'checkpoint_challenge_required')
          ) {
            this.showCode = true;
            this.loginForm.addControl(
              'code',
              new FormControl(null, Validators.required)
            );
            if (response.two_factor_required) {
              this._twoFactorIdentifier =
                response.two_factor_info.two_factor_identifier;
              this._isTwoFactorAuth = true;
              this._isChallangeAuth = false;
            } else if (
              response.error_type === 'checkpoint_challenge_required'
            ) {
              this._isChallangeAuth = true;
              this._isTwoFactorAuth = false;
            }
          }
        });
  }

  public onTwoFactorLogin(): void {
    this.twaLoading = true;
    let instId = 0;

    if (this.currentInstagram) {
      instId = this.currentInstagram.id;
    }

    if (this.currentInstagramId) {
      instId = this.currentInstagramId;
    }

    const sendingData: VerifyLoginInterface = {
      code: this.twaCodeForm.get('code').value,
      accountId: instId,
    };

    this._mainService
      .twoFactorLogin(sendingData)
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => (this.twaLoading = false))
      )
      .subscribe((response) => {
        if (response.data.success) {
          this._dialogRef.close();
        }
      });
  }

  public onInstagramSMS(): void {
    this.instagramSMSLoading = true;
    let instId = 0;

    if (this.currentInstagram) {
      instId = this.currentInstagram.id;
    }

    if (this.currentInstagramId) {
      instId = this.currentInstagramId;
    }

    const sendingData: VerifyLoginInterface = {
      code: this.challengeCodeForm.get('code').value,
      accountId: instId,
    };

    this._mainService
      .instagramSMSAuth(sendingData)
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => (this.instagramSMSLoading = false))
      )
      .subscribe((response) => {
          this._dialogRef.close(true);
      }, (err) => {
        console.log(err);
        this._dialogRef.close(false);
      });
  }

  private _joinToTariff(id): void {
    this._mainService
      .joinToTariff({
        tariffId: id,
      })
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {});
  }

  private _setSubscriptionType(): void {
    const sendingData: SubscriptionData = {
      autoFollowing: this.promotionForm.get('autosubscription').value,
      autoView: this.promotionForm.get('autoreviewstories').value,
      liftBonus: this.promotionForm.get('bonus').value,
      loginId: this.currentUser.id,
    };
    this._mainService.setSubscriptionType(sendingData).subscribe((data) => {
//      console.log(data);
      this.changeTab(4);
    });
  }

  public changedTab(tab): void {}

  public checkIsValid(controleName): boolean {
    return (
      this.loginForm.get(controleName) &&
      this.loginForm.get(controleName).hasError('required') &&
      this.loginForm.get(controleName).touched
    );
  }

  public changeTab(tab): void {}

  public onClickClose(): void {
    if (!this.loading) {
      this._dialogRef.close({ isAccountConnected: false });
    }
  }

  public onClickSetSubscriptionType(): void {
    if (this.promotionForm.valid) {
      this._setSubscriptionType();
    }
  }

  public onClickJoinToTariff(): void {
    const tarriffId: number = this.tariffForm.get('tariff').value;
    this._joinToTariff(tarriffId);
  }

  ngOnDestroy() {
    this.store.dispatch(getCurrentUserAction());
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  itsMe() {
    this.itsMeLoading = true;
    this._mainService.sendChallengeButton();
  }

  onCodeChallenge() {
    this._mainService.sendChallengeSMS(this.challengeCodeForm.value.code);
  }
}
