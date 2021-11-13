import { InstagramAccount } from './user';

export interface CommentsList {
    name: string;
    comment: string;
    id?: number
}

export interface UsersList {
    users: string;
    name: string;
    id?: number;
    value?: number;
}
