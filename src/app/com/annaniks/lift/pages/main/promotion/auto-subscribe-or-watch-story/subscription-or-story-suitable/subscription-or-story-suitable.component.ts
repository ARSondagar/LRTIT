import { OptionsStore } from './../services/options.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { Observable, Subject } from 'rxjs';
import { MassFollowingSettings, Condition } from 'src/app/com/annaniks/lift/core/models/account';
import { filter, takeUntil } from 'rxjs/operators';
import { SubscriptionParam } from 'src/app/com/annaniks/lift/core/models/subscription-parameter';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-subscription-suitable',
  templateUrl: './subscription-or-story-suitable.component.html',
  styleUrls: ['./subscription-or-story-suitable.component.scss'],
})
export class SubscriptionOrStorySuitableComponent implements OnInit, OnDestroy {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public step: number;
  public suitableSubsOrStoryForm: FormGroup;
  public conditions: Condition[] = [];

  public isAutosubscribe = false;
  public isAutoWatchStory = false;

  public statisticsRoute: string;
  public shedulerRoute: string;
  public isRestricted: boolean;

  public get isEmptyCondition() {
    return this.conditions.length < 1;
  }

  constructor(
    private _fb: FormBuilder,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    public appSvc: AppService,
    private optionsService: OptionsStore,
    private _activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.isAutosubscribe = this._activatedRoute.snapshot.data.type === 'subscribe';
    this.isAutoWatchStory = this._activatedRoute.snapshot.data.type === 'story';

    this.statisticsRoute = (this.isAutosubscribe) ? '/statistics/preview' : '/statistics/preview';
    this.shedulerRoute = '/tools/scheduler';
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this._initForm();
    this._handleMassFollowingSettingsEvent();
  }

  private _handleMassFollowingSettingsEvent(): void {
    this.conditions = [];
    this._autoSubscribeOrWatchStoryService.settingsState
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((settings: MassFollowingSettings) => {
      })
  }

  private _initForm(): void {
    this.suitableSubsOrStoryForm = this._fb.group({
      publicationTimeLimit: [false]
    })
  }

  public onTypeChanged(param: SubscriptionParam, index: number): void {
    console.log(arguments)
    this.optionsService.setInactiveOption(param);
    this.conditions[index].type = param;
  }

  public onClickAddCondition(): void {
    this.conditions.push({ type: '' })
  }

  public removeCondition(conditionForRemove: Condition): void {
    this.optionsService.setActiveOption(conditionForRemove.type);
    _.remove(this.conditions, (condition: Condition) => condition.type === conditionForRemove.type);
    if (this.conditions.length < 1) {
      this._autoSubscribeOrWatchStoryService.conditionWasModified = false;
    }
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  goToPayment() {
    this.router.navigateByUrl('tariff/tarif_new');
  }
}
