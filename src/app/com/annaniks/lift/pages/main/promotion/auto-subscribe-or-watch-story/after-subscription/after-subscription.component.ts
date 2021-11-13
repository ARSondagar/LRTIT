import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { FormGroup, FormBuilder } from '@angular/forms';

import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { ActionAfterSubscription } from '../../../../../core/models/action-after-subscription';

import { SubSink } from 'subsink';

@Component({
  selector: 'app-after-subscription',
  templateUrl: './after-subscription.component.html',
  styleUrls: ['./after-subscription.component.scss']
})
export class AfterSubscriptionComponent implements OnInit, OnDestroy {
  private countFilter: number;
  @Input('massData')
  set _massData(event) {
    this._initForm();

    if (event) {
      this._bindMassfollowing(event)
    }
  }


  private _subs = new SubSink();
  public afterSubscriptionForm: FormGroup;
  private _actions: ActionAfterSubscription[];


  constructor(
    private _formBuilder: FormBuilder,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService
  ) {
    this._actions = [];
  }

  ngOnInit() {
  }
  getCountFilter() {
    const count = this.countFilter;
    let result: string;
    if (count === 1) {
      result = 'действие';
    } else if (count > 1 && count < 5) {
      result = 'действия';
    } else {
      result = 'действий';
    }
    return `${count} ${result}`;
  }
  private _initForm(): void {
    this.afterSubscriptionForm = this._formBuilder.group({
      lastPostLikes: this._formBuilder.group({ status: false, count: 0 }),
      unfollowDays: this._formBuilder.group({ status: false, count: 0 }),
      hidePostsAndStories: false,
      dontFollowHiddenAccounts: false,
      seeStories: false,
      comments: false
    })
    this.afterSubscriptionForm.valueChanges.subscribe((data) => {
      const formValue = this.afterSubscriptionForm.value;
      if (formValue.lastPostLikes.status) {
        this._autoSubscribeOrWatchStoryService.settings.likeCountForFollower = formValue.lastPostLikes.count;
      } else {
        this._autoSubscribeOrWatchStoryService.settings.likeCountForFollower = null;

      }
      if (formValue.unfollowDays.status) {
        this._autoSubscribeOrWatchStoryService.settings.unfollowDays = formValue.unfollowDays.count;
      } else {
        this._autoSubscribeOrWatchStoryService.settings.unfollowDays = null;
      }
      this._autoSubscribeOrWatchStoryService.settings.seeStories = formValue.seeStories;
      this._autoSubscribeOrWatchStoryService.settings.hidePostsAndStories = formValue.hidePostsAndStories;
      this._autoSubscribeOrWatchStoryService.settings.dontFollowHiddenAccounts = formValue.dontFollowHiddenAccounts;
      this._autoSubscribeOrWatchStoryService.settings.comments = formValue.comments;
      const countFilter = {
        lastPostLikes: formValue.lastPostLikes.status,
        unfollowDays: formValue.unfollowDays.status,
        hidePostsAndStories: formValue.hidePostsAndStories,
        dontFollowHiddenAccounts: formValue.dontFollowHiddenAccounts,
        seeStories: formValue.seeStories,
        comments: formValue.comments,
      }
      this.countFilter = Object.values(countFilter).filter(x => x).length;
    });
  }

  private _bindMassfollowing(event): void {
    this.afterSubscriptionForm.patchValue({
      lastPostLikes: { status: event.likeCountForFollower ? true : false, count: event.likeCountForFollower || null },
      unfollowDays: { status: event.unfollowDays ? true : false, count: event.unfollowDays || null },
      hidePostsAndStories: event.hidePostsAndStories ? true : false,
      dontFollowHiddenAccounts: event.dontFollowHiddenAccounts ? true : false,
      seeStories: event.seeStories ? true : false
    });
  }

  ngOnDestroy() {
    this._subs.unsubscribe()
  }
}
