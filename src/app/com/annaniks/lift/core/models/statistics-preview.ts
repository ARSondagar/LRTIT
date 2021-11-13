import { StatisticPost } from './statistic-post';
import { StatisticMailing } from './statistic-mailing';

export interface Preview {
    subscribersCount: number,
    subscribersCountForToday: number,
    subscribesCount: number,
    subscribesCountForToday: number,
    postsCount: number,
    postsCountForToday: number
    likesCount: number,
    likesCountForToday: number,
    commentsCount: number,
    commentsCountForToday: number,
    bookmarksCount: number,
    bookmarksCountForToday: number
    bestPostsForLastMonth: StatisticPost[],
    mailingsForLastMonth: StatisticMailing[]
}