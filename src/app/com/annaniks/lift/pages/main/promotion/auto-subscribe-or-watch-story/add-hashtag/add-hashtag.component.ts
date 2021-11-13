import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { SearchTerm, Search } from 'src/app/com/annaniks/lift/core/models/search';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Hashtag } from '../../../../../core/models/account';
import { RequireMatchOfType } from 'src/app/com/annaniks/lift/core/utilities/type-validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-hashtag',
  templateUrl: './add-hashtag.component.html',
  styleUrls: ['./add-hashtag.component.scss']
})
export class AddHashtagComponent implements OnInit, OnDestroy {
  private _unsubscribe$: Subject<void> = new Subject<void>();

  // tslint:disable-next-line:no-output-rename
  @Output('searched') private _searched = new EventEmitter<SearchTerm>();
  @Output() private allDeleted = new EventEmitter<string>();

  // tslint:disable-next-line:no-input-rename
  @Input() public searchValue: Search[];

  public hashtag: string;
  public hashtagsForm: FormGroup;
  public hashtagsItems: FormArray;
  public isRestricted: boolean;

  constructor(
    private _fb: FormBuilder,
    private _subscribeStoryService: AutoSubscribeOrWatchStoryService
  ) {
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this._formBuilder();
    this._checkSelectedTags();
  }

  private _formBuilder(): void {
    this.hashtagsForm = this._fb.group({
      items: this._fb.array([])
    });
    this.hashtagsForm.valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {
        this.writeValueToService();
      })
  }

  private _checkSelectedTags(): void {
    this._subscribeStoryService.getSettingsByType('tags')
      .pipe(
        takeUntil(this._unsubscribe$),
      )
      .subscribe((tags: Hashtag[]) => {
        this._resetProperties();
        if (tags && tags.length > 0) {
          tags.map((element: Hashtag, index: number) => {
            this.hashtagsItems = this.hashtagsForm.get('items') as FormArray;
            this.hashtagsItems.push(this._fb.group({ label: new FormControl(element, RequireMatchOfType) }));
          })
        }
      })
  }

  private _resetProperties(): void {
    this._formBuilder();
  }

  public search(event): void {
    this._searched.emit({ type: 'hashtag', query: event.query })
  }

  public createItem(label: string = ''): FormGroup {
    return this._fb.group({ label: new FormControl('', RequireMatchOfType) });
  }

  public addItem(label?: string): void {
    this.hashtagsItems = this.hashtagsForm.get('items') as FormArray;
    this.hashtagsItems.push(this.createItem(label));
  }

  // TODO: Emit event when this.hashtagsItems is empty (this.hashtagsItems.length < 1)
  public deleteHashtag(hashtagIndex: number): void {
    this.hashtagsItems.removeAt(hashtagIndex);
    if (this.hashtagsItems.length < 1) {
      this.allDeleted.emit('hashtag');
    }
  }
  public clearAll(): void {
    while (this.hashtagsItems.length !== 0) {
      this.hashtagsItems.removeAt(0);
    }
    this.allDeleted.emit('hashtag');
  }

  public writeValueToService(): void {
    const hashtags = [];
    this.hashtagsForm.value.items.map((hashtag) => {
      hashtags.push(hashtag.label)
    });
    this._subscribeStoryService.settings.tags = hashtags;
    this._subscribeStoryService.conditionWasModified = true;
  }

  get itemsControl(): FormArray {
    return this.hashtagsForm.get('items') as FormArray;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
