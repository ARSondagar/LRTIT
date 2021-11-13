import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { ServerResponse } from '../../../../core/models/server-response';
import { CommentsList, UsersList } from '../../../../core/models/my-lists';

@Injectable()

export class ListService {

    constructor(private _httpClient: HttpClient) { }

    public addCommentsList(data: CommentsList): Observable<ServerResponse<{}>> {
        return this._httpClient.post<ServerResponse<{}>>('comment-list', data)
    }

    public addUsersList(data: UsersList): Observable<ServerResponse<{}>> {
        return this._httpClient.post<ServerResponse<{}>>('user-list', data)
    }

    public getAllCommentsLists(): Observable<ServerResponse<CommentsList[]>> {
        return this._httpClient.get<ServerResponse<CommentsList[]>>('comment-list?name=')
    }

    public getAllUsersLists(): Observable<ServerResponse<UsersList[]>> {
        return this._httpClient.get<ServerResponse<UsersList[]>>('user-list?name=')
    }

    public editCommentsList(data: CommentsList): Observable<ServerResponse<{}>> {
        const sendingData = { ...data, comment: JSON.stringify(data.comment) };
        return this._httpClient.put<ServerResponse<{}>>('comment-list/' + sendingData.id, sendingData)
    }

    public editUsersList(data: UsersList): Observable<ServerResponse<{}>> {
        const sendingData = { ...data, users: JSON.stringify(data.users) };
        return this._httpClient.put<ServerResponse<{}>>('user-list/' + sendingData.id, sendingData)
    }

    public deleteCommentsList(id: number): Observable<ServerResponse<{}>> {
        return this._httpClient.delete<ServerResponse<{}>>('comment-list/' + id)
    }

    public deleteUsersList(id: number): Observable<ServerResponse<{}>> {
        return this._httpClient.delete<ServerResponse<{}>>('user-list/' + id)
    }
    

}