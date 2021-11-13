import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Store, select } from '@ngrx/store';
import { Subject, forkJoin, Observable } from 'rxjs';
import { takeUntil, map, finalize, switchMap, filter } from 'rxjs/operators';

import { GetStatisticsInterface } from './../../types/get-statistics.interface';
import {
  currentInstagramSelector,
  currentUserSelector,
} from './../../../auth/store/selectors';
import {
  InstagramAccount,
  User,
} from 'src/app/com/annaniks/lift/core/models/user';
import { StatisticsService } from '../statistics.service';
import {
  StatisticsData,
  Statistic,
  PostStatistic,
  StatisticValue,
  LineChartData,
} from '../../../../core/models/statistics';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading-service';
import { SubscriptionData } from '../../../../core/models/account';
import { MainService } from '../../main.service';
import { InstagramStatisticsInterface } from '../../types/instagram-statistics.interface';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { IAccount1, IAccountLocal, IServiceBase, IServiceLocal, Itarif } from '../../../../shared/interfaces/tariff.interface';
import { TarifDataService } from '../../../../shared/services/tarif-data.service';
import { IUserDetails } from '../../../../shared/interfaces/user.details.interface';

import * as _ from 'lodash';

// function dateDiffInDays(startDate: string, endMoment: moment.Moment): number {
//   const startMoment = moment(new Date(startDate));  // Convert to user's local time
//   return endMoment.diff(startMoment, 'days');
// }

