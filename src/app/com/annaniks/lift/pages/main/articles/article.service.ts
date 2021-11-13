import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ArticleFull, ArticleCategory } from '../../../core/models/article';
import { ServerResponse } from '../../../core/models/server-response';

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    constructor(private _httpClinet: HttpClient) { }

    public getMostPopularArticles(pageIndex: number): Observable<ServerResponse<{ article: ArticleFull[], count: number }>> {
        let params = new HttpParams();
        params = params.set('offset', String(pageIndex));
        params = params.set('limit', "10");
        params = params.set('name', "");

        return this._httpClinet.get<ServerResponse<{ article: ArticleFull[], count: number }>>('article/get-all', { params });
    }

    public getArticlesByCategory(pageIndex: number, categoryId: number): Observable<ServerResponse<ArticleFull[]>> {
        let params = new HttpParams();
        params = params.set('offset', String(pageIndex - 1));
        params = params.set('limit', "10");
        params = params.set('categoryId', String(categoryId));
        return this._httpClinet.get<ServerResponse<ArticleFull[]>>('article/category', { params });
    }

    public getCategoryList(): Observable<ServerResponse<ArticleCategory[]>> {
        return this._httpClinet.get<ServerResponse<ArticleCategory[]>>('article/all-category')
    }

    public getMonthsTopArticles(): Observable<ServerResponse<ArticleFull[]>> {
        return this._httpClinet.get<ServerResponse<ArticleFull[]>>('article/get-tops')
    }

    public searchArticles(query: string, pageIndex: number): Observable<ServerResponse<{ article: ArticleFull[], count: number }>> {
        return this._httpClinet.get<ServerResponse<{ article: ArticleFull[], count: number }>>(`article/get-all?&limit=10&offset=${pageIndex - 1}&name=${encodeURIComponent(query)}`)
    }


}