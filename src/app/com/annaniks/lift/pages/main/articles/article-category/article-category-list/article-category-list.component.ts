import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { ArticleService } from '../../article.service';
import { ArticleFull } from 'src/app/com/annaniks/lift/core/models/article';
import { Subject } from 'rxjs';
import { takeUntil, filter, finalize } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services';

@Component({
  selector: 'app-article-category-list',
  templateUrl: './article-category-list.component.html',
  styleUrls: ['./article-category-list.component.scss'],
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
export class ArticleCategoryListComponent implements OnInit, OnDestroy {

  private _unsubscribe$ = new Subject();
  private _categoryId: number = null;
  private _pageIndex: number = null;
  public searchQuery: string;
  public config: any;
  public articles: ArticleFull[];
  public articlesCount: number;
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _articleService: ArticleService,
    private _loadingService: LoadingService
  ) { }

  ngOnInit() {
    this._getPageIndexFromQuery();
    if (!this.searchQuery) {
      this._getArticlesByCategoryId(this._categoryId, true);
    } else {
      this._getSearchResult(true)
    }
    this.subscribeToCategoryChange();
    this.subscribeToSearchChange()
  }

  private _getPageIndexFromQuery(): void {
    const snapshot: RouterStateSnapshot = this._router.routerState.snapshot;
    const params = snapshot.root.queryParams
    this.searchQuery = params.query;
    this._categoryId = params.categoryId || 4
    this._pageIndex = +params.pageIndex || 1
  }

  private subscribeToCategoryChange(): void {
    this._activatedRoute.queryParams
      .pipe(
        filter(params => params.categoryId && params.categoryId != this._categoryId)
      )
      .subscribe(params => {
        console.log(params);

        this.articles = [];
        this._categoryId = +params.categoryId;
        this._pageIndex = 1;
        this._getArticlesByCategoryId(this._categoryId, true);
      }
      );
  }

  private subscribeToSearchChange(): void {
    this._activatedRoute.queryParams
      .pipe(
        filter(params => params.query && params.query != this.searchQuery)
      )
      .subscribe((params) => {
        this._categoryId = null;
        this.searchQuery = params.query
        this._pageIndex = 1;
        this._getSearchResult(true)
      }
      );
  }


  private _getArticlesByCategoryId(categoryId: number, updateCounter: boolean = false): void {
    this._loadingService.showLoading();
    this._articleService.getArticlesByCategory(this._pageIndex, categoryId)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$))
      .subscribe((response: any) => {
        if (updateCounter) {
          this.config = {
            itemsPerPage: 10,
            currentPage: this._pageIndex,
            totalItems: +response.data.count
          };
          this.articlesCount = +response.data.count
        }
        console.log(updateCounter, +response.data.count);
        this.searchQuery = null;
        this.articles = response.data.data;

        this.changeQuery();
        this._pageIndex++;
      })
  }

  private _getSearchResult(updateCounter: boolean = false): void {
    this._articleService.searchArticles(this.searchQuery, this._pageIndex)
      .pipe(
        takeUntil(this._unsubscribe$)
      )
      .subscribe((response) => {
        console.log(response);
        if (updateCounter) {
          this.config = {
            itemsPerPage: 10,
            currentPage: this._pageIndex,
            totalItems: +response.data.count
          };
          this.articlesCount = +response.data.count
        }
        this.articles = response.data.article;
        // this.changeQuery();
        this._pageIndex++;
      })
  }

  public getCategoryName(): string {
    if (!this.articles || this.articles.length == 0) return
    for (let index = 0; index < this.articles[0].category.length; index++) {
      const element = this.articles[0].category[index];
      if (element.categoryId.toString() == this._categoryId.toString()) {
        return element.parent.name
      }
    }
  }

  public pageChanged(event): void {
    this.config.currentPage = event;
    this._pageIndex = event;
    if (this.searchQuery) {
      this._getSearchResult()
    } else {
      this._getArticlesByCategoryId(this._categoryId);
    }
  }

  public changeQuery(): void {
    this._router.navigate(['.'], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
      queryParams: {
        categoryId: this._categoryId,
        pageIndex: this._pageIndex
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

}
