import { Filter } from './account';

export interface UnsubscribePayload {
    loginId: string,
    date: Date,
    countUnsubscribe: number,
    startFromEnd: boolean,
    unsubscribeFromLift: boolean,
    unsubscribeFrom: string,
    whiteList: string,
    filter: Filter,
    userId?: any;
}