import { Component, OnInit, Input, Inject } from '@angular/core';
import { ArticleFull } from 'src/app/com/annaniks/lift/core/models/article';

@Component({
  selector: 'app-most-popular-item',
  templateUrl: './most-popular-item.component.html',
  styleUrls: ['./most-popular-item.component.scss']
})
export class MostPopularItemComponent implements OnInit {

  @Input('data') public articleData: ArticleFull;
  @Input() mode: 'skeleton' | 'normal' = 'normal';
  @Input() inDetailView: boolean = false
  constructor(
    @Inject('ARTICLE_FILE') public fileUrl: string,
  ) { }

  ngOnInit() {
    console.log(this.inDetailView);

  }

}
