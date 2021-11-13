import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { getCurrentUserAction, setCurrentUserInstagramSuccessAction } from './../../../../pages/auth/store/actions/getCurrentUser.action';
import { AccountVerificationModal } from './../../../../core/modals/account-verification/account-verification.modal';
import { currentInstagramSelector, currentUserSelector } from './../../../../pages/auth/store/selectors';
// import { finalize } from 'rxjs/operators';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services/loading-service';
import { User } from 'src/app/com/annaniks/lift/core/models/user';
import { ServerResponse } from 'src/app/com/annaniks/lift/core/models/server-response';
import { from, Observable, of } from 'rxjs';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InstagramAccount } from '../../../../core/models/user';
import { MainService } from '../../../../pages/main/main.service';
import { select, Store } from '@ngrx/store';
import { switchUserAction } from '../../../../pages/auth/store/actions/switchUser.action';
import { AccountConnectionModalComponent } from '../../../../core/modals';

@Component({
  selector: 'app-header-switch-account',
  templateUrl: './header-switch-account.component.html',
  styleUrls: ['./header-switch-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderSwitchAccountComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('userAccounts') public userAccounts: InstagramAccount[] = [];
  @Input() public login: string;
  @Output() public selectAccount: EventEmitter<InstagramAccount> = new EventEmitter<InstagramAccount>();
  public selectedAccount: InstagramAccount;
  public addAcountIsValid: boolean;
  private dialog: any;
  private currentInstagram: InstagramAccount;

//  currentInstagram$: Observable<InstagramAccount | null>
  cUsrInstagramAccounts: InstagramAccount[] = [];

//  crrUsrInstagramAccounts$: Observable<InstagramAccount>;

  constructor(
    private _dialog: MatDialog,
    private _loadingService: LoadingService,
    private store: Store,
    private _matDialog: MatDialog,
    private _mainService: MainService
  ) {}

  ngOnInit() {
    this.store.pipe(select(currentInstagramSelector)).subscribe(inst => {
      this.currentInstagram = inst;
    });
    this.store.pipe(select(currentUserSelector)).subscribe(x => {
      this.cUsrInstagramAccounts = x.instagramAccounts.filter(acc => acc.active);
      this.addAcountIsValid = this.cUsrInstagramAccounts.length < (x.accountsAmount || 0);
    });
  }

  public openAccountConnectionModal(): void {
    const dialogRef: any = this.openInstagramForm('default');
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.isAccountConnected) {
        this._mainService.getMe().subscribe();
      }
    });
  }
  private openInstagramForm(type): any {
    if (!this._mainService.dlgState) {
      this.dialog = this._dialog.open(AccountConnectionModalComponent, {
        width: '450px',
        data: {
          isFirstAccount: false,
          type,
        },
      });
      this._mainService.dlgState = !!this.dialog;
      this.dialog.afterClosed().subscribe((data) => {
        this._mainService.dlgState = false;
        this._mainService.socketState = false;
      });
      return this.dialog
    }
  }


  public onClickAccount(item: InstagramAccount): void {
    this.selectedAccount = item;
    if (item.loginRequired) {
        this._loginAccountModal(item);
    } else {
      if (!item.verification) {
        this._verifyAccountModal(item);
      } else {
        this._mainService.currentInstagram = this.selectedAccount;
        this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  this.selectedAccount}));
        this.selectAccount.emit(this.selectedAccount);
      }
    }
  }

  private _verifyAccountModal(account: InstagramAccount): void {
    const dialoRef = this._matDialog.open(AccountVerificationModal, {
      width: '650px',
      data: {
        account: account,
      },
    });
    dialoRef
      .afterClosed()
      .pipe(
        switchMap((data: { isVerified: true }) => {
          localStorage.removeItem('isShow');
          if (data && data.isVerified) {
            return of(this.store.dispatch(getCurrentUserAction()));
          }
          return of();
        })
      )
      .subscribe();
  }

  private _loginAccountModal(account: InstagramAccount): void {
    const dialoRef = this._matDialog.open(AccountConnectionModalComponent, {
      width: '650px',
      data: {
        account: account,
        type: 'default',
        isDisable: true,
      },
    });
    dialoRef.afterClosed().subscribe((resp) => {
//      console.log(resp)
      if (resp && resp.isAccountConnected) {
        this._mainService.currentInstagram = this.selectedAccount;
        this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  this.selectedAccount}));
        this.selectAccount.emit(this.selectedAccount);
      }
    });
  }
}
