import { Component, OnInit, OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { ArticleFull } from '../../../../core/models/article';
import { ArticleService } from '../article.service';
import { finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-most-popular',
  templateUrl: './most-popular.component.html',
  styleUrls: ['./most-popular.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MostPopularComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private _pageIndex = 0;
  private _lastQuery = '';
  private _count: number;
  public showArticleData: ArticleFull[] = [];
  public throttle = 300;
  public scrollDistance = 1;
  public scrollUpDistance = 2;
  public showItems = true;
  public searchResult: ArticleFull[] = [];
  public isRestricted: boolean;

  constructor(
    private _articleService: ArticleService,
    @Inject('ARTICLE_FILE') public fileUrl: string,
    private _router: Router
  ) {
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this._getArticles();
  }

  private _getArticles(): void {
    this.showItems = false
    this._articleService.getMostPopularArticles(this._pageIndex * 10)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.showItems = true)
      )
      .subscribe((response) => {
        this._count = response.data.count;
        this.showArticleData.push(...response.data.article);
        this._pageIndex += 1;
        console.log(response);
      })
  }

  public onScrollDown(): void {
    // this.count <
    if (this.showArticleData.length >= this._count) {
      return
    }
    this._getArticles();
  }

  public onSearchArticles(query) {
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
    this._router.navigate([`/articles/category/list`], { queryParamsHandling: "merge", queryParams: { query: this._lastQuery } });

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
