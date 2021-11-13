import {loginAction, loginSuccessAction} from './../../store/actions/login.action';
import {
  isSubmittingSelector,
  validationErrorsSelector,
} from './../../store/selectors';
import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { LoginData } from '../../../../core/models/login';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../../../core/services/loading-service';
import { select, Store } from '@ngrx/store';
import {debounceTime, distinctUntilChanged, filter, finalize, takeUntil} from 'rxjs/operators';
import {animate, style, transition, trigger} from '@angular/animations';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { AccountConnectData } from '../../../../core/models/account';
import { AccountConectInterface } from '../../../../shared/interfaces/accountConnect.interface';
import { HttpClient } from '@angular/common/http';
import { getCurrentUserAction } from '../../store/actions/getCurrentUser.action';
import { switchUserSuccessAction } from '../../store/actions/switchUser.action';

import { CookieService } from 'ngx-cookie';
import jwt_decode from 'jwt-decode';
import { TokenResponse } from '../../../../core/models/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('500ms', style({opacity: 1}))
        ])
      ]
    )
  ],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private _unsubscribe: Subject<void> = new Subject<void>();
  public signInForm: FormGroup;
  public errorMessage: string;
  public loading = false;
  public stage = 0;
  isSubmitting$: Observable<boolean>;
  backendErrors$: Observable<string | null>;

  // private _loginForm$ = new BehaviorSubject<boolean>(true);
  // public loginForm$: Observable<boolean> = this._loginForm$.asObservable();
  // public loginFormIsVisible = true;
  // public instagramForm: FormGroup;
  // public titleConnect = 'Добавление аккаунта Instagram';

  constructor(
    private _fb: FormBuilder,
    // private _httpClient: HttpClient,
    private actRoute: ActivatedRoute,
    private _toastrService: ToastrService,
    private cookieService: CookieService,
    private store: Store
  ) {}

  ngOnInit() {
    // this.loginFormIsVisible = true;
    // this.actRoute.queryParams.pipe(
    //   filter(x => x && x.noinstagram)
    // ).subscribe(x => {
    //   this._loginForm$.next(false);
    //   this.loginFormIsVisible = false;
    // });

    this._initForm();
    // if (this.processCookies()) {
    //   return;
    // }

    this.initializeValues();
    this.backendErrors$.subscribe(error => {
      if (error) {
        this.stage = 1;
      }
    });
    this.isSubmitting$.subscribe(success => {
      if (success) {
        this.stage = 3;
      }
    });

  //  if (!this._loginForm$.value) {
  //     this.instagramForm = this._fb.group({
  //       login: ['', Validators.required],
  //       password: ['', Validators.required],
  //     });
  //     this.instagramForm.controls['login'].setErrors({'incorrect': true});
  //     this.instagramForm.controls['password'].setErrors({'incorrect': true});
  //     this.instagramForm.setErrors({'incorrect': true});
  //   }
  }

  private processCookies(): boolean {
    const accessTokenS: string = this.cookieService.get('accessTokenS');
    const refreshTokenS: string = this.cookieService.get('refreshTokenS');
    if (!accessTokenS || !refreshTokenS) {
      return false;
    }
    const decoded: any = jwt_decode(accessTokenS);
    const CurrentUserId: string = decoded.data.userId;
    if (Math.floor((new Date).getTime() / 1000) >= decoded.exp) {
      return false;
    }

    const tokenResponse: TokenResponse = {
      userId: parseInt(CurrentUserId, 10),
      refreshToken: refreshTokenS,
      accessToken: accessTokenS
    }
    this.store.dispatch(loginSuccessAction({tokenResponse}));
    return true;
  }

  ngAfterViewInit() {
    this.signInForm.valueChanges
    .pipe(
      debounceTime(200),
      distinctUntilChanged()
    )
    .subscribe((newForm) => {
      this.errorMessage = undefined;
      const some = Object.values(newForm).some(item => item);
      const every = Object.values(newForm).every(item => item);
      this.stage = some ? 1 : 0;
      if (every && this.signInForm.valid) {
        this.stage = 2;
      }
    });
  }

  initializeValues(): void {
    this.isSubmitting$ = this.store.pipe(select(isSubmittingSelector));
    this.backendErrors$ = this.store.pipe(select(validationErrorsSelector));
  }

  private _pushErrorFor(ctrl_name: string, msg: string): void {
    this.signInForm.controls[ctrl_name].setErrors({ msg: msg });
  }

  private _initForm(): void {
    this.signInForm = this._fb.group({
      email: [environment.loginName, [Validators.required, Validators.email]],   // TODO: remove values
      password: [environment.loginPasswd, [Validators.required, Validators.minLength(6)]],
    });
  }

  private _setValidationErrors(keys: string[]): void {
    keys.forEach((val) => {
      const ctrl = this.signInForm.controls[val];
      if (!ctrl.valid) {
        this._pushErrorFor(val, null);
        ctrl.markAsTouched();
      }
    });
  }

  onSubmit(): void {
    const request = this.signInForm.value as LoginData;

    this.store.dispatch(loginAction({ request }));
  }


  // public getValidationError(field: string, errorName: string): boolean {
  //   return (
  //     this.instagramForm.get(field).hasError(errorName) &&
  //     this.instagramForm.get(field).touched
  //   );
  // }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

}
