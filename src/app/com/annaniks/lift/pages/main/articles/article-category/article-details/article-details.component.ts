import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { ArticleDetailsService } from './article-details.service';
import { ToastrService } from 'ngx-toastr';
import { ArticleFull, ArticleShort } from 'src/app/com/annaniks/lift/core/models/article';
import { MainService } from '../../../main.service';
import { NavbarService } from 'src/app/com/annaniks/lift/core/services';
import { ArticleService } from '../../article.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
    selector: 'app-article-details',
    templateUrl: 'article-details.component.html',
    styleUrls: ['article-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ArcticleDetailsComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public articleId: string;
    public article: ArticleFull = null;
    public articles: ArticleShort[] = [];
    public similiarArticles: ArticleFull[] = null;
    public sendLikeMessage: boolean = false;


    constructor(
        private _activatedRoute: ActivatedRoute,
        private _articleDetailsService: ArticleDetailsService,
        private _mainService: MainService,
        private _toastrService: ToastrService,
        private _navbarService: NavbarService,
        private _articleService: ArticleService,
        private _router: Router,
        private sanitizer: DomSanitizer,
        @Inject('ARTICLE_FILE') public fileUrl: string,

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
                switchMap((params: { id: string }) => {
                    console.log(params);

                    this.articleId = params.id;
                    console.log(this.articleId);

                    return this._getArticle(this.articleId);
                })
            ).subscribe();
    }

    private _getArticle(articleId: string): Observable<void> {
        this.sendLikeMessage = false;
        return this._articleDetailsService.getArticleById(articleId)
            .pipe(
                map((data) => {
                    this.similiarArticles = data.data.articleLike
                    this.article = data.data.article;
                    this.article.html = this._transformHtml(this.article.html);
                    console.log(data);
                })
            )
    }

    private _transformHtml(htmlTextWithStyle): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
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

    public goToSearch(query: string): void {
        this._router.navigate([`/articles/category/list`], { queryParamsHandling: "merge", queryParams: { query } });
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}