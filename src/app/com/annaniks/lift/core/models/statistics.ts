/* export class StatisticsData {
    accountId: number;
    startDate: string | Date;
    endDate: string | Date;
}*/
export class StatisticsData {
  accountId: number;
  startDate: string;
  endDate: string;
}

export class Statistic {
    followers: number;
    followings: number;
    postsCount: number;
    date: string;
    month: number;
}

export interface LikesCommentsStatistic {
    comment: number;
    like: number;
    month: number;
    date: string;
    topComment: PostStatistic[];
    topLike: PostStatistic[];
}

export interface PostStatistic {
    caption: string;
    comment: number;
    deltaComment: number;
    deltaLike: number;
    createdAt?: string;
    like: number;
    owner: string;
    shortcode: string;
    thumbnail: string;
    taken_at_timestamp: string;
}

export interface StatisticValue {
    value: number;
    todayCount: number;
    icon: string;
}

export interface LineChartData {
    data: number[];
    label: string;
    borderColor?: string;
    pointRadius?: number;
    fill?: boolean;
    backgroundColor?: string;
}

export interface AllStatisticsResponse {
    statistics: Statistic[];
    segment: any;
}
