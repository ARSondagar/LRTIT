import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AccountConnectionModalComponent, AccountVerificationModal } from '../../../../core/modals';
import { AccountConnectData } from '../../../../core/models/account';
import { InstagramAccount } from '../../../../core/models/user';
import { AccountConectInterface } from '../../../../shared/interfaces/accountConnect.interface';
import { MainService } from '../../../main/main.service';
import { getCurrentUserAction, setCurrentUserInstagramSuccessAction } from '../../store/actions/getCurrentUser.action';
import { switchUserAction, switchUserInstagramAction, switchUserSuccessAction } from '../../store/actions/switchUser.action';

@Component({
  selector: 'app-add-instagram',
  templateUrl: './add-instagram.component.html',
  styleUrls: ['./add-instagram.component.scss']
})
export class AddInstagramComponent implements OnInit, OnDestroy {

  public instagramForm: FormGroup;
  private _submitDisabled$ = new BehaviorSubject<boolean>(true);
  public submitDisabled$ = this._submitDisabled$.asObservable().pipe(
    distinctUntilChanged()
  );
  private _unsubscribe: Subject<void> = new Subject<void>();

  public errorMessage: string;
  public loading = false;
  public isMainStream = true;

  constructor(
    private _fb: FormBuilder,
    private _httpClient: HttpClient,
    private actRoute: ActivatedRoute,
    private _mainService: MainService,
    private _toastrService: ToastrService,
    private _router: Router,
    private store: Store,
    private _matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.instagramForm = this._fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.isMainStream = true;

    this.instagramForm.valueChanges.subscribe(() => {
      const loginControl = this.instagramForm.controls['login'];
      const passwordControl = this.instagramForm.controls['password'];
      const notEmpty = (loginControl.value && loginControl.value.length > 0) &&
                       (passwordControl.value && passwordControl.value.length > 0);
      this._submitDisabled$.next(!notEmpty);
    });
  }

  onClickClose(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this._router.navigateByUrl('/login');
  }

  public getValidationError(field: string, errorName: string): boolean {
    return (
      this.instagramForm.get(field).hasError(errorName) &&
      this.instagramForm.get(field).touched
    );
  }
  onInstagramSubmit(evt) {
    const form = this.instagramForm.value;
    const values = {
      login: form.login,
      password: form.password,
    };
    this._connectAccount(values);
  }

  private _connectAccount(loginValues: any): void {
    this.loading = true;
    this.errorMessage = undefined;

    this.accountConnect({
        username: loginValues.login,
        password: loginValues.password,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this._unsubscribe)
      )
      .subscribe(
        (resp: AccountConectInterface) => {
          if (resp.code === 200) {
            const data = resp.data;
            localStorage.setItem('currentInstagramUser', JSON.stringify(data.account));
            this._mainService.currentInstagram = data.account;
            if (data.success) {
              this._singleFactorAuthFinal(data);
            } else if (data.account.verificationType === 'two') {
              this._twoFactorAuthProceed(data.account);
            } else {
              this.store.dispatch(getCurrentUserAction());    // ??
            }
          } else {
            this._toastrService.error(`Ошибка, HTTP код ${resp.code}`);
          }
        },
        (err) => {
          if (err.error.data) {
            this._toastrService.error(err.error.data);
          } else {
            this._toastrService.error(err.message);
          }
        });
  }

  private _twoFactorAuthProceed(account: InstagramAccount) {
    const dialogRef: any = this.openInstagramForm('two');
    dialogRef.afterClosed().subscribe((data) => {
      this._mainService.dlgState = false;
      this._mainService.socketState = false;
      this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  account}));
      setTimeout(() => {
        this._router.navigate(['/statistics/preview']);
      }, 200);
    });
  }
  private openInstagramForm(type): any {
    if (!this._mainService.dlgState) {
      const dialoRef = this._matDialog.open(AccountConnectionModalComponent, {
        width: '450px',
        data: {
          isFirstAccount: false,
          instagramId: this._mainService.currentInstagram.id,
          account: this._mainService.currentInstagram,
          type,
        },
      });
      this._mainService.dlgState = !!dialoRef;
      return dialoRef;
    }
  }

/*
  private _twoFactorAuthProceed(account: InstagramAccount) {

    const dialoRef = this._matDialog.open(AccountVerificationModal, {
      width: '650px',
      data: {
        account: account,
      },
    });
    dialoRef.afterClosed().pipe(
      finalize(() => {
        localStorage.removeItem('isShow');
      }),
      catchError(err => {
        console.log(err);
        return of(false)
      })
    ).subscribe((success: boolean) => {
      this._mainService.currentInstagram = account;
      this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  account}));
      this.store.dispatch(getCurrentUserAction());    // ??
      const url: string = success ? '/statistics/preview' : '/login';
      setTimeout(() => {
        this._router.navigate([url]);
      }, 2000);
    });
  }
*/
  private _singleFactorAuthFinal(data: any) {
    this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  data.account}));
    setTimeout(() => {
      this._router.navigate(['/statistics/preview']);
    }, 200);
  }

  resetForm(form: FormGroup) {
    form.reset();
      Object.keys(form.controls).forEach(key => {
        form.get(key).setErrors(null) ;
      });
  }

  public accountConnect(data: AccountConnectData): Observable<AccountConectInterface> {
    return this._httpClient.post<AccountConectInterface>('instagram-connect', data).pipe(
      tap(x => {
        console.log(x);
//        debugger;
      }),
      catchError(err => {
        console.log(err);
        return throwError(err);
      })
    );
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

}
