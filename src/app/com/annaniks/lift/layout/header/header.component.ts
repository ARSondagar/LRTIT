import { currentInstagramSelector, currentUserSelector } from './../../pages/auth/store/selectors';
import { switchUserAction } from './../../pages/auth/store/actions/switchUser.action';
import { DeviceDetectorService } from 'ngx-device-detector'
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
} from '@angular/core';
import { MainService } from '../../pages/main/main.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize, tap } from 'rxjs/operators';
import { User, InstagramAccount } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { select, Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/app.service';
import { IUserDetails } from '../../shared/interfaces/user.details.interface';
import { IServiceBase } from '../../shared/interfaces/tariff.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject<void>();
  public showNots = false;
  public showQuestion = false;
  public showUserDetails = false;
  public showSwitchAccount = false;
  public leftMenuOpened = false;
  public rightMenuOpened = false;
  public isRestricted: boolean;
  public isMobileVersion = false;
  currentUser$: Observable<User | null>
  currentUserId: number;
  currentInstagram: InstagramAccount | null;

  public hasImage = false;
  public imageToShow: string | ArrayBuffer;

  constructor(
    private _authService: AuthService,
    private _mainService: MainService,
    public appSvc: AppService,
    private _router: Router,
    private store: Store,
    private _cookieService: CookieService,
    private deviceService: DeviceDetectorService,
    @Inject('FILE_URL') private _fileUrl: string
  ) {
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this.currentUser$ = this.store.pipe(
      select(currentUserSelector),
      tap((x: User) => {
        this.currentUserId = x.id;
        this.appSvc.getCurrentUserDetails(this.currentUserId).subscribe();  // Ensure are validation flags set
      })
    );
    this.store.pipe(select(currentInstagramSelector)).subscribe(x => {
      this.currentInstagram = x;
      if (this.currentInstagram) {
        this._authService.readImageFromInstagram(this.currentInstagram, -1, this.stdCallback);
      }
    });
    this.isMobileVersion = this.deviceService.isMobile();
  }

  private stdCallback = (hasImage: boolean, imageToShow: string | ArrayBuffer, i: number = -1) => {
    if (i < 0) {
      this.hasImage = hasImage;
      this.imageToShow = imageToShow;
    } else {
      this.hasImage[i] = hasImage;
      this.imageToShow[i] = imageToShow;
    }
  }

  public onClickLogOut(): void {
    this._mainService
      .logOut()
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => {
          this._cookieService.removeAll();
          this._router.navigate(['/auth/login']);
        })
      )
      .subscribe();
  }

  public handleSelectAccount($event: InstagramAccount) {
    const instagramAccount = $event;
    localStorage.removeItem('currentInstagramUser')
    this.store.dispatch(switchUserAction({ instagramAccount }));
  }

  public toggleNotsPanel(): void {
    this.showNots = !this.showNots;
  }

  public toggleQuestions(): void {
    this.showQuestion = !this.showQuestion;
  }

  public toggleLeftMenu(): void {
    this.leftMenuOpened = !this.leftMenuOpened;
    this.rightMenuOpened = false;
  }
  public closeMenu(evt: any) {
    if (this.leftMenuOpened && !!evt.srcElement['href']) {
      this.toggleLeftMenu();
    } else if (this.rightMenuOpened && !!evt.srcElement['href']) {
      this.toggleRightMenu();
    }
  }
  public toggleRightMenu(): void {
    this.rightMenuOpened = !this.rightMenuOpened;
    this.leftMenuOpened = false;
  }

  public toggleUserDetails(): void {
    this.showUserDetails = !this.showUserDetails;
  }

  public toggleSwitchAccount(): void {
    this.showSwitchAccount = !this.showSwitchAccount;
  }

  public onClickedOutsideNots(): void {
    this.showNots = false;
  }

  public onClickedOutsideQuestions(): void {
    this.showQuestion = false;
  }

  public onClickedOutsideUserDetails(): void {
    this.showUserDetails = false;
  }

  public onClickedOutsideSwitch(): void {
    this.showSwitchAccount = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize($event) {
    if (window.innerWidth <= 900) {
      this.leftMenuOpened = false;
      this.rightMenuOpened = false;
    }
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
