import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ServerResponse } from '../../../../core/models/server-response';
import { UsersList } from '../../../../core/models/my-lists';
import { GetPostAndStoriesData, PostOrStory } from '../../../../core/models/autoposting';
import { UtilsService } from '../../../../core/services';
import { SchedulerList, SchedulerListItem } from '../../../../core/models/scheduler';
import { catchError, tap } from 'rxjs/operators';
import { IFollowersWeb } from '../../../../shared/interfaces/massfollow.interface';
import { AllStatisticsResponse, StatisticsData } from '../../../../core/models/statistics';

@Injectable()

export class SchedulerService {

    constructor(private _httpClient: HttpClient, private _utilsService: UtilsService) { }

    public getAllUsersLists(): Observable<ServerResponse<UsersList[]>> {
        return this._httpClient.get<ServerResponse<UsersList[]>>('user-list?name=')
    }

    public getActionsScheduler(data: SchedulerList): Observable<ServerResponse<SchedulerListItem[]>> {
        const params = this._utilsService.createHttpParams(data);
        return this._httpClient.get<ServerResponse<SchedulerListItem[]>>('auto-posting/schedule', { params })
    }

    public getPostsAndStoriesByMonth(data: GetPostAndStoriesData): Observable<ServerResponse<PostOrStory[]>> {
        const params = this._utilsService.createHttpParams(data);
        return this._httpClient.get<ServerResponse<PostOrStory[]>>('auto-posting/by-month', { params })
    }

    public deleteActionScheduler(data: { accountId: number, date: number, type: string }): Observable<{}> {
        const params = this._utilsService.createHttpParams(data);
        return this._httpClient.delete<{}>('auto-posting/schedule', { params })
    }

    public deletePostStoryScheduler(data: { accountId: number, type: string, id: number }): Observable<{}> {
        const params = this._utilsService.createHttpParams(data);
        return this._httpClient.delete<{}>('auto-posting/schedule-id', { params })
    }

    // tslint:disable-next-line:max-line-length
    public getFollowingData(data: {userId: number, loginId: number}): Observable<ServerResponse<IFollowersWeb[]>> {  // instagramId == loginId
      const url = `statistics/massfollowing/${data.userId}/${data.loginId}`
      return this._httpClient.get<ServerResponse<any>>(url).pipe(
        tap((x: any) => {
          console.log(x);
        }),
        catchError(err => {
          console.log(err);
          throw err;
        }));
    }

    public getAllStatistics(allStatisticsData: StatisticsData): Observable<ServerResponse<AllStatisticsResponse>> {
      return this._httpClient.post<ServerResponse<AllStatisticsResponse>>('statistics/all', allStatisticsData)
        .pipe(
          tap(x => {
            console.log(x);
          }),
          catchError(err => {
            console.log(err);
            throw err;
          }));
    }

    public countTasks(data: {userId: number, loginId: number}): Observable<ServerResponse<number>> {
      const url = `statistics/counttasks/${data.userId}/${data.loginId}`;
      return this._httpClient.get<ServerResponse<number>>(url)
        .pipe(
          tap(x => {
            console.log(x);
          }),
          catchError(err => {
            console.log(err);
            const rzlt = {
              code: 500,
              data: 0,
              message: 'Network error'
            }
            return of(rzlt);
          }));
    }

    public closeTask(instagramId: number, serviceId: number, active: boolean) {
      const request = {
        id: instagramId
        // serviceId: 1,
        // active: false
      };
      return this._httpClient.put<ServerResponse<any>>('disableServices', request)
      .pipe(
        tap(x => {
          console.log(x);
        }),
        catchError(err => {
          console.log(err);
          const rzlt = {
            code: 204,
            data: null,
            message: 'Network error'
          }
          return of(rzlt);
        }));
  }

  public enableTestPeriod(usrId: number): Observable<ServerResponse<any>> {
    const request = {
      userId: usrId
    };
    return this._httpClient.post<ServerResponse<any>>('enableTestPeriod', request);
  }
}
