import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';

import { Bookmark } from '../../../../core/models/bookmark';
import { Comment } from '../../../../core/models/comment';
import { Like } from '../../../../core/models/like';
import { ServerResponse } from '../../../../core/models/server-response';

@Injectable()
export class LikesCommentsBookmarksService {

    public likes$ = this.httpClient.get<ServerResponse<Like[]>>('http://dummy.restapiexample.com/api/v1/employees')
        .pipe(
            tap(console.log),
            shareReplay(),
            catchError(of)
        )
    public comments$ = this.httpClient.get<ServerResponse<Comment[]>>('my-subscribes')
        .pipe(
            tap(console.log),
            shareReplay(),
            catchError(of)
        )
    public bookmarks$ = this.httpClient.get<ServerResponse<Bookmark[]>>('posts')
        .pipe(
            tap(console.log),
            shareReplay(),
            catchError(of)
        )

    constructor(private httpClient: HttpClient) { }

}