export interface Mailing {
    id: number;
    instagramAccountId: number;
    delay: number;
    filter: {}
    sendAfterFollow: boolean
    messages: {
        list: string[];
    }
    createdAt: string;
    updatedAt: string;
}

export interface MailingResponse {
    newMailing: Mailing[];
    oldMailing: Mailing[]
}

export enum SendMessageTypes {
    Direct = "direct",
    Schedule = "schedule"
}


export interface NewMailing {
    accountId: number,
    delay: number,
    sendAfterFollow: boolean,
    filter: {},
    messages: string[]
}

export interface OldMailing {
    accountId: number,
    start: Date,
    duration: number,
    lastDays: number,
    filter: {},
    messages: string[]
}