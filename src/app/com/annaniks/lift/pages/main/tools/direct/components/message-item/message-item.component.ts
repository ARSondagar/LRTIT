import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { DirectMessage } from 'src/app/com/annaniks/lift/core/models/direct.message';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MessageItemComponent implements OnInit {

  @Input('message') public directMessage: DirectMessage = {} as DirectMessage;

  @Input('previousMessage') public previousMessage: DirectMessage = {} as DirectMessage

  @Input('senderPhoto') public userPhoto: string = ''

  @Input('isIncoming') public isIncoming = false;

  @Input('mode') public mode: 'skeletion' | 'normal' = 'normal';

  public iframe: SafeResourceUrl = '';

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getImageSource()
    if (this.directMessage.item_type == 'media_share') {
      this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(`http://instagram.com/p/${this.directMessage.media_share.code}/embed`)
    }
  }

  public getImageSource(): { imageSource: string, isImage: boolean } {
    let response: { imageSource: string, isImage: boolean } = { imageSource: '', isImage: true }
    switch (this.directMessage.item_type) {
      case 'media':
        if (!this.directMessage.media.video_versions) {
          response.imageSource = this.getCompressedImage[this.getCompressedImage.length - 1].url
        } else {
          response.isImage = false;
        }
        break;
      case 'animated_media':
        response.imageSource = this.directMessage.animated_media.images.fixed_height.url
        break;
      default:
        response.isImage = false
    }
    return response
  }

  private get getCompressedImage() {
    return this.directMessage.media.image_versions2.candidates
  }
}
