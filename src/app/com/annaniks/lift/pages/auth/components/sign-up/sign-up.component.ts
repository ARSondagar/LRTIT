import {Component, OnInit, AfterViewInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import {map, catchError, finalize, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import { MatchPassword } from '../../../../core/utilities/match-password';
import { Subject, throwError, Observable } from 'rxjs';
import { RegisterData } from '../../../../core/models/register';
import { CookieService } from 'ngx-cookie';
import { AppService } from 'src/app/app.service';
import { select, Store } from '@ngrx/store';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
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
export class SignUpComponent implements OnInit, AfterViewInit {
  private _matchPassword: MatchPassword = new MatchPassword();
  public signUpForm: FormGroup;
  public loading: boolean = false;
  public errorMessage: string;
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
    this.signUpForm.controls[ctrl_name].setErrors({ msg: msg });
  }

  private _initForm(): void {
    this.signUpForm = this._fb.group({
      terms: [false, [Validators.requiredTrue]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', [Validators.required, Validators.minLength(6)]]
    },
      { validator: this._matchPassword.check('password', 'passwordConfirmation') });
  }

  private _userRegister(registerData: RegisterData): void {
    this.loading = true;

    this._authService
      .register(registerData)
      .pipe(
        finalize(() => this.loading = false),
        map((data) => {
          this.stage = 3;
          this.errorMessage = undefined;
          setTimeout(() => {
            this._authService.setUserId(data.data.userId);
            this._router.navigate(['/auth/activate']);
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
    const form = this.signUpForm.value
    const values: RegisterData = {
      name: form.name,
      email: form.email,
      password: form.password,
    }

    const keys = Object.keys(values);
    if (this.signUpForm.valid) {
      this._userRegister(values);
    } else {
      this._setValidatonErrors(keys);
    }
  }
  ngAfterViewInit() {
    this.signUpForm.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((newForm) => {
        this.errorMessage = undefined;
        const some = Object.values(newForm).some(item => item);
        const every = Object.values(newForm).every(item => item);
        this.stage = some ? 1 : 0;
        if (every && this.signUpForm.valid) {
          this.stage = 2;
        }
      });
  }
  private _setValidatonErrors(keys: string[]): void {
    keys.forEach(val => {
      const ctrl = this.signUpForm.controls[val];
      if (!ctrl.valid) {
        this._pushErrorFor(val, null);
        ctrl.markAsTouched();
      }
    });
  }

  public getValidationError(field: string, errorName: string): boolean {
    return this.signUpForm.get(field).hasError(errorName) && this.signUpForm.get(field).touched;
  }

}
