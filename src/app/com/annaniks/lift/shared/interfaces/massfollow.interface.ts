export interface MassfollowInterface {
  instagramAccountID: number;
  conditions: ConditionInterface[];
}

export interface ConditionInterface {
  type: ConditionType;
//  values: string[];
  values: any[];
}

export interface IFollowersBase {
  id: number;
  followedAccounts: string[];
  followersByAccounts: string[];
  loginId: number;
  stage: number;
  day: number;
  userId: number;
  status: string;
  tags?: IFollowerTags[];
  locations?: ILocation[];
}
export interface IFollowersWeb extends IFollowersBase {
  followDate: string; // UTC, format "2021-09-17T05:35:07.787Z"
}
export interface IFollowers extends IFollowersBase {
  followDate: string;   // UTC format: "2021-09-17"
  followDateObj: any;   // Moment object, UTC
  actions: number;
  followers: number | null;
  conversion?: number | null;
}

export interface IStatisticWeb {
  date: string;   // UTC date, format "2021-08-27T11:43:48.006Z"
  day: number;
  followers: number;
  followings: number;
  mouth: number;
  postsCount: number;
  year: number;
}

export interface ICalendarMetaData {
  currentDay: string;
  schedulerData: IFollowers;
  schedulerTotals: IFollowers;
}

export interface IFollowerTags {
  formatted_media_count: string;
  id: number;
  media_count: number;
  name: string;
  profile_pic_url: string;
  search_result_subtitle: string;
  use_default_avatar: true;
}

export interface ILocation {
  address: string,
  city: string,
  lat: number,
  lng: number,
  name: string,
  pk: number,
  short_name: string
}

export enum ConditionType {
  Tag = 'Tag',
  AccountFollowers = 'AccountFollowers',
  Location = 'Location',
  AccountCommentators = 'AccountCommentators',
  AccountLikers = 'AccountLikers',
}
