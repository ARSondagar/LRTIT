import { switchUserAction } from './../../../../auth/store/actions/switchUser.action';
import { getCurrentUserAction } from './../../../../auth/store/actions/getCurrentUser.action';
import {
  currentInstagramSelector,
  currentUserSelector,
} from './../../../../auth/store/selectors';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  AfterViewInit,
  EventEmitter,
  Output,
  Inject,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../../profile.service';
import { Subject, Observable, forkJoin, throwError, of } from 'rxjs';
import {
  takeUntil,
  finalize,
  switchMap,
  map,
  catchError,
} from 'rxjs/operators';
import { ChangeMe } from 'src/app/com/annaniks/lift/core/models/change-me';
import {
  User,
  InstagramAccount,
  UserExt,
} from 'src/app/com/annaniks/lift/core/models/user';
import { MainService } from '../../../main.service';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services/loading-service';
import { AuthService } from 'src/app/com/annaniks/lift/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModal,
  InstagramAccountChangeModal,
  AccountVerificationModal,
  AccountConnectionModalComponent,
} from 'src/app/com/annaniks/lift/core/modals';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'personal-settings',
  templateUrl: 'personal-settings.component.html',
  styleUrls: ['personal-settings.component.scss'],
})
// tslint:disable-next-line:component-class-suffix
export class PersonalSettings implements OnInit, OnDestroy {
  private days = Array.apply(null, Array(31));
  private month = Array.apply(null, Array(12));
  private years = Array.apply(null, Array(70));
  private nowYear = new Date().getFullYear();
  date = [
    {
      value: 'day',
      placeholder: 'День',
      options: this.days.map((item, index) => ({
        name: (index + 1).toString(),
        value: (index + 1).toString(),
      })),
    },
    {
      value: 'month',
      placeholder: 'Месяц',
      options: this.month.map((item, index) => ({
        name: (index + 1).toString(),
        value: (index + 1).toString(),
      })),
    },
    {
      value: 'year',
      placeholder: 'Год',
      options: this.years.map((item, index) => ({
        name: (this.nowYear - (18 + index)).toString(),
        value: (this.nowYear - (18 + index)).toString(),
      })),
    },
  ];
  @Input('user')
  set _userData(event) {
    this._formBuilder();
    if (event) {
      this.user = event;
      this.localImage =
        this.user && this.user.avatar
          ? `${this._fileUrl}/${this.user.avatar}`
          : 'assets/images/user.png';
      this._bindPersonalSettings(event);
    }
  }
  // tslint:disable-next-line:no-output-rename
  @Output('nextTab')
  private _nextTab = new EventEmitter<number>();

  private _unsubscribe$: Subject<void> = new Subject<void>();
  public localImage = 'assets/images/user.png';
  public dataForm: FormGroup;
  public contactForm: FormGroup;
  public loading = false;
  public user: User = {} as User;
  public userAccounts: InstagramAccount[] = [];
  public userImage: File;

  currentUser$: Observable<UserExt | null>;
  public currentInstagram: InstagramAccount;
  public activeAccounts: InstagramAccount[] = [];
  public addAcountIsValid: boolean;
  public availableAccounts = 0;

  public hasImage1 = false;
  public imageToShow1: string | ArrayBuffer;

  public hasImage: boolean[];
  public imageToShow: (string | ArrayBuffer)[];
  private messageSuccess: boolean;
  private dialog: any;

  constructor(
    private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _mainService: MainService,
    private _authService: AuthService,
    private _loadingService: LoadingService,
    private _dialog: MatDialog,
    @Inject('FILE_URL') private _fileUrl: string,
    private _toastrService: ToastrService,
    private store: Store,
    private _matDialog: MatDialog
  ) {
  }

  private stdCallback = (hasImage: boolean, imageToShow: string | ArrayBuffer, i: number = -1) => {
    if (i < 0) {
      this.hasImage1 = hasImage;
      this.imageToShow1 = imageToShow;
    } else {
      this.hasImage[i] = hasImage;
      this.imageToShow[i] = imageToShow;
    }
  }

