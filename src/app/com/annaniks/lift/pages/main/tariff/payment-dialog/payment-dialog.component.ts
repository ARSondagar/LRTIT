import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { select, Store } from '@ngrx/store';
import { User } from '../../../../core/models/user';
import { IPayment } from '../../../../shared/interfaces/payment.interface';
import { currentUserSelector } from '../../../auth/store/selectors';
import { MainService } from '../../main.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {

  form: FormGroup;
  amount: string;
  currentUser: User;
  isLoading: boolean;

  constructor(
    private fb: FormBuilder,
    private mainSvc: MainService,
    private store: Store,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.amount = data.value.toString();
  }

  ngOnInit() {
    this.form = this.fb.group({
      amount: [this.amount]
    });
    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
    });
    this.isLoading = false;
  }

  validateForm(value: string) {
    let errMessage = '';
    const numberRgx = /^(0|[1-9]\d*)?(\,\d{1,2})?$/;

    if (value.length < 1) {
      errMessage = 'Укажите сумму.'
    } else {
      if (!numberRgx.test(value.replace(' ', ''))) {
        errMessage = 'Введите число с возможными двумя знаками после запятой.\n' +
                     'Число не должно начинаться с нуля или заканчиваться запятой.\n' +
                     'Большие числа можете группировать вставляя пробелы в любом месте';
      }
    }
    if (errMessage) {
      this._snackBar.open(errMessage, 'Закрыть', {
        duration: 10000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return false;
    }
    return true;
  }

  formatPaymentValue(value: string) {
    const tmp = value.replace(',', '.');
    const tmp1 = tmp.replace(' ', '');
    return parseFloat(tmp1);
  }

  save() {
    if (!this.validateForm(this.form.controls['amount'].value))
    {
      return;
    }

    const request: IPayment = {
      userId: this.currentUser.id,
      funds: this.formatPaymentValue(this.form.controls['amount'].value),
      currency: 'RUB',
      description: 'Оплата за сервис liftme.pro'
    };
    this.isLoading = true;
    this.mainSvc.payment(request).pipe(
      finalize(() => {
        this.dialogRef.close();
      })
    )
    .subscribe(
      (resp: any) => {
        this.isLoading = false;
        if (resp.data && resp.data.confirmation && resp.data.confirmation.confirmation_url) {
          window.location.href = resp.data.confirmation.confirmation_url;
        } else {
          console.log(resp);
          const snackBarRef = this._snackBar.open('Ошибка в сети. Повторите операцию', 'Закрыть', {
            duration: 10000,
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      },
      (err: any) => {
        console.log(err);
        const snackBarRef = this._snackBar.open(err.error.data, 'Закрыть', {
          duration: 10000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        snackBarRef.afterDismissed().subscribe(() => {
          this.isLoading = false;
        });
      }
    )
  }

  close() {
    this.dialogRef.close();
  }
}

/*
Andrey Tyazhelomov, [23.08.21 17:19]
POST /addFunds
{ "userId": number, "funds": number }

Andrey Tyazhelomov, [23.08.21 17:20]
Funds - сумма которую юзер вводит

С него также придёт confirmationUrl на который надо перенаправить юзера
*/
