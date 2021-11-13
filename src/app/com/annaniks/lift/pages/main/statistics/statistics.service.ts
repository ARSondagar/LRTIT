import { InstagramStatisticsInterface, InstagramStatsResponseInterface } from './../types/instagram-statistics.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    StatisticsData,
    LikesCommentsStatistic,
    PostStatistic,
    AllStatisticsResponse
} from '../../../core/models/statistics';
import { ServerResponse } from '../../../core/models/server-response';
import { GetStatisticsInterface } from '../types/get-statistics.interface';

@Injectable()
export class StatisticsService {

    constructor(private _httpClient: HttpClient) { }

    public getAllStatistics(allStatisticsData: StatisticsData): Observable<ServerResponse<AllStatisticsResponse>> {
        return this._httpClient.post<ServerResponse<AllStatisticsResponse>>('statistics/all', allStatisticsData);
    }

    public getStatisticsLikesComments(statisticsData: StatisticsData): Observable<ServerResponse<LikesCommentsStatistic[]>> {
        return this._httpClient.post<ServerResponse<LikesCommentsStatistic[]>>('statistics/likes-and-comments', statisticsData)
    }

    // public getStatisticsPosts(statisticsData: StatisticsData): Observable<ServerResponse<PostStatistic[]>> {
    //     return this._httpClient.post<ServerResponse<PostStatistic[]>>('statistics/posts', statisticsData)
    // }

    public getStatisticsByPeriod(data: GetStatisticsInterface): Observable<ServerResponse<InstagramStatsResponseInterface>> {
      return this._httpClient.post<ServerResponse<InstagramStatsResponseInterface>>('statistics/forPeriod', data)
    }
}
