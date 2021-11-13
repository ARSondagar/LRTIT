import { TariffData } from './tariff';
import { PostStatistic } from './statistics';

export interface User {
    id: number;
    name: string;
    email: string;
    roleId: Role;
    avatar: string;
    instagramAccounts: InstagramAccount[]
    updatedAt: string;
    createdAt: string;
    refferalCode: string;
    tariffs: TariffData[]
}
export interface UserExt extends User { // data from route /me
  aboutYourself?: string;
  accountsAmount?: number;
  city?: number;
  dbDay?: any;
  dbMount?: any;
  dbYear?: any;
  facebookLink?: string;
  goalUsing?: number,
  testFollowing?: boolean,
  wasTestFollowing?: boolean
}

interface Role {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface InstagramAccount {
    id: number;       // 2
    login: string;    // 5
    password?: string;
    apiKey?: string;
    loginRequired: boolean; // 6
    active: boolean;        // 0
    userId?: number;
    avatar: string;         // 1
    verification: boolean;  // 7
    createdAt?: string;
    updatedAt?: string;
    instagramId: string;    // 4
    selected?: boolean;
    needPassword?: boolean;
    statistica: InstagramAccountStatistics;
    subscription: InstagramAccountSubscription;

    identifier?: string;        // 3
    verificationType?: string;  // 8
}

export interface Account {
    email: string;
    password: string;
}

export interface InstagramAccountStatistics {

    createdAt: string;
    date: string;
    day: number;
    followers: number;
    followings: number;
    id: number;
    instagramAccountId: number;
    month: number;
    posts: {
        posts: PostStatistic[];
    }
    postsCount: number;
    updatedAt: string;
    year: number;

}

export interface InstagramAccountSubscription {
    autoFollowing: boolean;
    autoView: boolean;
    createdAt: string;
    id: number;
    liftBonus: boolean;
    loginId: number;
    updatedAt: string;
}
