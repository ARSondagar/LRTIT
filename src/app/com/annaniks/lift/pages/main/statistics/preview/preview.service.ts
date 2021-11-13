import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';

import { Preview } from '../../../../core/models/statistics-preview';
import { ServerResponse } from '../../../../core/models/server-response';

@Injectable()
export class PreviewService {


    preview$ = this.httpClient.get<ServerResponse<Preview>>('preview')
        .pipe(
            tap(console.log),
            shareReplay(),
            catchError(of)
        )
    constructor(private httpClient: HttpClient) { }

}