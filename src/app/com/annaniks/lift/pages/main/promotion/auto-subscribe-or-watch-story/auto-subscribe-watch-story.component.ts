import { ConditionInterface, ConditionType, MassfollowInterface } from './../../../../shared/interfaces/massfollow.interface';
import { InstagramAccount, User, UserExt } from 'src/app/com/annaniks/lift/core/models/user';
import { currentUserSelector } from 'src/app/com/annaniks/lift/pages/auth/store/selectors';

import { currentInstagramSelector } from './../../../auth/store/selectors';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { AutoSubscribeOrWatchStoryService } from '../../../../shared/services/auto-subscribe-watch-story.service';
import { SubSink } from 'subsink';
import { switchMap, finalize, filter, tap, distinctUntilChanged, map } from 'rxjs/operators';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { MassFollowingSettings } from '../../../../core/models/account';
import { LoadingService } from '../../../../core/services/loading-service';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { SubscribeParametresComponent } from './subscribe-parametres/subscribe-parametres.component';
import * as _ from 'lodash';
import { SchedulerService } from '../../tools/scheduler/scheduler.service';
import { IUserDetails } from '../../../../shared/interfaces/user.details.interface';
import { NzOptionSelectionChange } from 'ng-zorro-antd';

@Component({
  selector: 'app-auto-subscribe-watch-story',
  templateUrl: './auto-subscribe-watch-story.component.html',
  styleUrls: ['./auto-subscribe-watch-story.component.scss']
})
export class AutoSubscribeOrWatchStoryComponent implements OnInit, OnDestroy {
  private _subs = new SubSink();
  public loading = false;
  public isAutosubscribe = false;
  public massfollowingData: any = new MassFollowingSettings();
  public showPreviewBlock$: Observable<number>;
  public isRestricted: boolean;
  public currentInstagram: InstagramAccount | null = null;
  public currentUser: UserExt | null = null;
  public userDetails: IUserDetails | null = null;
  public noModifications = true;
  public conditionWasModified$: Observable<boolean>;
  public countTask = -1;

  public promotionIsActive: boolean;
  public testFollowing: boolean;
  public wasTestFollowing: boolean;
  public secondCurtain: boolean;

  @ViewChild('subscribeParametres', {static: false}) child: SubscribeParametresComponent;

