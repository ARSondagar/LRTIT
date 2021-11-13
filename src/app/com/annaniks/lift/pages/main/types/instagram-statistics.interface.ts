export interface InstagramStatsResponseInterface {
  segment: any;
  statistics: InstagramStatisticsInterface[]
}

export interface InstagramStatisticsInterface {
  commentCount: number;
  createdAt: string;
  takenAt: string;
  instagramId: number;
  likeCount: number;
  mediaType: number;
  pk: string;
  date: Date;
  viewCount: number;
  text: string;
  imgUrl: string;
}

export const emptyInstagramStatistics = {
  commentCount: 0,
  createdAt: '',
  takenAt: '',
  instagramId: 0,
  likeCount: 0,
  mediaType: 0,
  pk: '',
  date: new Date(-8640000000000000),  // min Date: https://stackoverflow.com/questions/11526504/minimum-and-maximum-date
  viewCount: 0,
  text: '',
  imgUrl: ''
}
