import { Hashtag } from './account';
import { Account } from './user';

export declare type Search = Hashtag[] | Account[];

export interface SearchTerm {
    query: string;
    type: string
}
