import { MassFollowingSettings } from './account';

export interface SchedulerList {
    accountId: number,
    start: number,
    end: number,
}

export interface SchedulerListItem {
    active: boolean,
    count: number,
    date: Date,
    done: true,
    type: string,
    massLookingSettings: MassFollowingSettings;
    massFollowingSettings: MassFollowingSettings;
}