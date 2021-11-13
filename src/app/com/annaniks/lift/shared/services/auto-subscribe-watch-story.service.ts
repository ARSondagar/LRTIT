import { InstagramAccount, UserExt } from 'src/app/com/annaniks/lift/core/models/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// RxJs
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';

// Interfaces
import { ServerResponse } from '../../core/models/server-response';
import { Search, SearchTerm } from '../../core/models/search';
import { AuthService } from '../../core/services/auth.service';
import { MassFollowingSettings } from '../../core/models/account';
import { select, Store } from '@ngrx/store';
import { currentInstagramSelector, currentUserSelector } from '../../pages/auth/store/selectors';
import { MassfollowInterface } from '../interfaces/massfollow.interface';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';

@Injectable()
export class AutoSubscribeOrWatchStoryService {
  private _settingsEvent$ = new BehaviorSubject<MassFollowingSettings>(
    new MassFollowingSettings()
  );
  public settings: MassFollowingSettings;

  private _conditionWasModified$ = new BehaviorSubject<boolean>(false);
  public conditionWasModified$: Observable<boolean> = this._conditionWasModified$.asObservable();

  public get conditionWasModified(): boolean {
    return this._conditionWasModified$.value;
  }
  public set conditionWasModified(value: boolean) {
    this._conditionWasModified$.next(value);
  }

  public addedConditionsSubject$ = new Subject<{
    prev: string;
    next: string;
  }>();
  public addedConditionsObservable$ = new Observable<{
    prev: string;
    next: string;
  }>();

  public addedConditions: { type: string }[] = [];
  public currentInstagram: InstagramAccount;
  public currentUser: UserExt;

  constructor(
    private _httpClient: HttpClient,
    private store: Store,
    private _toastrService: ToastrService,
    private _authService: AuthService
  ) {
    this.resetSettings();
    this.addedConditionsObservable$ = this.addedConditionsSubject$.asObservable();
    this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
      this.currentInstagram = resp;
    });
    this.store.pipe(select(currentUserSelector)).subscribe(resp => {
      this.currentUser = resp;
    });
  }

  public searchFor(searchTerm: SearchTerm): Observable<ServerResponse<Search>> {
    console.log('SEARCH FOR CALL');
    const url =  `instagram-search/${searchTerm.query.replace(/\#/g, ' ') || ''}/${searchTerm.type}/${this.currentInstagram.id}`;
    return this._httpClient.get<ServerResponse<Search>>(url).pipe(
      timeout(30000),
      catchError(e => {
        this._toastrService.error('Сервер не отвечает');
        return throwError('Network error');
      })
    );
  }

  public massfollow(data: MassfollowInterface) {
    return this._httpClient.post<ServerResponse<{}>>('https://mf.liftme.pro/api/v1/massFollow', data)
    .pipe(
      // tap(x => {
      //   console.log(x);
      // }),
      catchError(err => {
        console.log(err);
        return of(null);
      })
    );
  }

  /*
    https://backend.dev.liftme.pro/
    https://mf.dev.liftme.pro/api/v1/massFollow
                             /api/v1/massFollow
  */
  public saveSettings(
    isAutosubscribe: boolean,
    followTime?: { start: Date; end: Date }
  ): Observable<ServerResponse<{}>> {
    const sendingData = {
      loginId: this.currentInstagram.id.toString(),
      tags: this.settings.tags || [],
      followersByAccounts: this.settings.followersByAccounts || [],
      commentersByAccounts: this.settings.commentersByAccounts || [],
      location: this.settings.location || [],
      likers: this.settings.likers || [],
      seeStories: this.settings.seeStories,
      dontFollowHiddenAccounts: this.settings.dontFollowHiddenAccounts,
      hidePostsAndStories: this.settings.hidePostsAndStories,
      comments: this.settings.comments || [],
      unfollowDays: this.settings.unfollowDays,
      filter: this.settings.filter,
      subscribesPerDay: this.settings.subscribesPerDay,
      subscribesPerHour: this.settings.subscribesPerHour,
      likeCountForFollower: this.settings.likeCountForFollower,
      followTime,
    };
    return this._httpClient.post<ServerResponse<{}>>(
      isAutosubscribe ? 'massfollowing' : 'masslooking',
      sendingData
    );
  }

  public getSettings(
    isAutosubscribe: boolean,
    activeAccountId: number
  ): Observable<ServerResponse<MassFollowingSettings>> {
    return this._httpClient
      .get<ServerResponse<MassFollowingSettings>>(
        isAutosubscribe
          ? `statistics/massfollowing/${this.currentUser.id}/${activeAccountId}`
          : `masslooking/${activeAccountId}`
      )
      .pipe(
        map((data) => {
          if (data && data.data) {
            this.settings = data.data;
          } else {
            this.settings = new MassFollowingSettings();
          }

          this._settingsEvent$.next(this.settings);
          return data;
        }),
        catchError(err => {
          console.log(err);
          throwError(err);
          return of(null);
        })
      );
  }

  public getSettingsByType(type: string): Observable<any> {
    return this.settingsState.pipe(map((settings) => settings[type] || []));
  }

  public resetSettings(): void {
    this.settings = new MassFollowingSettings();
    this._settingsEvent$.next(this.settings);
  }

  get settingsState(): Observable<MassFollowingSettings> {
    return this._settingsEvent$.asObservable();
  }
}
