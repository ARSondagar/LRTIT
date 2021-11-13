import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { MassFollowingSettings } from 'src/app/com/annaniks/lift/core/models/account';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConditionType, MassfollowInterface } from 'src/app/com/annaniks/lift/shared/interfaces/massfollow.interface';

import * as _ from 'lodash';

@Component({
  selector: 'app-subscribe-parametres',
  templateUrl: './subscribe-parametres.component.html',
  styleUrls: ['./subscribe-parametres.component.scss']
})
export class SubscribeParametresComponent implements OnInit, OnDestroy {
  public settings: MassFollowingSettings = new MassFollowingSettings()
  private _subs = new SubSink();
  public isAutosubscribe = false;
  public isRestricted: boolean;

  private _noModifications$ = new BehaviorSubject<boolean>(true);
  public noModifications$: Observable<boolean> = this._noModifications$.asObservable();

  show = false
  constructor(
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    private _router: Router,
  ) {
    this.isAutosubscribe = this._router.url !== '/promotion/auto-watch-story';
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this._fetchSettings();
    this._noModifications$.next(true);
  }

  private _fetchSettings(): void {

    this.settings = this._autoSubscribeOrWatchStoryService.settings
    this._subs.add(
      this._autoSubscribeOrWatchStoryService.settingsState.subscribe((data: MassFollowingSettings) => {
        this.settings = data;
      })
    )
  }

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  public collectData(massfolowData: MassfollowInterface): void {
    massfolowData.conditions = [];
    if ((this.settings.tags instanceof Array) && this.settings.tags.length > 0) {
      const filteredTags = _.filter(this.settings.tags, x => x.name && x.name.length > 0);
      if (filteredTags && filteredTags.length > 0) {
        massfolowData.conditions.push({
          type: ConditionType.Tag,
          values: [...filteredTags]                  // this.settings.tags.map(x => x.name)
        });
      }
    }
    if ((this.settings.followersByAccounts instanceof Array) && this.settings.followersByAccounts.length > 0) {
      const filteredUsers = _.filter(this.settings.followersByAccounts, x => x.username && x.username.length > 0);
      if (filteredUsers && filteredUsers.length > 0) {
        massfolowData.conditions.push({
          type: ConditionType.AccountFollowers,
          values: [...filteredUsers]   // this.settings.followersByAccounts.map(x => x.username)
        });
      }
    }
    if ((this.settings.location instanceof Array) && this.settings.location.length > 0) {
      const filteredLocations = _.filter(this.settings.location, x => x.name && x.name.length > 0);
      if (filteredLocations && filteredLocations.length > 0) {
        massfolowData.conditions.push({
          type: ConditionType.Location,
          values: [...filteredLocations]              // this.settings.location.map(x => x.name)
        });
      }
    }
  }

}
