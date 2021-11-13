export interface ChangePasswordData {
    password: string;
    newPassword: string;
}

export interface InformingService {
    instagramAccountId: number,
    duration: number,
    interval: number,
    deltaPosts: boolean,
    deltaFollowers: boolean,
    deltaLikes: boolean,
    deltaComments: boolean,
    topPosts: boolean,
    deltaStores: boolean,
    deltaUnfollowings: boolean,
    deltaSaves: boolean,
    totalActions: boolean,
    spendRatio: boolean,
    createdAt?: Date
    updatedAt?: Date
}