  ngOnInit() {
    this.currentUser$ = this.store.pipe(select(currentUserSelector));

    this.store.pipe(select(currentUserSelector)).subscribe(usr => {
      this.activeAccounts = usr.instagramAccounts.filter(x => x.active);
      this.addAcountIsValid = this.activeAccounts.length < (usr.accountsAmount || 0);
      this.availableAccounts = Math.max((usr.accountsAmount || 0) - this.activeAccounts.length, 0);
      const i_max = this.activeAccounts.length;
      this.hasImage = new Array<boolean>(i_max);
      this.imageToShow = new Array<string | ArrayBuffer>(i_max);
      for (let i = 0; i < i_max; i++) {
        this._authService.readImageFromInstagram(this.activeAccounts[i], i, this.stdCallback);
      }
    });

    this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
      this.currentInstagram = resp;
      if (this.currentInstagram) {
        this._authService.readImageFromInstagram(this.currentInstagram, -1, this.stdCallback);
      }
    });
  }

  private _formBuilder(): void {
    this.dataForm = this._fb.group({
      name: ['', Validators.required],
      male: [true, Validators.required],
      date: [null],
    });
    this.contactForm = this._fb.group({
      phoneNumber: ['', Validators.required],
      currentCity: ['', Validators.required],
    });
  }

  private _refreshUser(): Observable<any> {
    return of(this.store.dispatch(getCurrentUserAction()));
  }

  private _bindPersonalSettings(settings): void {
    console.log('settings', settings);
    this.contactForm.patchValue({
      phoneNumber: settings.phone,
      currentCity: settings.city,
    });
    const day = settings.dbDay ? settings.dbDay.toString() : null;
    const month = settings.dbMount ? settings.dbMount.toString() : null;
    const year = settings.dbYear ? settings.dbYear.toString() : null;
    this.dataForm.patchValue({
      male: settings.male,
      name: settings.name,
      date: [
        {
          value: 'day',
          option: day && { value: day, name: day },
        },
        {
          value: 'month',
          option: month && { value: month, name: month },
        },
        {
          value: 'year',
          option: year && { value: year, name: year },
        },
      ],
    });
  }

  private _changeUserData(userData: ChangeMe): Observable<{}> {
    return this._profileService
      .changeMe(userData)
      .pipe(map((data) => data.data));
  }

  private _changeUserImage(): Observable<{}> {
    return this._profileService
      .changeUserPhoto(this.userImage)
      .pipe(map((data) => data.data));
  }

  private _deleteInstagramAccount(id: number): void {
    this._loadingService.showLoading();
    this._mainService
      .deleteInstaAccount(id)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$),
        switchMap(() => {
          const activeAccount = this.currentInstagram;
          if (activeAccount && activeAccount.id && id === activeAccount.id) {
            localStorage.removeItem('currentInstagramUser');
            const instagramAccount = {} as InstagramAccount;
            this.store.dispatch(switchUserAction({ instagramAccount }));
          }
          return this._refreshUser();
        })
      )
      .subscribe();
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
            return this._refreshUser();
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
      console.log(resp)
      if (resp && resp.isAccountConnected) {
        return of(this.store.dispatch(getCurrentUserAction()));
      } else {
        let user: User;

        this.store.pipe(select(currentUserSelector)).subscribe((resp1) => {
          user = resp1;

        });

        let instagramAccount: InstagramAccount;

        user.instagramAccounts.forEach(account1 => {
          if (account1.loginRequired === false && account1.verification === true) {
            instagramAccount = account1;
            return;
          }
        });
        this.store.dispatch(switchUserAction({ instagramAccount }));
        return;
      }
    });
  }

  public onClickChangeAccount(account: InstagramAccount): void {
    if (account.loginRequired) {
      this._loginAccountModal(account);
      return;
    }
    if (account.needPassword) {
      this._changeAccountModal(account);
      return;
    }
    if (!account.verification) {
      this._verifyAccountModal(account);
      return;
    }
    this._changeAccountModal(account);
  }

  public checkIsValid(formGroup, cotrolName): boolean {
    return (
      formGroup.get(cotrolName).hasError('required') &&
      formGroup.get(cotrolName).touched
    );
  }

  public onClickAddAccount(evt): void {
    evt.stopPropagation();
//    this._mainService.openAccountConnectionModal({ isFirstAccount: false });
    if (!this._mainService.dlgState) {
      this.dialog = this._dialog.open(AccountConnectionModalComponent, {
        width: '700px',
        height: '240px',
        panelClass: 'addAccountDlg',
        backdropClass: 'addAccountBackdrop',
        hasBackdrop: true,
        data: {
          isFirstAccount: false,
        },
      });
      this._mainService.dlgState = !!this.dialog;
      this.dialog.afterClosed().subscribe((data) => {
        this._mainService.dlgState = false;
        this._mainService.socketState = false;
        if (data.success) {
          window.location.reload();
        }
      }, (err) => {
        console.log(err);
      });
      return this.dialog
    }
  }

  private getDate(value: string) {
    const date = this.dataForm.value.date.find((item) => item.value === value);
    return (date && date.option && date.option.value) || null;
  }

  public changeMe(): void {
    this.loading = true;
    const dataForm = this.dataForm.value;
    const contactForm = this.contactForm.value;
    const sendingData: ChangeMe = {
      name: dataForm.name,
      phone: contactForm.phoneNumber,
    };

    const requests = [this._changeUserData(sendingData)];
    if (this.userImage) {
      requests.push(this._changeUserImage());
    }
    forkJoin(requests)
      .pipe(
        finalize(() => (this.loading = false)),
        switchMap(() => {
          this._toastrService.success('Изменения сохранены');

          return this._refreshUser();
        }),
        catchError((err) => {
          this._toastrService.error('Ошибка');
          return throwError(err);
        })
      )
      .subscribe();
  }

  public changePhoto($event): void {
    const fileList: FileList = $event.target.files;
    if (fileList && fileList[0]) {
      this.userImage = fileList[0];
      const file: File = fileList[0];
      const reader: FileReader = new FileReader();
      reader.onload = (event: any) => {
        this.localImage = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public openActionModal(accountId: number): void {
    const dialogRef = this._matDialog.open(ActionModal, {
      width: '350px',
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data === 'yes') {
        this._deleteInstagramAccount(accountId);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.unsubscribe();
  }

  public availableAccountsText(): string {
    let rzlt: string;
    switch (this.availableAccounts) {
      case 0:
        rzlt = 'В рамках вашего тарифа вы больше не можете подключить аккаунт для продвижения. Удалите неиспользуемые аккаунты или обновите ваш тариф.';
        break;
      case 1:
          rzlt = 'В рамках вашего тарифа вы можете подключить еще 1 аккаунт для продвижения';
          break;
      case 2:
      case 3:
      case 4:
        rzlt = `В рамках вашего тарифа вы можете подключить еще ${this.availableAccounts} аккаунта для продвижения`;
        break;
      default:
        rzlt = `В рамках вашего тарифа вы можете подключить еще ${this.availableAccounts} аккаунтов для продвижения`;
        break;
    }
    return rzlt;
  }
}
