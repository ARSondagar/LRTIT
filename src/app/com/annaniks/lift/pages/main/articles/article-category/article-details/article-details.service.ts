import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import { ArticleDetails } from '../../../../../core/models/article-details';
import { ServerResponse } from '../../../../../core/models/server-response';
import { ArticleFull, ArticleById } from '../../../../../core/models/article';


@Injectable()

export class ArticleDetailsService {

    constructor(private _httpClinet: HttpClient) { }

    public articleUsefull(body: ArticleDetails): Observable<ServerResponse<ArticleDetails>> {
        return this._httpClinet.post<ServerResponse<ArticleDetails>>('article/useful', body)
    }

    public getArticleById(articleId: string): Observable<ServerResponse<ArticleById>> {
        let params = new HttpParams();
        params = params.set('id', articleId);
        return this._httpClinet.get<ServerResponse<ArticleById>>('article/get', { params });
    }

}