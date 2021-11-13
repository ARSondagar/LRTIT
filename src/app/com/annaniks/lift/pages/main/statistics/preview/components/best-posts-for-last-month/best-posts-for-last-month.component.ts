import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/com/annaniks/lift/core/services';
import { emptyInstagramStatistics, InstagramStatisticsInterface } from '../../../../types/instagram-statistics.interface';
import { BEST_POSTS_SLIDER_CONFIG } from './best-posts-slider.config';

@Component({
  selector: 'app-best-posts-for-last-month',
  templateUrl: './best-posts-for-last-month.component.html',
  styleUrls: ['./best-posts-for-last-month.component.scss'],
})
export class BestPostsForLastMonthComponent {

  public hasImage: boolean[] = [];
  public imageToShow: (string | ArrayBuffer)[] = [];

  public _posts: InstagramStatisticsInterface[] = [];
  public get posts(): InstagramStatisticsInterface[] { return this._posts; }
  @Input() public set posts(value: InstagramStatisticsInterface[]) {
    let imageCount: number;
    if (Array.isArray(value)) {
      this._posts = value;
      imageCount =  this._posts.length;
    } else {
      imageCount = 1;
      this._posts = new Array<InstagramStatisticsInterface>(1);
      this._posts.push(value);
    }
    this.hasImage = new Array<boolean>(imageCount);
    this.imageToShow = new Array<string | ArrayBuffer>(imageCount);
    for (let i = 0; i < imageCount; i++) {
      this._authService.readImageStream(this._posts[i].imgUrl, i, this.stdCallback);
    }
  }

  sliderConfig = BEST_POSTS_SLIDER_CONFIG;

  constructor(private _authService: AuthService) {}

  private stdCallback = (hasImage: boolean, imageToShow: string | ArrayBuffer, i: number = -1) => {
    if (i < 0) {
      this.hasImage[0] = hasImage;
      this.imageToShow[0] = imageToShow;
    } else {
      this.hasImage[i] = hasImage;
      this.imageToShow[i] = imageToShow;
    }
  }

}
