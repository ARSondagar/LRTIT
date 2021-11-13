import { OptionInterface } from './../types/option.interface';
import { OptionsStore } from './../services/options.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable, of } from 'rxjs';
import { SubscriptionParam } from '../../../../../core/models/subscription-parameter';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { startWith, pairwise, map } from 'rxjs/operators';
import { SearchTerm, Search } from '../../../../../core/models/search';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-subscribe-watch-condition',
  templateUrl: './subscribe-watch-condition.component.html',
  styleUrls: ['./subscribe-watch-condition.component.scss'],
})
export class SubscribeWatchConditionComponent implements OnInit, OnDestroy {

  @Input()
  public index: number;

  public showPreviewBlock$: Observable<boolean>;

  @Input()
  set selectedType(type: SubscriptionParam) {
    if (type !== this._selectedType) {
      this._selectedType = type;
      const selectedOption = this.optionsService.getOptionById(type);
      this.typeControl.patchValue(selectedOption);
    }
  }

  // tslint:disable-next-line:no-output-rename
  @Output('onSelect')
  public typeChanges = new EventEmitter<SubscriptionParam>();

  // tslint:disable-next-line:no-output-rename
  @Output('onRemove')
  public removeEvent = new EventEmitter<void>();

  public options$: Observable<OptionInterface[]> = this.optionsService.options
    .pipe(
      map((opions: OptionInterface[]) => {
        return opions.filter((option: OptionInterface) => option.isActive);
      }),
    );

  public typeControl: FormControl = new FormControl('');
  public searchStream: Search[] = [];
  public isAutosubscribe = false;

  private _selectedType: SubscriptionParam = '';
  private _subscribe$: Subscription = new Subscription();

  constructor(
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    private _activatedRoute: ActivatedRoute,
    private optionsService: OptionsStore
  ) {
    this.isAutosubscribe = this._activatedRoute.snapshot.data.type === 'subscribe';
  }

  ngOnInit() {
    this._takeTypeControlValue();
    this._subscribeToTypeChanges();
    this._compareTypeControlValues();
  }
  private _takeTypeControlValue(): void {
    this._subscribe$ = this.typeControl.valueChanges.subscribe(
      (value: SubscriptionParam) => {
        this.optionsService.setActiveOption(this._selectedType);
        this._selectedType = value;
        this.typeChanges.emit(value);
      }
    );
  }

  private _compareTypeControlValues(): void {
    this.typeControl.valueChanges
      .pipe(startWith(null), pairwise())
      .subscribe(([prev, next]: [any, any]) => {
        this._autoSubscribeOrWatchStoryService.addedConditionsSubject$.next({
          prev,
          next,
        });
      });
  }

  public checkConditionDisable(type: string): boolean {
    let isExist = false;
    this._autoSubscribeOrWatchStoryService.addedConditions.map(
      (condition: { type: string }) => {
        if (condition.type === type) {
          isExist = true;
        }
      }
    );
    return isExist;
  }

  private _subscribeToTypeChanges(): void {
    this._autoSubscribeOrWatchStoryService.addedConditionsObservable$.subscribe(
      (data: any) => {
        if (
          !this._autoSubscribeOrWatchStoryService.addedConditions.includes(
            data.next
          )
        ) {
        }
        if (
          this._autoSubscribeOrWatchStoryService.addedConditions.includes(
            data.prev
          )
        ) {
          const index = this._autoSubscribeOrWatchStoryService.addedConditions.indexOf(
            data.prev
          );
          this._autoSubscribeOrWatchStoryService.addedConditions.splice(
            index,
            1
          );
        }
      }
    );
  }

  public searchFor(searchTerm: SearchTerm): void {
    console.log('SEARCH FOR SUBSCRIBE WATCH CALLED');
    this._autoSubscribeOrWatchStoryService
      .searchFor(searchTerm)
      .subscribe(
        (resp) => {
          if (resp.data['results'] && resp.data['results'].length > 0) {
            this.searchStream = [...<Search[]>resp.data['results']];
          } else if (resp.data && resp.data.length > 0) {
            this.searchStream = [...<any[]>resp.data];
          } else {
            this.searchStream = [];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  toObservable(data: Search): Observable<Search> {
    return of(data);
  }

  get selectedType(): SubscriptionParam {
    return this._selectedType;
  }

  // TODO: accept delete event from children
  public onRemove(): void {
    this.removeEvent.emit();
  }

  ngOnDestroy() {
    this._subscribe$.unsubscribe();
  }

  allTagsWereDeleted(evt) {
    this.removeEvent.emit();
  }
}
