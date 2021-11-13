export interface TariffTransaction {
    id: number;
    userId: number;
    operationName: string;
    value: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    _pivot_tariff: number;
    _pivot_transaction: number;
    message: string;
    statusStr: string;
}


export interface TariffData {
    createdAt: string;
    expired: string;
    id: number;
    type: {
        accountCount: number;
        comments: number;
        createdAt: string;
        follow: number;
        id: number;
        like: number;
        mention: number;
        name: string;
        price: number;
        updatedAt: string;
    }
    typeId: number;
    updatedAt: string;
}



export interface TariffBasePrices {
    autosubscribe: number;
    watchStories: number;
    activity: number;
    autoposting: number;
    direct: number;
    fortuna: number;
    likes: number;
    unsubscribe: number;
    manageComments: number

}


export interface Tariff {
    image: string;
    current: string;
    type: string;
    paid: string;
}

export interface JoinTariff {
    tariffId: number;
}

export interface TariffPayload {
    isStatistic: boolean;
    isLike: boolean;
    isWatchStories: boolean;
    managesComments: boolean;
    isDirect: boolean;
    isFortuna: boolean;
    isUnsubscribe: boolean;
    isAutoPosting: boolean;
    expiredDay: number;
    expired: Date;
    totalAmount: number;
    accountCount: number;
    promocodeId: number
}

export interface Promocode {
    id?: number,
    name: string;
    code: string;
    type: string;
    discount: number;
    isLike: boolean;
    isAutoSubscribe: boolean;
    isAutoPosting: boolean;
    expired: number;
}