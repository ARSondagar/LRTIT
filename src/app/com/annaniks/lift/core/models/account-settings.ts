export interface AccountSettings {
    goalUsings: GoalUsing[];
    occupations: Occupation[];
    userTypes: UserType[];
    transactionStatuses: TransactionStatuse[];
    supportTicketCategores: SupportTicketCategory[];
    supportTicketStatus: SupportTicketStatus[];
    message: string;
}


export interface GoalUsing {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}
export interface Occupation {
    id: number;
    name: string;
}
export interface UserType {
    id: number;
    name: string;
    price: number;
    follow: number;
    like: number;
    comments: number;
    mention: number;
    accountCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface TransactionStatuse {
    id: number;
    name: string;
}

export interface SupportTicketCategory {
    value?: number
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export declare type SupportTicketStatus = SupportTicketCategory;
