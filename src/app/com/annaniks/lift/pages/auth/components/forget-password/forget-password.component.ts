import {Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {AuthService} from '../../auth.service';
import {Router} from '@angular/router';
import {catchError, finalize, map} from 'rxjs/operators';
import {ServerResponse} from '../../../../core/models/server-response';
import {TokenResponse} from '../../../../core/models/auth';
import {throwError} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
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
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  public forgetPasswordForm: FormGroup;
  public emailSended = false;
  public errorMessage: string;
  public loading = false;
  public stage = 0;
  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this._initForm();
  }

  private _initForm(): void {
    this.forgetPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnDestroy() {

  }

  onSubmit() {
    const form = this.forgetPasswordForm.value;
    this.loading = true;
    const values = {
      email: form.email,
    };
    this._authService.forgot(values).pipe(
      finalize(() => this.loading = false),
      map((data: ServerResponse<TokenResponse>) => {
        this.errorMessage = undefined;
        this.stage = 3;
        this.errorMessage = undefined;
        this.emailSended = true;
      }),
      catchError((err) => {
        this.stage = 1;
        this.loading = false;
        try {
          this.errorMessage = err.error.message;
        } catch (error) {
          this.errorMessage = 'Something is wrong';
        }
        return throwError(err);
      })
    ).subscribe()
  }

  onEmailChange($event: any) {
    this.errorMessage = undefined;
    this.stage = $event ? 1 : 0;
    if ($event && this.forgetPasswordForm.valid) {
      this.stage = 2;
    }
  }
}