  constructor(
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    private _loadingService: LoadingService,
    private store: Store,
    public appSvc: AppService,
    private _schedulerService: SchedulerService,
    private _toastrService: ToastrService,
    private _activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.isAutosubscribe = this._activatedRoute.snapshot.data.type === 'subscribe';
    this.showPreviewBlock$ = appSvc.headerIsVisible$;
    this.isRestricted = environment.isRestricted;

    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      appSvc.setHeaderFlag(0);
    });
  }

  ngOnInit() {
    this._autoSubscribeOrWatchStoryService.resetSettings();
    this.conditionWasModified$ = this._autoSubscribeOrWatchStoryService.conditionWasModified$.pipe(
      distinctUntilChanged()
    );

    this._fetchSettingsData()
    .subscribe(x => {
      if (this.currentInstagram && this.currentInstagram.id > 0) {
        this.callCountTasks(this.currentInstagram.id);
      } else {
        this.countTask = -1;
        this._toastrService.error('Выберите Инстаграм аккаунт.');
      }
      this.noModifications = true;

      const routeUrl = this.router.url;

      // TODO: Uncomment one of the variants for debugging
      // this.promotionIsActive = true; // 1 variant
      // this.testFollowing = false;
      // this.wasTestFollowing = true;
      // this.promotionIsActive = false; // 2 variant
      // this.testFollowing = false;
      // this.wasTestFollowing = false;
      // this.promotionIsActive = false; // 3 variant
      // this.testFollowing = true;
      // this.wasTestFollowing = true;
      // this.promotionIsActive = false; // 4 variant
      // this.testFollowing = false;
      // this.wasTestFollowing = true;

      this.secondCurtain = this.router.url === '/promotion/autosubscribe';
      if (this.promotionIsActive ||     // 1
          !this.promotionIsActive && !this.testFollowing && !this.wasTestFollowing ||   // 2
          !this.promotionIsActive && this.testFollowing && this.wasTestFollowing ||     // 3
          !this.promotionIsActive && !this.testFollowing && this.wasTestFollowing) {    // 4
        this.appSvc.showPaimentCurtain = false;
      } else {
        this.appSvc.showPaimentCurtain = true;
      }
    });
  }

  private callCountTasks(instagramId: number): void {
    // this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
    //   this.currentUser = resp;
    // });
    if (this.currentUser && this.currentUser.id > 0) {
      const request1 = {
        userId: this.currentUser.id,
        loginId: this.currentInstagram.id
      };
      this._schedulerService.countTasks(request1).subscribe(
        (data) => {
          if (data.code === 500) {
            this._toastrService.error('Не удалось прочесть количество задач.');
            this.countTask = -1;
          }
          this.countTask = data.data['totalCountTasks'];
        },
        err => {
          this._toastrService.error('Не удалось прочесть количество задач.');
          this.countTask = -1;
        })
    } else {
      this._toastrService.error('ID пользователя не найден. Повторите подсоединение к программе.');
      this.countTask = -1;
    }

  }
  private _fetchSettingsData(): Observable<boolean> {
    this._loadingService.showLoading();
    const _usrDetails$: Observable<IUserDetails> = this.store.pipe(select(currentUserSelector)).pipe(
      tap(
        (x: UserExt) => {
          this.currentUser = x;
          this.testFollowing = x.testFollowing;
          this.wasTestFollowing = x.wasTestFollowing;
      }),
      switchMap(
        (x: UserExt) => this.appSvc.getCurrentUserDetails(x.id)
      ),
      map((x: any) => {
        return x.data;
      }),
      tap((usrDtl: IUserDetails) => {
        const promoId = usrDtl.services.findIndex(x => x.id === 1);
        this.promotionIsActive = promoId >= 0 && usrDtl.services[promoId].active;
      })
    );

    const _settings$:  Observable<MassFollowingSettings> = this.store.pipe(select(currentInstagramSelector)).pipe(
      tap((x: InstagramAccount) => {
        this.currentInstagram = x;
      }),
      switchMap((account: any) => {
        this._autoSubscribeOrWatchStoryService.resetSettings();
        if (account && account.id) {
          return this.getSettings(account.id);
        } else {
          throwError('Internal JS error');
        }
      }),
      map((x: any) => {
        return x.data;
      })
    );

    return combineLatest(_usrDetails$, _settings$).pipe(
      tap(([usrDetails, usrSettings]) => {
        this.userDetails = usrDetails;
        this.massfollowingData = usrSettings;
      }),
      finalize(() => {
        this._loadingService.hideLoading();
        window.scrollTo(0, 0);
      }),
      switchMap(() => of(true))
    );
  }

  public enableTestPeriod(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this._schedulerService.enableTestPeriod(this.currentUser.id).subscribe(
      (data: any) => {
        this.appSvc.showPaimentCurtain = false;
        if (data.code === 200) {
          this.promotionIsActive = true;
        }
      }, (err) => {
        console.log(err);
        this._toastrService.error('Ошибка в сети');
      }
    )
  }

  public onSettingsSave(evt): void {
    evt.stopPropagation();
    evt.preventDefault();
    if (this.countTask > 0) {
      this._toastrService.warning('Остановите текущую задачу в планировщике перед тем как создать новую.');
      return;
    }

    const massfolowData: MassfollowInterface = {
      instagramAccountID: this.currentInstagram.id, // +this.massfollowingData.loginId,
      conditions: []
    }
    if (this.child) {
      this.child.collectData(massfolowData);
      if (massfolowData.conditions.length < 1) {
        this._toastrService.warning('Запишите хотя бы одно условие перед сохранением.');
        return;
      }
    }

    // аккаунты, которые комментируют
    if (this.massfollowingData.commentersByAccounts && this.massfollowingData.commentersByAccounts.length > 0) {
      massfolowData.conditions.push({
        type: ConditionType.AccountCommentators,
        values: this.massfollowingData.commentersByAccounts
      });
    }

    this.convertUserNames(massfolowData.conditions, ConditionType.AccountFollowers);

    // аккаунты, которые лайкают
    if (this.massfollowingData.likers && this.massfollowingData.likers.length > 0) {
      massfolowData.conditions.push({
        type: ConditionType.AccountLikers,
        values: this.massfollowingData.likers
      });
    }

    // в рамках локации
    if (this.massfollowingData.location && this.massfollowingData.location.length > 0) {
      const item = {
        type: ConditionType.Location,
        values: this.massfollowingData.location
      };
      this.PushIntoMassfolowData(item, massfolowData.conditions, 'pk');
    } else {
      const item = {
        type: ConditionType.Location,
        values: []
      };
      this.PushIntoMassfolowData(item, massfolowData.conditions, 'pk');
    }

    // тэги
    if (this.massfollowingData.tags && this.massfollowingData.tags.length > 0) {
      const item = {
        type: ConditionType.Tag,
        values: this.massfollowingData.tags
      };
      this.PushIntoMassfolowData(item, massfolowData.conditions, 'id');
    } else {
      const item = {
        type: ConditionType.Tag,
        values: []
      };
      this.PushIntoMassfolowData(item, massfolowData.conditions, 'id');
    }

    this._loadingService.showLoading();
    this._subs.add(
      this._autoSubscribeOrWatchStoryService.massfollow(massfolowData)
      .pipe(finalize(() => this._loadingService.hideLoading()))
      .subscribe((data) => {
        this._toastrService.success('Задача создалась и скоро запустится. Все изменения вы можете отслеживать в планировщике.');
        this._loadingService.hideLoading();

      }, (err) => {
        this._toastrService.error('Ошибка');
        this._loadingService.hideLoading();
      })

    )
  }

  convertUserNames(conditions: ConditionInterface[], conditionType: ConditionType) {
    const i = conditions.findIndex(x => x.type === conditionType);
    if (i < 0) {
      return;
    }
    const condValues = conditions[i].values.map(x => x.username);
    conditions[i].values = condValues;
  }

  private PushIntoMassfolowData(item: ConditionInterface, massfolowData: ConditionInterface[], key: string): void {
    const i = massfolowData.findIndex(x => x.type === item.type)
    if (i < 0) {
      if (item.values.length > 0) {
        massfolowData.push(item);
      }
    } else {
      const origValues: any[] = massfolowData[i].values; // Join and delete duplicstes
      item.values.forEach((x: any) => {
        if (key.length > 0) { // items in the array are objects
          if (!origValues.some(orig => orig[key] === x[key]))  {
            origValues.push(x);
          }
        } else {    // items of the array are strings
          if (!origValues.some(orig => orig === x))  {
            origValues.push(x);
          }
        }
      })
      massfolowData[i].values = origValues;
    }
  }


/*
  private getUsernameArray(objectArray: FollowersByAccount[]): string[] {
    const result: string[] = [];
    objectArray.forEach(object => {
      result.push(object.username)
    });

    return result;
  }

  private getUsernameArray(objectArray: FollowersByAccount[], massfolowData: MassfollowInterface): string[] {
    const result: string[] = [];
    objectArray.forEach(object => {
      result.push(object.username)
    });
    if (!massfolowData) {
      return result;
    }
    const newData = massfolowData.conditions.filter(x => x.type === ConditionType.AccountFollowers);
    if (!(newData instanceof Array)) {
      return result;
    }
    const newDataValues = newData[0].values;
    if (newDataValues.length < 1) {
      return result;
    }
    const joinedArray = result.concat(newDataValues);
    return _.sortedUniq(joinedArray);
  }
*/
  public getSettings(accountId: number): Observable<any> {
    this._loadingService.showLoading();
    return this._autoSubscribeOrWatchStoryService.getSettings(this.isAutosubscribe, accountId)
      .pipe(finalize(() => {
        this._loadingService.hideLoading();
      }));
  }

  goToPayment() {
    this.appSvc.showPaimentCurtain = true;
    this.router.navigateByUrl('tariff/tarif_new');
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
  }
}
