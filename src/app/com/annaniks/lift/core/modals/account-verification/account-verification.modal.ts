import { VerifyLoginInterface } from './../../models/account';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MainService } from '../../../pages/main/main.service';
import { VerificationCode } from '../../models/verification-code';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { InstagramAccount, User } from '../../models/user';
import { select, Store } from '@ngrx/store';
import { currentInstagramSelector, currentUserSelector } from '../../../pages/auth/store/selectors';

@Component({
  selector: 'account-verification',
  templateUrl: 'account-verification.modal.html',
  styleUrls: ['account-verification.modal.scss'],
})
// tslint:disable-next-line:component-class-suffix
export class AccountVerificationModal implements OnInit {
  private _unsubscribe$ = new Subject<void>();
  private _account: InstagramAccount;
  public passwordErrorMessage: string;
  public verificationForm: FormGroup;
  public loading = false;
  public isCodeSending = false;
  public isCodeSended = false;
  public isError = false;
  public errorMessage = '';

  constructor(
    private _fb: FormBuilder,
    private store: Store,
    private _mainService: MainService,
    private _dialogRef: MatDialogRef<AccountVerificationModal>,
    private _toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) private _data: { account: InstagramAccount }
  ) {
    this._account = this._data.account;
  }

  ngOnInit() {
    this._formBuilder();
    this.onClickSendCodeAgain();

    localStorage.setItem('isShow', 'true');
  }

  private _formBuilder(): void {
    this.verificationForm = this._fb.group({
      accountName: [
        { value: this._account.login, disabled: true },
        Validators.required,
      ],
      code: [null, Validators.required],
    });
  }

  private _verificationCode(): void {
    const verifcationCodeData: VerifyLoginInterface = {
      accountId: this._account.id,
      code: this.verificationForm.value.code,
    };

    this.loading = true;

    this.isCodeSending = false;
    this.isCodeSended = false;
    this.isError = false;

    this.passwordErrorMessage = undefined;
    this.verificationForm.disable();
    this._mainService
      .instagramSMSAuth(verifcationCodeData)
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => {
          this.loading = false;
          this.verificationForm.enable();
          this.verificationForm.get('accountName').disable();
        })
      )
      .subscribe(
        (data) => {
          this._toastrService.success('Изменения сохранены');
          this._dialogRef.close({
            isVerified: true,
          });
        },
        (err) => {
          const error = err.error.data || null;
          this.passwordErrorMessage = error.message || 'Ошибка';
          this._toastrService.error(this.passwordErrorMessage);
          this._dialogRef.close({
            isVerified: false,
          });
        }
      );
  }

  public onClickSendCodeAgain(): void {
    this.isCodeSending = true;

    this.isError = false;
    this.isCodeSended = false;

    this._mainService.resendCode(this._account.id).subscribe(
      () => {
        this.isCodeSending = false;
        this.isCodeSended = true;
      },
      (err) => {
        const error = err.error;
        const message: string = error.message || 'Ошибка';

        this.isCodeSending = false;
        this.isCodeSended = false;

        this.isError = true;
        this.errorMessage = message;
      }
    );
  }

  public onClickSave(): void {
    this._verificationCode();
  }

  public checkIsValid(controlName): boolean {
    return (
      this.verificationForm.get(controlName).hasError('required') &&
      this.verificationForm.get(controlName).touched
    );
  }

  public verifyCheck(evt) {
    evt.stopPropagation();
    let currentUser: User;
//    let currentInstagram: InstagramAccount;

    this.store.pipe(select(currentUserSelector)).subscribe((x: User) => {
      currentUser = x;
    });
    // this.store.pipe(select(currentInstagramSelector)).subscribe(x => {
    //   currentInstagram = x;
    // });

    this._mainService.checkSession(currentUser.id, this._account.id).subscribe(
      (x: any) => {
        if (x.code === 200) {
          this._toastrService.success('Проверка подключения успешно завершена.');
          this._dialogRef.close(true);
        } else {
          console.log(x);
          this._toastrService.error('Проверка подключения не успешна.');
        }
      }, (err: any) => {
        console.log(err);
        this._toastrService.error('Проверка подключения не успешна.');
      });
  }
}
