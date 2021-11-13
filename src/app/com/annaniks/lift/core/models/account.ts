import { SubscriptionParam } from './subscription-parameter';

export interface AccountConnectData {
    username: string;
    password: string;
}

export interface TwoFactorLoginData {
    username: string;
    password: string;
    code: string;
    two_factor_identifier: string;
}

export interface VerifyLoginInterface {
  accountId: number;
  code: string;
}
export interface ChallengeLoginData {
    username: string;
    code: string;
}

export class MassFollowingSettings {
    loginId: number | string;
    id?: number;
    userId?: number;
    status?: string;
    location: Location[];
    followersByAccounts: FollowersByAccount[];
    commentersByAccounts: CommentersByAccounts[];
    likers: LikersByAccounts[];
    tags: Hashtag[];
    comments: any;
    likeCountForFollower: number;
    unfollowDays: number;
    seeStories: boolean;
    dontFollowHiddenAccounts: boolean;
    hidePostsAndStories: boolean;
    hidePosts: boolean;
    hideStories: boolean;
    followTime: FollowTime;
    filter: Filter;
    createdAt?: string;
    updatedAt?: string;
    subscribesPerDay: number;
    subscribesPerHour: number;
    constructor() {
        this.loginId = null;
        this.id = null;
        this.userId = null;
        this.status = null;
        this.location = [];
        this.followersByAccounts = [];
        this.commentersByAccounts = [];
        this.likers = [];
        this.tags = [];
        this.comments = [];
        this.likeCountForFollower = null;
        this.unfollowDays = null;
        this.seeStories = null;
        this.dontFollowHiddenAccounts = null;
        this.hidePostsAndStories = null;
        this.hidePosts = null;
        this.hideStories = null;
        this.followTime = {} as FollowTime;
        this.filter = {} as Filter;
        this.createdAt = null;
        this.updatedAt = null;
    }
}

interface FollowTime {
    start: string;
    end: string;
}

export interface Filter {
    followers: FilterRange;
    folowings: FilterRange;
    likeInPhoto: FilterRange;
    postCount: FilterRange;
    haveAvatar: boolean;
    lastPostAge: number;
    lasStoryAge: number;
    profileDescription: boolean;
    description: FilterDescription;
    haveSite: boolean;
}

interface FilterRange {
    min: string;
    max: string;
}

interface FilterDescription {
    include: string[];
    exclude: string[]
}


export interface Hashtag {
    name: string;
    id: number;
    media_count: number;
    use_default_avatar: boolean;
    profile_pic_url: string;
    search_result_subtitle: string;
}

export interface FollowersByAccount {
    pk: string;
    username: string;
    full_name: string;
    is_private: boolean
    profile_pic_url: string;
    profile_pic_id: string;
    is_verified: boolean;
    has_anonymous_profile_picture: boolean;
    mutual_followers_count: number;
    latest_reel_media: number;
}

export declare type CommentersByAccounts = FollowersByAccount;
export declare type LikersByAccounts = FollowersByAccount;

export interface Location {
  address: string;
  city: string;
  name: string;
  lat: number;
  lng: number;
  pk: number;
  short_name: string;
  title?: string;
    // location: {
    //     pk: string;
    //     name: string;
    //     address: string;
    //     city: string;
    //     short_name: string;
    //     lng: number;
    //     lat: number;
    //     external_source: string;
    //     facebook_places_id: number;
    // }
    // title: string;
    // subtitle: string;
    // media_bundles: []
    // slug: string;
}


export interface Condition {
    type: SubscriptionParam;
}

export interface SubscriptionData {
    loginId: number,
    autoFollowing: boolean,
    autoView: boolean,
    liftBonus: boolean
}
