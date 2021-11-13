import { User } from './com/annaniks/lift/core/models/user';
import { Observable } from 'rxjs';
import { getCurrentUserAction } from './com/annaniks/lift/pages/auth/store/actions/getCurrentUser.action';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { finalize, map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { currentUserSelector } from './com/annaniks/lift/pages/auth/store/selectors';
import { IPayment } from './com/annaniks/lift/shared/interfaces/payment.interface';
import { ToastrService } from 'ngx-toastr';
import { MainService } from './com/annaniks/lift/pages/main/main.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  title = 'lift-frontend';

  amount: string;
  currentUser: User;
  isLoading: boolean;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _httpClient: HttpClient,
    private _toastrService: ToastrService,
//    private mainSvc: MainService,
    private store: Store) {
    _router.events
      .pipe(
        map((route) => {
          if (route instanceof NavigationEnd) {
            window.scrollTo(0, 0);
          }
        })
      )
      .subscribe();

    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
    });
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.store.dispatch(getCurrentUserAction());
    this.amount = '1000';
  }

  hideBackDrop() {
    const backDrop = document.getElementById('custom-modal-back-drop');
    backDrop.style.display = 'none';
    const dialog = document.getElementById('custom-payment-dialog');
    backDrop.style.display = 'none';
  }
  captureClick(evt) {
    evt.stopPropagation();
  }
  focusMethod(evt) {
    document.getElementById('amauntValue').focus();
    evt.stopPropagation();
  }
  onKeyUpHandler(x) { // appending the updated value to the variable
    this.amount = x;
  }

  validateForm(value: string) {
    let errMessage = '';
    const numberRgx = /^(0|[1-9]\d*)?([\,\.]\d{1,2})?$/;

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
      this._toastrService.error(errMessage);
      return false;
    }
    return true;
  }

  formatPaymentValue(value: string) {
    const tmp = value.replace(',', '.');
    const tmp1 = tmp.replace(' ', '');
    return parseFloat(tmp1);
  }


  private payment(data: IPayment): Observable<any> {
    return this._httpClient.post<IPayment>('addFunds', data);
  }

  save() {
    this.amount = document.getElementById('amauntValue')['value'];
    if (!this.validateForm(this.amount))
    {
      return;
    }

    const request: IPayment = {
      userId: this.currentUser.id,
      funds: this.formatPaymentValue(this.amount),
      currency: 'RUB',
      description: 'Оплата за сервис liftme.pro'
    };
    this.isLoading = true;

    this.payment(request).pipe(
      finalize(() => {
        this.hideBackDrop();
      })
    )
    .subscribe(
      (resp: any) => {
        this.isLoading = false;
        if (resp.data && resp.data.confirmation && resp.data.confirmation.confirmation_url) {
          window.location.href = resp.data.confirmation.confirmation_url;
        } else {
          console.log(resp);
          this._toastrService.error('Ошибка в сети. Повторите операцию');
        }
      },
      (err: any) => {
        console.log(err);
        this._toastrService.error(err.error.data);
        this.isLoading = false;
      }
    )
  }

}
