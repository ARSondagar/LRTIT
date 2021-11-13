import { getCurrentUserAction, setCurrentUserInstagramSuccessAction } from './../auth/store/actions/getCurrentUser.action';
import { AccountVerificationModal } from './../../core/modals/account-verification/account-verification.modal';
import { InstagramAccount, UserExt } from './../../core/models/user';
import { currentUserSelector } from './../auth/store/selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from './main.service';
import { Subject, Observable, of, forkJoin } from 'rxjs';
import { takeUntil, map, switchMap, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AccountConnectionModalComponent, InstagramAccountChangeModal } from '../../core/modals';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { User } from '../../core/models/user';
import { select, Store } from '@ngrx/store';
import { id } from 'date-fns/locale';
import { ServerResponse } from '../../core/models/server-response';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  private _user: User = {} as User;
  private currentUser: User = {} as User;
  currentUser$: Observable<User | null>;
  public submenuIsVisible$: Observable<boolean>;

  private _unsubscribe$: Subject<void> = new Subject<void>();
  constructor(
    private _dialog: MatDialog,
    private _mainService: MainService,
    private _cookieService: CookieService,
    private _matDialog: MatDialog,
    private store: Store,
    private _router: Router
  ) {
    this._resetMainProperties();
    this.submenuIsVisible$ = this._mainService.showSubmenu$;
    this._router.events.pipe(
      filter(event => event instanceof NavigationStart && event.navigationTrigger === 'imperative')
    ).subscribe(
      (event: NavigationStart) => {
        this._mainService.showHideSubmenu(event.url !== '/statistics');
      }
    )
  }

  ngOnInit() {
    this._handleAccountConnectEvent();
    this.fetchMainData();
    this._mainService.initSocket();
    const url = this._router.url;
    const isNotStatistic = !url.startsWith('/statistics');
    this._mainService.showHideSubmenu(isNotStatistic);

    this.store.pipe(select(currentUserSelector)).subscribe((user) => {
      if (user && user.id) {
        this.currentUser = user;
      }
    });
  }

  public fetchMainData(): void {
    const joined = [this._mainService.getMe(), this._mainService.getAccountSettingsVariants()];
    forkJoin(joined).subscribe(
      (response) => {
        try {
          const userRes: ServerResponse<UserExt> = response[0];
          const user = userRes.data;
          this._checkUserAccountsState(user);
        } catch (error) {
          this._router.navigate(['/auth/login']);
        }
      },
      () => {
        this._router.navigate(['/auth/login']);
        this._cookieService.remove('accessTokenS');
        this._cookieService.remove('refreshTokenS');
      }
    );
  }

  // Variants:
  //  1) the user has no active instagram accounts. Use the value in _mainService
  //    a) this._mainService.currentInstagram.active == true --> open login dialog
  //    b) this._mainService.currentInstagram.loginRequired == false - proceed with current account
  //  2) the user has some active Instagram accounts.
  //    a) this._mainService.currentInstagram is not active
  //       *) use first Instagram account which does not require login
  //      **) open login dialog on first Instagram account (all accounts require login)
  //    b) this._mainService.currentInstagram is active
  //       *) open login dialog if this._mainService.currentInstagram requires login
  //      **) proceed with this._mainService.currentInstagram if this account does not require login.

  private _checkUserAccountsState(user: User): void {
    const activeInstagramAccounts = user.instagramAccounts.filter(acct => acct.active);
    if (!activeInstagramAccounts || activeInstagramAccounts.length < 1) {
      if (!this._mainService.currentInstagram) {
        return;
      }
      if (this._mainService.currentInstagram.loginRequired) {  // The user has no Instagram accounts: use this._mainService.currentInstagram
        this._loginAccountModal(this._mainService.currentInstagram);
      } else {
        this._mainService.setShowDisabledView(false);
        this._mainService._switchUser(this._mainService.currentInstagram);
      }
    } else {  // The user has some active Instagram accounts.
      const instagramAccountInd =  activeInstagramAccounts.findIndex(x => x.id === this._mainService.currentInstagram.id);
      if (instagramAccountInd < 0) { // this._mainService.currentInstagram is not active
        const i = activeInstagramAccounts.findIndex(x => !x.loginRequired);
        if (i >= 0) { // Use first Instagram account which does not require login
          this._mainService.setShowDisabledView(false);
          this._mainService._switchUser(activeInstagramAccounts[i]);
        } else {
          this._loginAccountModal(activeInstagramAccounts[0]);
        }
      } else {  // this._mainService.currentInstagram is active
        this._mainService.setShowDisabledView(false);
        if (this._mainService.currentInstagram.loginRequired) {
          this._loginAccountModal(this._mainService.currentInstagram);
        } else {
          this._mainService._switchUser(this._mainService.currentInstagram);
        }
      }
    }
  }

  private _checkIsHaveUnActiveAccount(userAccounts: InstagramAccount[]): void {
    const verificationAccountNames = '';
    const changePasswordAccountNames = '';
    userAccounts.map((element: InstagramAccount) => {
      if (element.loginRequired) {
        this._loginAccountModal(element);
      } else if (!element.verification) {
        const isCheckInstagramOn = localStorage.getItem('isCheckInstagramOn');
        if (!isCheckInstagramOn) {
          this._verifyAccountModal(element);
        }

        //  verificationAccountNames += `${element.login}, `;
      }
      if (element.needPassword) {
        this._changeAccountModal(element);
        // changePasswordAccountNames += `${element.login}, `;
      }
    });
    if (verificationAccountNames) {
      const message = `Для ${verificationAccountNames} аккаунтов необходима верификация для продолжения дальнейших действий:`;
      this._mainService._createImportantToastr(message);
    }
    if (changePasswordAccountNames) {
      const message = `Для ${changePasswordAccountNames} аккаунтов необходима изменение пароля для продолжения дальнейших действий:.`;
      this._mainService._createImportantToastr(message);
    }
  }

  private switchUserInstagram(account: InstagramAccount): void {
    this._mainService.currentInstagram = account;
    this._mainService.setShowDisabledView(false);
    this.store.dispatch(setCurrentUserInstagramSuccessAction({currentUserInstagram:  account}));
}

  private _loginAccountModal(account: InstagramAccount): void {
    const loginRequired = account.loginRequired;
    const dialoRef = this._matDialog.open(AccountConnectionModalComponent, {
      width: '650px',
      data: {
        account: account,
        type: 'default',
        isDisable: true,
      },
    });
    dialoRef.afterClosed().subscribe((resp) => {
      if (resp && resp.isAccountConnected) {
        this.switchUserInstagram(account);
        return;
      } else {
        let user: User;
        this.store.pipe(select(currentUserSelector)).subscribe((rsp: User) => {
          user = rsp;
        });

        let instagramAccount = user.instagramAccounts.find(
          (i) => i.active && i.loginRequired === false
        );
        if (!!instagramAccount) {
          this.switchUserInstagram(instagramAccount);   // Use first active account with loginRequired === false
          return;
        }

        instagramAccount = user.instagramAccounts.find(
          (i) => i.active
        );
        if (!!instagramAccount) {
          const tmpAccount = Object.assign({}, instagramAccount);  // Use first active account
          tmpAccount.loginRequired = false;                        // with tenporary disabled loginRequired
          this.switchUserInstagram(tmpAccount);
        } else {
          this._router.navigate(['/auth/login']);           // There is no active accounts ??
        }

      }
    });
  }

  private _changeAccountModal(account: InstagramAccount): void {
    const dialogRef = this._matDialog.open(InstagramAccountChangeModal, {
      maxWidth: '80vw',
      width: '600px',
      data: {
        account: account,
      },
    });
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

  private _handleAccountConnectEvent(): void {
    this._mainService.accountConnectionState
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        if (data && data.isOpen) {
          const accountData = data.accountData || {};
          this._openAccountConnectModal(accountData);
        }
      });
  }

  private _resetMainProperties(): void {
    this._mainService.resetMainProperties();
  }

  private _openAccountConnectModal(accountData?: any): void {
    const dialofRef = this._matDialog.open(AccountConnectionModalComponent, {
      id: 'AccountConnectionDialog1',
      maxWidth: '80vw',
      maxHeight: '80vh',
      width: '700px',
      disableClose: true,
      data: accountData,
    });
    dialofRef
      .afterClosed()
      .pipe(
        takeUntil(this._unsubscribe$),
        switchMap((data) => {
          if (data && data.isAccountConnected) {
            return this._getUser();
          } else if (
            !this._user ||
            (this._user.instagramAccounts &&
              this._user.instagramAccounts.length === 0)
          ) {
            this._router.navigate(['/auth/login']);
            return of();
          }
          return of();
        })
      )
      .subscribe();
  }

  private _getUser(): Observable<UserExt> {
    return this._mainService.getMe().pipe(
      map((data) => {
        this._user = data.data;
        return data.data;
      })
    );
  }

  get isShowDisabledView(): boolean {
    return this._mainService.getShowDisabledView();
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
