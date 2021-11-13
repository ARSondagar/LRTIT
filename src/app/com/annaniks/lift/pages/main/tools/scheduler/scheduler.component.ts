import {currentInstagramSelector, currentUserSelector} from './../../../auth/store/selectors';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarWeekViewComponent,
  CalendarMonthViewComponent,
} from 'angular-calendar';
import {MatDialog} from '@angular/material';
// import {EventsSchedulerComponent} from './events-scheduler/events-scheduler.component';
import {colors} from '../../../../core/themes/calendar';
import {DialogService} from './dialog.service';
import {combineLatest, forkJoin, Observable, Subject} from 'rxjs';
import {
  GetPostAndStoriesData,
  PostOrStory,
} from '../../../../core/models/autoposting';
import {SchedulerService} from './scheduler.service';
import {/*takeUntil, finalize, switchMap, */map, filter, tap, distinctUntilChanged, mergeMap} from 'rxjs/operators';
// import {LoadingService, AuthService} from '../../../../core/services';
import {InstagramAccount/*, User, UserExt*/} from '../../../../core/models/user';
import {
  SchedulerList,
  SchedulerListItem,
} from '../../../../core/models/scheduler';
import {select, Store} from '@ngrx/store';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import moment from 'moment';
import * as _ from 'lodash';

import { ICalendarMetaData, IFollowers, IFollowerTags, ILocation } from '../../../../shared/interfaces/massfollow.interface';
import { IFollowersBase, IFollowersWeb, IStatisticWeb } from '../../../../shared/interfaces/massfollow.interface';
import { FollowersDetailsComponent } from './followers-details/followers-details.component';
import { maxTime } from 'date-fns';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
})
export class SchedulerComponent implements OnInit, AfterViewInit {
  @ViewChild('weekCalendar', {static: false})
  private _weekCalendar: CalendarWeekViewComponent;
  @ViewChild('monthCalendar', {static: false})
  private _monthCalendar: CalendarMonthViewComponent;

  private _unsubscribe$ = new Subject();
  private isSchedulerDetailsOpen = false;
  private _activeAccount: InstagramAccount = {} as InstagramAccount;
  public view: CalendarView = CalendarView.Month;
  public schedulerList: SchedulerListItem[];

  public locale = 'ru';
  public viewDate = new Date();
  public get nameOfMonth(): string {
    moment.locale(this.locale);
    const monthNames = moment.months();
    return monthNames[this.viewDate.getMonth()];
  }
  public get monthWithYear() {
    const rzlt = `${this.nameOfMonth}, ${this.viewDate.getFullYear()}`;
    return rzlt;
  }

  public events: CalendarEvent[] = [];
  public postOrStories: PostOrStory[] = [];
  public calendarType = 'month';
  public isRestricted: boolean;

  public schedulerData: {[dtValue: string]: IFollowers[]} = {};
  public schedulerTotals: {[dtValue: string]: IFollowers} = {};

  public instagramAccounts: InstagramAccount[];

  public showPreviewBlock$: Observable<number>;

  private currentUserId: number | null = null;
  private currentInstagramId: number | null = null;
  private minDate: string;
  private minDateWithTime: string;
  private maxDate: string;
  private fDictionary: {[key: string]: number}; // Number of followers every day
  private fkeys: string[];                      // Sorted keys from fDictionary
  private countTasks: number;

