import { Component, OnInit, Input, Inject } from '@angular/core';
import { ArticleFull } from 'src/app/com/annaniks/lift/core/models/article';

@Component({
  selector: 'app-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss']
})
export class ArticlePreviewComponent implements OnInit {

  @Input('data') public articleData: ArticleFull;
  @Input() mode: 'skeleton' | 'normal' = 'normal';

  constructor(
    @Inject('ARTICLE_FILE') public fileUrl: string,

  ) { }

  ngOnInit() {
    console.log();

  }

}