// Date difference using UTC
function dateDiffInDays(startDate: string, endMoment: moment.Moment): number {
  const startMoment = moment.utc(startDate);  // Convert to UTC time
  return endMoment.diff(startMoment, 'days');
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PreviewComponent implements OnInit, OnDestroy {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  private _activeAccount: InstagramAccount;
  // public set activeAccount(value: InstagramAccount) {
  //   this._activeAccount = value;
  // }

  public statistics: Statistic[] = [];
  public postsCount: StatisticValue = {} as StatisticValue;
  public followingsCount: StatisticValue = {} as StatisticValue;
  public followersCount: StatisticValue = {} as StatisticValue;
  public commentsCount: StatisticValue = {} as StatisticValue;
  public todayPostsCount: StatisticValue = {} as StatisticValue;
  public likesCount: StatisticValue = {} as StatisticValue;
  public lastViewCountInfo: StatisticValue = {} as StatisticValue;
  public postStatistics: PostStatistic[] = [];

  public followersChartLabels: string[] = [];
  public followersChartData: LineChartData[] = [];
  public likesChartLabels: string[] = [];
  public likesChartData: LineChartData[] = [];
  public isRestricted: boolean;

  lastBestPosts: InstagramStatisticsInterface[] = [];

  public currentStatistic = {
    posts: 0,
    followers: 0,
    followings: 0,
  };
/*
  private readonly today = new Date();
  private readonly yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1)
  );
*/
  private readonly today = moment.utc();

  public subscriptionForm: FormGroup;

  public loading = false;
  public showPreviewBlock$: Observable<number>;

  public currentInstagram: InstagramAccount;
  public currentUser: User;

  public finishDate = '';
  public dailyDiscount = 0;
  private userDetails: IUserDetails;
  private allServices: IServiceLocal[];
  private allAccaunts: IAccountLocal[];

  allPostscount = 0;
  allComments = 0;
  lastComments = 0;
  allLikes = 0;
  lastLikes = 0;
  allViewcount = 0;
  lastViewcount = 0;
  lastCommentsDiff: number;
  lastViewCountDiff: number;
  lastTwodays: string[] = ['', ''];

  constructor(
    private _statisticsServcie: StatisticsService,
    private _appSvc: AppService,
    private _datePipe: DatePipe,
    private _loadingService: LoadingService,
    private store: Store,
    private _fb: FormBuilder,
    private _mainService: MainService,
    private _toastrService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _tarifDataSvc: TarifDataService
  ) {
    this.showPreviewBlock$ = this._appSvc.headerIsVisible$;
    this.isRestricted = environment.isRestricted;
    this.finishDate = this._tarifDataSvc.endOfYear().toLocaleDateString('ru-RU');

    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      _appSvc.setHeaderFlag(0);
    });
  }

  ngOnInit() {
    this._initForm();
    this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
      this._activeAccount = resp;
      if (!this._activeAccount) {
        this._activeAccount = JSON.parse(localStorage.getItem('currentInstagramUser'));
      }
      if (!this._activeAccount) {
        this.router.navigateByUrl('login');
      }

      this.currentInstagram = this._activeAccount;

      this._setSubscriptionValues();
      this._getPreviewData().subscribe(() => {});
    });

    this.store.pipe(select(currentUserSelector)).subscribe((resp) => {
      this.currentUser = resp;
    });

    this.activatedRoute.data.subscribe(x => {
      this.allServices = x.data.allServices.services;
      this.allAccaunts = x.data.allServices.accounts;
      this.userDetails = x.data.userDetails;
      this.dailyDiscount = this.userDetails.debiting;
      this.formatAllAccaunts(this.userDetails.amountAccounts);
      this.formatAssignedServices(this.userDetails.services);
      this.finishDate = this._tarifDataSvc.getValidUntilDate(this.userDetails.balance, this.dailyDiscount);
    });

  }

  private _getPreviewData(): Observable<void> {
    this.loading = true;
    this._loadingService.showLoading();

    this.statisticsReset();
    if (!this.currentInstagram) {
      this.currentInstagram = JSON.parse(localStorage.getItem('currentInstagramUser'));
    }

    const id =  this.currentInstagram.id;
    const endDate = new Date();

    const startDate = new Date(new Date().setMonth(endDate.getMonth() - 1));

    const allStatisticsData: StatisticsData = {
      accountId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const getStatisticByPeriod: GetStatisticsInterface = {
      accountId: id,
      startDate: startDate.toISOString(), // startDateSP,
      endDate: endDate.toISOString()      // endDateSP,
    };

    this._getStatisticsByPeriod(getStatisticByPeriod);

    const joined = forkJoin(
      this._getAllStatistics(allStatisticsData)
    );
    return joined.pipe(
      takeUntil(this._unsubscribe$),
      finalize(() => {
        this.loading = false;
        this._loadingService.hideLoading();
      }),
      map((_) => {})
    );
  }

  private _getStatisticsByPeriod(request: GetStatisticsInterface) {   // Count UTC dates
    this._statisticsServcie.getStatisticsByPeriod(request).subscribe((resp) => {
      const stats = resp.data.statistics;
      this.allComments = 0;
      this.allLikes = 0;
      this.allViewcount = 0;
      const comments: any[] = [];

      const sortedStats = stats.slice(0)
        .sort((firstEl: InstagramStatisticsInterface, secondEl: InstagramStatisticsInterface) => {
          const firstDate = new Date(firstEl.createdAt);  // Sorting by local dates is equivalent to sorting by UTC
          const secondDate = new Date(secondEl.createdAt);
          return firstDate > secondDate
                    ? 1
                    : (firstDate < secondDate ? -1 : 0);
        });

      const views: any[] = [];

      const lastPosts: InstagramStatisticsInterface[] = [];
      const preLastPosts: InstagramStatisticsInterface[] = [];

      const postLikesHashMap: { [ket: string]: number } = {};
      const postCommentsHashMap: { [ket: string]: number } = {};
      const postViewsHashMap: { [ket: string]: number } = {};
      const postsHashMap: { [ket: string]: number } = {};


      let lastPostMoment: moment.Moment = moment.utc();
      if (stats.length > 0) {
        const lastPost = stats[stats.length - 1];
        lastPostMoment = moment.utc(lastPost.createdAt); // Convert to UTC time
      }
      let preLastPost: InstagramStatisticsInterface = null;
      for (let i = stats.length - 2; i >= 0; i--) {
        if (dateDiffInDays(stats[i].createdAt, lastPostMoment) > 0) {
          preLastPost = stats[i];
          break;
        }
      }
      const preLastPostDay: moment.Moment = preLastPost
                ? moment.utc(preLastPost.createdAt)
                : moment.utc().add(-1, 'days');
      const currenDateMoment: moment.Moment = moment.utc();

      stats.forEach((post) => {
        const postDate: moment.Moment = moment.utc(post.createdAt);
        const dateDiff: number = currenDateMoment.diff(postDate, 'days');
        this.allLikes += post.likeCount;
        if (dateDiff >= 0 && dateDiff < 30) {

          const dateKey = post.createdAt.split('T')[0];
          if (dateKey !== this.lastTwodays[1]) {
            this.lastTwodays[0] = this.lastTwodays[1];
            this.lastTwodays[1] = dateKey;
          }

          if (postLikesHashMap.hasOwnProperty(dateKey)) {
            postLikesHashMap[dateKey] += post.likeCount;
          } else {
            postLikesHashMap[dateKey] = post.likeCount;
          }

          if (postCommentsHashMap.hasOwnProperty(dateKey)) {
            postCommentsHashMap[dateKey] += post.commentCount;
          } else {
            postCommentsHashMap[dateKey] = post.commentCount;
          }
          this.allComments += post.commentCount;

          if (postViewsHashMap.hasOwnProperty(dateKey)) {
            postViewsHashMap[dateKey] += post.viewCount;
          } else {
            postViewsHashMap[dateKey] = post.viewCount;
          }
          this.allViewcount += post.viewCount;

          if (postsHashMap.hasOwnProperty(dateKey)) {
            postsHashMap[dateKey] += 1;
          } else {
            postsHashMap[dateKey] = 1;
          }
          this.allPostscount += post.viewCount;

          if (postDate.diff(lastPostMoment, 'days') === 0) {
            lastPosts.push(post);
          }

        }
      });

      const preLastDayComments = this.lastTwodays[0].length > 0 ? postCommentsHashMap[this.lastTwodays[0]] : 0;
      const lastDayComments = this.lastTwodays[1].length > 0 ? postCommentsHashMap[this.lastTwodays[1]] : 0;
      this.commentsCount = {
        todayCount: lastDayComments - preLastDayComments,
        value: lastDayComments,
        icon: this.getGrowthIcon(lastDayComments - preLastDayComments),
      };

      const preLastDayViewCounts = this.lastTwodays[0].length > 0 ? postViewsHashMap[this.lastTwodays[0]] : 0;
      const lastDayViewCounts =  this.lastTwodays[1].length > 0 ? postViewsHashMap[this.lastTwodays[1]] : 0;
      this.lastViewCountInfo = {
        todayCount: lastDayViewCounts - preLastDayViewCounts,
        value: lastDayViewCounts,
        icon: this.getGrowthIcon(lastDayViewCounts - preLastDayViewCounts),
      };

      const preLastDayLikes = this.lastTwodays[0].length > 0 ? postLikesHashMap[this.lastTwodays[0]] : 0;
      const lastDayLikes = this.lastTwodays[1].length > 0 ? postLikesHashMap[this.lastTwodays[1]] : 0;
      this.likesCount = {
        todayCount: lastDayLikes - preLastDayLikes,
        value: lastDayLikes,
        icon: this.getGrowthIcon(lastDayLikes - preLastDayLikes),
      };

      const preLastDayPosts = this.lastTwodays[0].length > 0 ? postsHashMap[this.lastTwodays[0]] : 0;
      const lastDayPosts = this.lastTwodays[1].length > 0 ? postsHashMap[this.lastTwodays[1]] : 0;
      this.postsCount = {
        todayCount: lastDayPosts - preLastDayPosts,
        value: lastDayPosts,
        icon: this.getGrowthIcon(lastDayPosts - preLastDayPosts),
      };

      this.likesChartLabels = Object.keys(postLikesHashMap).map((timestamp) => {
        return this._datePipe.transform(new Date(timestamp), 'dd');
      });
      this.likesChartData = [
        {
          data: Object.values(postLikesHashMap),
          label: 'Likes',
          borderColor: '#3399cc',
          backgroundColor: '#3399cc8f',
        },
      ];

      const currMonth = this.today.month(); // UTC Moment

      this.lastBestPosts = [
        ...lastPosts.filter(
          (post) =>  moment.utc(post.takenAt).month() === currMonth
        ),
      ]
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 5);
    });
  }

  getGrowthIcon(growth: number) {
    return growth > 0
      ? 'assets/images/preview_up_icon.png'
      : growth === 0
      ? 'assets/images/action_str.png'
      : 'assets/images/preview_down_icon.png';
  }

  private _getAllStatistics(
    allStatisticsData: StatisticsData
  ): Observable<void> {
    return this._statisticsServcie.getAllStatistics(allStatisticsData).pipe(
      takeUntil(this._unsubscribe$),
      map((data) => {
        const statistics: Statistic[] = data.data.statistics;
        this.followersChartLabels = statistics.map((element) => {
          return this._datePipe.transform(element.date, 'dd');
        });

        const followers = statistics.map((element) => {
          return element.followers;
        });

        this.followersChartData.push({
          data: followers,
          label: 'Folowers',
          borderColor: '#3399cc',
          backgroundColor: '#3399cc8f',
        });

        this.followingsCount = this._countStatistics('followings', statistics);
        this.followersCount = this._countStatistics('followers', statistics);
      })
    );
  }

  private _initForm(): void {
    this.subscriptionForm = this._fb.group({
      autosubscription: [false],
      autoreviewstories: [false],
      bonus: [false],
    });
    this.subscriptionForm.valueChanges
      .pipe(switchMap(() => this._setSubscriptionType()))
      .subscribe();
  }

  private _setSubscriptionValues(): void {
    this.subscriptionForm.patchValue(
      {
        autosubscription: this._activeAccount && this._activeAccount.subscription
                            ? this._activeAccount.subscription.autoFollowing
                            : false,
        autoreviewstories: this._activeAccount && this._activeAccount.subscription
                            ? this._activeAccount.subscription.autoView
                            : false,
        bonus: this._activeAccount && this._activeAccount.subscription
                            ? this._activeAccount.subscription.liftBonus
                            : false,
      },
      { emitEvent: false }
    );
  }

  private _setSubscriptionType(): Observable<void> {
    const sendingData: SubscriptionData = {
      autoFollowing: this.subscriptionForm.get('autosubscription').value,
      autoView: this.subscriptionForm.get('autoreviewstories').value,
      liftBonus: this.subscriptionForm.get('bonus').value,
      loginId: this.currentInstagram.id,
    };
    return this._mainService.setSubscriptionType(sendingData).pipe(
      map(() => {
        this._toastrService.success('Изменения сохранены !');
      })
    );
  }