  constructor(
      private _dialog: MatDialog,
      private dialogService: DialogService,
      private _schedulerService: SchedulerService,
      private _appSvc: AppService,
      private store: Store,
      private _toastrService: ToastrService,
      private router: Router,
      private changeDetectorRef: ChangeDetectorRef
    ) {
    this.showPreviewBlock$ = this._appSvc.headerIsVisible$;
    this.isRestricted = environment.isRestricted;
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      this._appSvc.setHeaderFlag(0);
    });
  }

  ngOnInit() {
    combineLatest(
      this.store.select(currentUserSelector),
      this.store.select(currentInstagramSelector)
    ).pipe(
      distinctUntilChanged(),
      tap((data: any) => {
        console.log(data);
        this.currentUserId = data[0].id;
        this.instagramAccounts = _.cloneDeep(data[0].instagramAccounts);
        this.currentInstagramId = data[1].id
      }),
      mergeMap((data: any) => this.readCalendarData(data[0].id, data[1].id))
    ).subscribe((data: any) => {
      this.schedulerData = this.convertSchedulerData(data[0].data);
//      this.outputSchedulerData(this.schedulerData);
//      debugger;

      const followersData: IStatisticWeb[] = data[1].data.statistics;
      this.countTasks = data[2].data.totalCountTasks;

      this.calculateFollowers(followersData);
      this.insertFollowers();
      this.calculateConversions();
      this.calculateTotals();
      this.changeDetectorRef.detectChanges();
    });
  }

    private readCalendarData(currentUserId: number, currentInstagramId: number): Observable<any> {
    const request1 = {
      userId: currentUserId,
      loginId: currentInstagramId
    };

    const endDt  = new Date();
    const startDt = new Date();
    startDt.setFullYear(startDt.getFullYear() - 5);
    const request2 = {
      accountId: currentInstagramId,
      startDate: startDt.toISOString(),
      endDate: endDt.toISOString()
    };

    return combineLatest(
      this._schedulerService.getFollowingData(request1),
      this._schedulerService.getAllStatistics(request2),
      this._schedulerService.countTasks(request1)
    );
  }


  calculateFollowers(followersData: IStatisticWeb[]): void {
    this.fDictionary = {};
    followersData.forEach((x: IStatisticWeb) => {
      const key = x.date.split('T')[0];
      if (this.fDictionary.hasOwnProperty(key)) {
        this.fDictionary[key] += x.followers;
      } else {
        this.fDictionary[key] = x.followers;
      }
    });
    this.fkeys = Object.keys(this.fDictionary).sort();
  }

  onDayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if ((events instanceof Array) && events.length > 0) {
      const screen = this.getTopLeftCoordinates();
      const dialogRef = this._dialog.open(FollowersDetailsComponent, {
        maxWidth: '1056px',
        width: screen.panelClass.startsWith('Mobile') ? `${window.innerWidth - 10}px` : '90%',
        data: {
          minDate: this.minDateWithTime,
          shedulerEvt: events[0],
          panelClass: screen.panelClass,
          countTasks: this.countTasks,
          currentInstagramId: this.currentInstagramId
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.code === 200) {
          this._toastrService.success('Задача завершена');
          this.countTasks = Math.max(this.countTasks - 1, 0);
        }
      });
    }
  }

  getTopLeftCoordinates() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let sizeClass: string;
    if (w <= 590) {
      if (h < 800) {
        sizeClass = 'Mobile-1';
      } else {
        sizeClass = 'Mobile-2';
      }
    } else if (w <= 810) {
      sizeClass = 'Tablet';
    } else if (w <= 1100) {
      sizeClass = 'Desktop-1';
    } else {
      if (h <= 800) {
        sizeClass = 'Desktop-2';
      } else {
        sizeClass = 'Desktop-3';
      }
    }
    if (sizeClass.startsWith('Mobile')) {
      return {
        panelClass: sizeClass,
        position: {
          top: '0px',
          left: '0px'
        }
      };
    } else if (sizeClass === 'Tablet') {
      return {
        panelClass: sizeClass,
        position: {
          top: '50px',
          left: '50px'
        }
      };
    } else if (sizeClass === 'Desktop-1') {
      return {
        panelClass: sizeClass,
        position: {
          top: '50px',
          left: '40px'
        }
      };
    } else if (sizeClass === 'Desktop-2') {
      return {
        panelClass: sizeClass,
        position: {
          top: '50px',
          left: '272px'
        }
      };
    } else {
      return {
        panelClass: sizeClass,
        position: {
          top: '145px',
          left: '272px'
        }
      };
    }
  }

  ngAfterViewInit() {
    this._getActiveAccount();
  }

  private AddAllCalendarEvent(evtIndex: number, currentDay: string, schedulerData: IFollowers,  schedulerTotals: IFollowers): void {
    const metaData = {
      currentDay,
      schedulerData,
      schedulerTotals
    };
    const tmpDate = schedulerData.followDateObj.toDate();
    const utc = new Date(tmpDate.getTime() + tmpDate.getTimezoneOffset() * 60000);
    const calendarEvent: CalendarEvent = {
      id: evtIndex,
      start: utc,               // Date object, UTC time
      title: 'Получение подписчиков',
      color: colors.pink,
      cssClass: 'day-style',
      meta: metaData
    }
    this.events.push(calendarEvent);
  }

  private calculateTotals(): void {
    this.events = [];
    this.schedulerTotals = {};
    const keys: string[] = Object.keys(this.schedulerData).sort();
    for (let j = 0; j < keys.length; j++) {
      const currentDate = keys[j];
      this.schedulerTotals[currentDate] = _.cloneDeep(this.schedulerData[currentDate]);
      const thisDay = this.fDictionary.hasOwnProperty(currentDate) ? this.fDictionary[currentDate] : 0;
      const startDay = this.fDictionary.hasOwnProperty(this.minDate) ? this.fDictionary[this.minDate] : 0;
      this.schedulerTotals[currentDate].followers = Math.max(thisDay - startDay, 0)
      this.addPrevDays(j - 1, this.schedulerTotals[currentDate], keys);

      this.calculateTotalConversion(this.schedulerTotals[currentDate]);
      if (this.schedulerData[currentDate][0].id >= 0) { // TODO:
        this.AddAllCalendarEvent(j + 1, currentDate, this.schedulerData[currentDate][0], this.schedulerTotals[currentDate]);
      }
    }
  }

  calculateTotalConversion(total: IFollowers): void {
    if (total.followers == null) {
      total.conversion = null;
    } else if (total.followers === 0 || total.actions === 0) {
      total.conversion = 0;
    } else {
      total.conversion = Math.round(total.followers * 100 / total.actions);
    }
  }

  // Scan previous dates recursive
  private addPrevDays(lastIndex: number, total: IFollowers, keys: string[]): void {
    if (lastIndex >= 0) {
      const prevDay: string = keys[lastIndex];
      const prevItem = this.schedulerData[prevDay][0];  // TODO:
      total.actions += prevItem.actions;
      total.tags = this.concaTwoArrays<IFollowerTags>(total.tags, prevItem.tags, 'id');
      total.locations = this.concaTwoArrays<ILocation>(total.locations, prevItem.locations, 'pk');
      total.followersByAccounts = this.concaTwoArrays<string>(total.followersByAccounts, prevItem.followersByAccounts, '');
      this.addPrevDays(lastIndex - 1, total, keys); // Process previous day
    }
  }

  private calculateConversions(): void {
    // tslint:disable-next-line:forin
    for (const dateKey in this.schedulerData) {
      const item = this.schedulerData[dateKey][0];    // TODO:
      if (item.followers === null) {
        item.conversion = null;
      } else if (item.actions === 0 || item.followers === 0) {
        item.conversion = 0;
      } else {
        item.conversion = Math.round(item.followers * 100 / item.actions);
      }
    }
  }

  private insertFollowers() {
    let idForEmpty = -1;
    for (let j = 0; j < this.fkeys.length; j++) {
      const dateValue = this.fkeys[j];
      if (dateValue < this.minDate || dateValue > this.maxDate) {
        continue;
      }
      const thisDay = this.fDictionary[dateValue];
      let nextDay: number | null;
      let delta: number | null;

      if (j === this.fkeys.length - 1 || this.dayDifference(j, j + 1) > 1) {
        nextDay = null;
        delta = null;
      } else {
        nextDay = this.fDictionary[this.fkeys[j + 1]]
        delta = nextDay - thisDay;
      }

      if (this.schedulerData.hasOwnProperty(dateValue)) {
        const schedulerItem: IFollowers = this.schedulerData[dateValue][0]; // TODO:
        if (delta === null) {
          schedulerItem.followers = null;
        } else {
          schedulerItem.followers += delta;
        }
        if (!(schedulerItem.followersByAccounts instanceof Array)) {
          schedulerItem.followersByAccounts = [];
        }
      } else {
        const sDateUtc = `${dateValue}T12:00:00.000Z`;
        const newItem = {
          id: idForEmpty--,
          followedAccounts: [],
          followersByAccounts: [],
          loginId: this.currentInstagramId,
          stage: 0,
          day: 0,
          userId: this.currentUserId,
          status: '',
          tags: [],
          locations: null,

          followDate: dateValue,   // UTC format: "2021-09-17"
          followDateObj: moment.utc(sDateUtc),
          actions: 0,
          followers: delta
        };
        this.schedulerData[dateValue] = [newItem];
      }
    }
  }

  dayDifference(current: number, next: number) {
    const currentDay = moment.utc(`${this.fkeys[current]}T12:00:00.000Z`);
    const nextDay = moment.utc(`${this.fkeys[next]}T12:00:00.000Z`);
    return nextDay.diff(currentDay, 'days');
  }

  private convertSchedulerData(followers: IFollowersWeb[]): {[dtValue: string]: IFollowers[]} {
    this.minDate = '';
    this.minDateWithTime = '';
    this.maxDate = '';
    const reducer = (accumulator, item) => {            // accumulator is map: {[dtValue: string]: IFollowers[]}
      const dateUtc = moment.utc(item.followDate);
      const dateValue: string = item.followDate.split('T')[0];  // item is IFollowersWeb

      this.assignGlobalValues(dateValue, item);
      const actionsValue = Array.isArray(item.followedAccounts) ? item.followedAccounts.length * 4 : 0;
      if (dateValue in accumulator) {
        this.addCurrentItem(dateValue, item, actionsValue, accumulator);
      } else {
        const currentItem: IFollowers[] = [this.convertFollowersWeb(dateValue, actionsValue, item)];
        accumulator[dateValue] = currentItem;
      }
      return accumulator;
    };
    return followers.reduce(reducer, {});
  }

  private addCurrentItem(dateValue: string, item: IFollowersWeb, actionsValue: number,
                         accumulator: {[dtValue: string]: IFollowers[]}) {
    const i = accumulator[dateValue].findIndex(x => x.stage === item.stage && x.day === item.day && x.status === item.status);
    if (i >= 0) {
      const currentItem = accumulator[dateValue][i];
      currentItem.actions += actionsValue;
      if (item.tags instanceof Array) {
        currentItem.tags = this.concaTwoArrays<IFollowerTags>(currentItem.tags, item.tags, 'id');
      }
      if (item.locations instanceof Array) {
        currentItem.locations = this.concaTwoArrays<ILocation>(currentItem.locations, item.locations, 'pk');
      }
      if (item.followersByAccounts instanceof Array) {
        currentItem.followersByAccounts = this.concaTwoArrays<string>(currentItem.followersByAccounts, item.followersByAccounts, '');
      }
    } else {
      const newItem: IFollowers = this.convertFollowersWeb(dateValue, actionsValue, item);
      accumulator[dateValue].push(newItem);
    }
  }

  private convertFollowersWeb(dateValue: string, actionsValue: number, item: IFollowersWeb): IFollowers {
    const currentItem: any = Object.assign({}, <IFollowersBase>item);
    const dateUtc = moment.utc(item.followDate);
    currentItem.followDate = dateValue;
    currentItem.followDateObj = dateUtc;
    currentItem.actions = actionsValue;
    currentItem.followers = 0;
    if (!(currentItem.tags instanceof Array )) {
      currentItem.tags = []
    }
    if (!(currentItem.locations instanceof Array )) {
      currentItem.locations = []
    }
    if (!(currentItem.followersByAccounts instanceof Array )) {
      currentItem.followersByAccounts = []
    }
    return <IFollowers>currentItem;
  }

  private assignGlobalValues(dateValue: string, item: IFollowersWeb): void {
    if (this.minDate === '' || dateValue < this.minDate) {
      this.minDate = dateValue;
    }
    if (this.minDateWithTime === '' || item.followDate < this.minDateWithTime ) {
      this.minDateWithTime = item.followDate;
    }
    if (this.maxDate === '' || dateValue > this.maxDate) {
      this.maxDate = dateValue;
    }
    if (this.currentUserId !== item.userId || this.currentInstagramId !== item.loginId) {
      this.currentUserId = item.userId;
      this.currentInstagramId = item.loginId;
    }
  }

  private concaTwoArrays<T>(left: T[], right: T[], key: string): T[] {
    if (!(left instanceof Array)) {
      left = [];
    }
    if (right instanceof Array && right.length > 0) {
      if (key.length > 0) {
        right.forEach(rightItem => {
          const i = left.findIndex(x => x[key] === rightItem[key]);
          if (i < 0) {
            left.push(rightItem);
          }
        })
        return left;
      } else {
        return _.uniq(left.concat(right));
      }
    }
    return left;
  }

  private _getActiveAccount(): void {
    this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
      this._activeAccount = resp;
      this.viewDate = new Date();
      this.fetchMainData().subscribe((r) => {
      });
    });
  }

  public openSchedulerDetails(event: CalendarEvent, rowRef: HTMLElement): void {
    if (this.isSchedulerDetailsOpen) {
      return;
    }

    this.isSchedulerDetailsOpen = true;
    const prevClassName = rowRef.className;
    rowRef.className += ' active';
    const dialogRef = this.dialogService.openDialog(rowRef, true, event);
    dialogRef.afterClosed().subscribe((v) => {
      rowRef.className = prevClassName;
      this.isSchedulerDetailsOpen = false;
      if (v) {
        this.fetchMainData().subscribe();
      }
    });
  }

  public calendarTypeChanged(event: string): void {
    switch (event) {
      case 'month':
        this.view = CalendarView.Month;
        break;
      case 'week':
        this.view = CalendarView.Week;
        break;
      case 'day':
        this.view = CalendarView.Day;
        break;
      default:
        break;
    }
    this._getActionsScheduler().subscribe();
  }

  public viewDateChanged(): void {
    this._getActionsScheduler().subscribe();
  }
