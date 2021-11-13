import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ServerResponse } from '../../../../core/models/server-response';
import { TokenResponse } from '../../../../core/models/auth';
import { CookieService } from 'ngx-cookie';
import { AppService } from 'src/app/app.service';
import { JoinRequestData } from '../../../../core/models/join';
import { Store } from '@ngrx/store';
import { getCurrentUserAction } from '../../store/actions/getCurrentUser.action';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.sass'],
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
export class ActivateComponent implements OnInit, OnDestroy {
  public activateForm: FormGroup;
  public loading = false;
  public errorMessage: string;
  public countdown = 0;
  private countdownInterval;
  public stage = 0;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _appService: AppService,
    private _cookieService: CookieService,
    private store: Store
  ) { }

  ngOnInit() {
    this._initForm();
  }

  private _pushErrorFor(ctrl_name: string, msg: string): void {
    this.activateForm.controls[ctrl_name].setErrors({ msg: msg });
  }


  private _initForm(): void {
    this.activateForm = this._fb.group({
        code: ['', [Validators.required]],
      });
  }

  private _userRegister(registerData): void {
    this.loading = true;
    this._authService.activate({
      code: registerData.code,
      id: +localStorage.getItem('userId')
    }).pipe(
        finalize(() => this.loading = false),
        map((data: ServerResponse<TokenResponse>) => {
          this.errorMessage = undefined;
          this.stage = 3;
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
      .subscribe()
  }

  public onSubmit(): void {
    const form = this.activateForm.value;
    const values = {
      code: form.code
    }

    const keys = Object.keys(values);
    if (this.activateForm.valid) {
      this._userRegister(values);
      this.countdownStart();
    } else {
      this._setValidatonErrors(keys);
    }
  }

  private _setValidatonErrors(keys: string[]): void {
    keys.forEach(val => {
      const ctrl = this.activateForm.controls[val];
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
        refferalCode: refferalCode
      }
      this._appService.getTrackingByReferalCode(joinRequest)
        .pipe(
          finalize(() => {
            this._cookieService.remove('refferalCode');
          })
        )
        .subscribe()
    }
  }
  countdownStart() {
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (!this.countdown) {
        this.countdownFinish();
      }
    }, 1000)
  }
  countdownFinish() {
    clearInterval(this.countdownInterval);
    this.countdown = 0;
    this.onCodeChange(this.activateForm.value.code);
  }

  public getValidationError(field: string, errorName: string): boolean {
    return this.activateForm.get(field).hasError(errorName) && this.activateForm.get(field).touched;
  }

  ngOnDestroy() {
  }

  onCodeChange($event: any) {
    this.errorMessage = undefined;
    this.stage = $event ? 1 : 0;
    if ($event && !this.countdown) {
      this.stage = 2;
    }
  }
}
