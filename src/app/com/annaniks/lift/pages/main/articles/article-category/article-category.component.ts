import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { ArticleCategory, ArticleFull } from '../../../../core/models/article';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { Subject } from 'rxjs';
import { ArticleService } from '../article.service';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-article-category',
  templateUrl: './article-category.component.html',
  styleUrls: ['./article-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0, maxHeight: 0 }),
        animate('200ms ease-in', style({ opacity: 1, maxHeight: 200 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        style({ opacity: 1, maxHeight: 200 }),
        animate('200ms  ease-out', style({ opacity: 0, maxHeight: 0 }))
      ])
    ])
  ]
})
export class ArticleCategoryComponent implements OnInit, OnDestroy {

  private _unsubscribe$ = new Subject();
  private _lastQuery = '';
  public categories: ArticleCategory[];
  public activeCategory: string;
  public topArticles: ArticleFull[] = [];
  public searchResult: ArticleFull[] = [];

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    @Inject('ARTICLE_FILE') public fileUrl: string,
  ) { }

  ngOnInit() {
    this.activeCategory = this._getActiveCategory();
    this._getCategoriesList();
    this._getMonthTop();
    this._changeActiveCategoryWhenQueryParamsChanged();
  }

  private _getCategoriesList(): void {
    this._articleService.getCategoryList()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        this.categories = data.data;
      })
  }

  private _getMonthTop(): void {
    this._articleService.getMonthsTopArticles()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        this.topArticles = data.data
      })
  }

  public changeCategory(categoryId: string): void {
    this.activeCategory = categoryId;
    this._router.navigate(['/articles/category/list'], { queryParams: { categoryId, pageIndex: 1 } });
  }

  private _getActiveCategory(): string {
    const snapshot: RouterStateSnapshot = this._router.routerState.snapshot;
    return snapshot.root.queryParams.categoryId
  }

  public setArticleMissingImage(event) {
    event.srcElement.src = '/assets/images/not-found.png'
  }

  private _changeActiveCategoryWhenQueryParamsChanged(): void {
    this._activatedRoute.queryParams
      .pipe(filter(params => params.categoryId && params.categoryId != this.activeCategory))
      .subscribe(queryParams => {
        this.activeCategory = queryParams.categoryId
      });
  }

  public onSearchArticles(query: string) {
    this._lastQuery = query;
    this.searchArticles(query);
  }

  public searchArticles(query: string): void {
    this._articleService.searchArticles(query, 1)
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
      )
      .subscribe(response => {
        console.log(response);
        this.searchResult = response.data.article
      })
  }

  public onSearchSelect(article: ArticleFull): void {
    this._router.navigate([`/articles/category/post/${article.id}`]);
  }

  public searchAll() {
    this._router.navigate([`/articles/category/list`], { queryParams: { query: this._lastQuery } });
  }
  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
