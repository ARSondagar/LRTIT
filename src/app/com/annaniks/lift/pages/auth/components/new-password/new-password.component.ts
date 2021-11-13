import { isSubmittingSelector } from './../../store/selectors';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import {
  map,
  catchError,
  finalize,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { MatchPassword } from '../../../../core/utilities/match-password';
import { Subject, throwError, Observable } from 'rxjs';
import { ServerResponse } from '../../../../core/models/server-response';
import { TokenResponse } from '../../../../core/models/auth';
import { CookieService } from 'ngx-cookie';
import { AppService } from 'src/app/app.service';
import { JoinRequestData } from '../../../../core/models/join';
import { select, Store } from '@ngrx/store';
import { getCurrentUserAction } from '../../store/actions/getCurrentUser.action';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.sass'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class NewPassComponent implements OnInit, OnDestroy, AfterViewInit {
  private _matchPassword: MatchPassword = new MatchPassword();
  private _unsubscribe: Subject<void> = new Subject<void>();
  public signUpForm: FormGroup;
  public loading = false;
  public errorMessage: string;
  isSubmitting$: Observable<boolean>;
  private queryParams;
  private stage = 0;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _routerActivate: ActivatedRoute,
    private _authService: AuthService,
    private _appService: AppService,
    private _cookieService: CookieService,
    private store: Store
  ) {
    _routerActivate.queryParams.subscribe((data) => {
      this.queryParams = data;
    });
  }

  ngOnInit() {
    this._initForm();
    this.initializeValues();
  }
  ngAfterViewInit() {
    this.signUpForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((newForm) => {
        this.errorMessage = undefined;
        const some = Object.values(newForm).some((item) => item);
        const every = Object.values(newForm).every((item) => item);
        this.stage = some ? 1 : 0;
        if (every && this.signUpForm.valid) {
          this.stage = 2;
        }
      });
  }
  private _pushErrorFor(ctrl_name: string, msg: string): void {
    this.signUpForm.controls[ctrl_name].setErrors({ msg: msg });
  }

  initializeValues(): void {
    this.isSubmitting$ = this.store.pipe(select(isSubmittingSelector));
  }

  private _initForm(): void {
    this.signUpForm = this._fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirmation: [
          '',
          [Validators.required, Validators.minLength(6)],
        ],
      },
      {
        validator: this._matchPassword.check(
          'password',
          'passwordConfirmation'
        ),
      }
    );
  }

  private _userRegister(registerData): void {
    this.loading = true;
    const payload = {
      id: +this.queryParams.userId,
      code: this.queryParams.refferalCode,
      password: registerData.password,
    };
    this._authService
      .newPass(payload)
      .pipe(
        finalize(() => (this.loading = false)),
        map((data: ServerResponse<TokenResponse>) => {
          this.stage = 3;
          this.errorMessage = undefined;
          const tokens = data.data;
          this._cookieService.put('accessTokenS', tokens.accessToken);
          this._cookieService.put('refreshTokenS', tokens.refreshToken);
          this._checkIsHaveRefferalCode();

          this.store.dispatch(getCurrentUserAction());

          setTimeout(() => {
            this._router.navigate(['/statistics/preview']);
          }, 2000);
        }),
        catchError((err) => {
          this.stage = 1;
          try {
            this.errorMessage = err.error.message;
          } catch (error) {
            this.errorMessage = 'Something is wrong';
          }
          return throwError(err);
        })
      )
      .subscribe();
  }

  public onSubmit(): void {
    const form = this.signUpForm.value;
    const values = {
      password: form.password,
    };

    const keys = Object.keys(values);
    if (this.signUpForm.valid) {
      this._userRegister(values);
    } else {
      this._setValidatonErrors(keys);
    }
  }

  private _setValidatonErrors(keys: string[]): void {
    keys.forEach((val) => {
      const ctrl = this.signUpForm.controls[val];
      if (!ctrl.valid) {
        this._pushErrorFor(val, null);
        ctrl.markAsTouched();
      }
    });
  }

  private _checkIsHaveRefferalCode(): void {
    const refferalCode: string = this._cookieService.get('refferalCode') || '';
    if (refferalCode) {
      const joinRequest: JoinRequestData = {
        action: 'registration',
        refferalCode: refferalCode,
      };
      this._appService
        .getTrackingByReferalCode(joinRequest)
        .pipe(
          takeUntil(this._unsubscribe),
          finalize(() => {
            this._cookieService.remove('refferalCode');
          })
        )
        .subscribe();
    }
  }

  public getValidationError(field: string, errorName: string): boolean {
    return (
      this.signUpForm.get(field).hasError(errorName) &&
      this.signUpForm.get(field).touched
    );
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }
}