/*
  private _getLikesAndComments(
    allStatisticsData: StatisticsData
  ): Observable<void> {
    return this._statisticsServcie
      .getStatisticsLikesComments(allStatisticsData)
      .pipe(
        takeUntil(this._unsubscribe$),
        map((data) => {
          const statistics = data.data;
          this.commentsCount = this._countStatistics('comment', statistics);
          this.likesCount = this._countStatistics('like', statistics);
        })
      );
  }
*/
  private _countStatistics(key: string, items: any[]): StatisticValue {
    let value = 0;
    let todayCount = 0;
    let icon: string;
    if (items && items.length && items.length >= 1) {
      const lastDay = items[items.length - 1];
      let beforYesterday;
      value = lastDay[key];
      try {
        beforYesterday = items[items.length - 2];
        todayCount = lastDay[key] - beforYesterday[key];
      } catch (error) {
        todayCount = lastDay[key];
      }
    }
    if (todayCount > 0) {
      icon = 'assets/images/preview_up_icon.png';
    } else if (todayCount === 0) {
      icon = 'assets/images/action_str.png';
    } else {
      icon = 'assets/images/preview_down_icon.png';
    }
    return { value, todayCount, icon };
  }

  statisticsReset(): void {
    this.postsCount = {} as StatisticValue;
    this.followingsCount = {} as StatisticValue;
    this.followersCount = {} as StatisticValue;
    this.commentsCount = {} as StatisticValue;
    this.todayPostsCount = {} as StatisticValue;
    this.likesCount = {} as StatisticValue;
    this.postStatistics = [];
    this.followersChartLabels = [];
    this.followersChartData = [];
    this.likesChartLabels = [];
    this.likesChartData = [];
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  private formatAllAccaunts(amountAccounts: IAccount1): void {
    this.allAccaunts.forEach(acc => {
      acc.isSelected = acc.id === amountAccounts.id;
    });
  }

  private formatAssignedServices(userServices: IServiceBase[]): void {
    const activeServices = _.filter(userServices, x => x.active);
    const svcSorted = _.sortBy(activeServices, x => x.id);
    const idList: number[] = _.map(svcSorted, x => x.id);

    this.allServices.forEach(svc => {
      svc.isOrdered = idList.findIndex(x => x === svc.id) >= 0
    });
    this.allServices.sort((a, b) => a.id >= b.id ? 1 : -1);

    this.allServices.unshift({
      id: 0,
      name: 'Статистика',
      active: true,
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOrdered: true,
      feeForMonth: 0
    });
    const selIndex = Math.max(this.allAccaunts.findIndex(x => x.isSelected), 0);
    const accountNumber = this.allAccaunts[selIndex].amountAccounts;
    this.allServices.push({
      id: 0,
      name: `Количество аккаунтов - ${accountNumber} шт.`,
      active: true,
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOrdered: true,
      feeForMonth: 0
    });
  }
}
