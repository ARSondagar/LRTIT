import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MainService } from '../main.service';
import { ArticleShort } from '../../../core/models/article';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject();
  public articles: ArticleShort[] = [];

  constructor(
    private _mainService: MainService
  ) { }

  ngOnInit() {
    this._getArticles();
  }

  private _getArticles(): void {
    this._mainService.getArticles()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        this.articles = data.data;
      })
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
