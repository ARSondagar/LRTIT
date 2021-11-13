import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { ArticleDetailsService } from './article-details.service';
import { ArticleFull, ArticleShort } from '../../../core/models/article';
import { MainService } from '../main.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarService } from '../../../core/services/navbar.service';

@Component({
    selector: 'app-article-details',
    templateUrl: 'article-details.component.html',
    styleUrls: ['article-details.component.scss']
})
export class ArcticleDetailsComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public articleId: string;
    public article: ArticleFull = {} as ArticleFull;
    public articles: ArticleShort[] = [];
    public sendLikeMessage: boolean = false;


    constructor(
        private _activatedRoute: ActivatedRoute,
        private _articleDetailsService: ArticleDetailsService,
        private _mainService: MainService,
        private _toastrService: ToastrService,
        private _navbarService: NavbarService
    ) {
        this._navbarService.setNavbarItems([]);
    }

    ngOnInit() {
        this._checkRouteParams();
        this._getArticles();
    }

    private _checkRouteParams(): void {
        this._activatedRoute.params
            .pipe(
                takeUntil(this._unsubscribe$),
                switchMap((params: { arcticleId: string }) => {
                    this.articleId = params.arcticleId;
                    return this._getArticle(this.articleId);
                })
            ).subscribe();
    }

    private _getArticle(articleId: string): Observable<void> {
        this.sendLikeMessage = false;
        return this._articleDetailsService.getArticleById(articleId)
            .pipe(
                map((data) => {
                    this.article = data.data;
                })
            )
    }

    private _getArticles(): void {
        this._mainService.getArticles()
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                this.articles = data.data;
            })
    }

    private _sendLike(isLiked: boolean): void {
        const isLikedData = {
            articleId: this.articleId,
            like: isLiked,
        }

        this._articleDetailsService.articleUsefull(isLikedData)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                this._toastrService.success('Спасибо за ваш ответ. Ваш ответ успешно принят');
                this.sendLikeMessage = true;
            },
                (err) => {
                    const error = err.error;
                    const errorMessage: string = error.message || 'Ошибка';
                    this._toastrService.error(errorMessage);

                })

    }

    public onClickLike(isLike: 'yes' | 'no'): void {
        const isLiked: boolean = (isLike == 'yes') ? true : false;
        this._sendLike(isLiked);
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}