/*
  public addEvent(calendarDay): void {
    const event: CalendarEvent = {
      id: 1,
      start: calendarDay.date,
      end: new Date(calendarDay.date.getTime() + 100000000),
      title: 'Scheduler detail',
      color: colors.pink,
      cssClass: 'day-style',
    };
    this.events = [...this.events, event];
  }
*/
  private _getActionsScheduler(): Observable<any> {
    const sendingData: SchedulerList = {
      accountId: this._activeAccount.id,
      start: this._monthCalendar.view.days[0].date.getTime(),
      end: this._monthCalendar.view.days[
      this._monthCalendar.view.days.length - 1
        ].date.getTime(),
    };
    return this._schedulerService.getActionsScheduler(sendingData);
  }

  public fetchMainData(): Observable<any> {
    const joined = [this._getActionsScheduler(), this._getStoriesAndPosts()];
    return forkJoin(joined).pipe(
      map((response: any) => {
        this.schedulerList = response[0].data;
        this.postOrStories = response[1].data;

        const events: CalendarEvent[] = [];
        this.schedulerList.map((element, index) => {
          const event: CalendarEvent = {
            id: index,
            start: new Date(element.date),
            end: new Date(element.date),
            meta: {
              type: element.type,
              settings:
                element.type === 'follow'
                  ? element.massFollowingSettings
                  : element.massLookingSettings,
            },
            title: element.type === 'follow' ? 'Подписка' : 'Просмотр stories',
            color: element.type === 'look' ? colors.pink : colors.blue,
            cssClass: 'day-style',
          };
          events.push(event);
        });
        this.postOrStories.map((element, index) => {
          console.log(element);
          const event: CalendarEvent = {
            id: element.id,
            start: new Date(element.time),
            end: new Date(element.time),
            meta: {
              type: element.type,
              file: element.date.file,
              postOrStory: element,
            },
            title: element.type === 'post' ? 'Автопостинг' : 'Story',
            color: element.type === 'story' ? colors.pink : colors.blue,
            cssClass: 'day-style',
          };
          events.push(event);
        });
        if (events.length > 0) {
          this.events.concat(events);
        }
      })
    );
  }

  private _getStoriesAndPosts(): Observable<any> {
    const month = this.viewDate.getMonth();
    const year = this.viewDate.getFullYear();
    const sendingData: GetPostAndStoriesData = {
      accountId: this._activeAccount.id,
      month: month + 1,
      year: year,
    };
    return this._schedulerService.getPostsAndStoriesByMonth(sendingData);
  }
}
