import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { SearchTerm, Search } from 'src/app/com/annaniks/lift/core/models/search';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Hashtag } from '../../../../../core/models/account';
import { RequireMatchOfType } from 'src/app/com/annaniks/lift/core/utilities/type-validator';

@Component({
  selector: 'app-scheduler-by-hashtags',
  templateUrl: './scheduler-by-hashtags.component.html',
  styleUrls: ['./scheduler-by-hashtags.component.scss']
})
export class SchedulerByHashtagsComponent implements OnInit {

  private _unsubscribe$: Subject<void> = new Subject<void>();
  public searchValue$: Observable<Search>;
  public hashtag: string;
  public hashtagsForm: FormGroup;
  public hashtagsItems: FormArray;

  constructor(
    private _fb: FormBuilder,
    private _subscribeStoryService: AutoSubscribeOrWatchStoryService
  ) { }

  ngOnInit() {
    this._formBuilder();
  }

  private _formBuilder(): void {
    this.hashtagsForm = this._fb.group({
      items: this._fb.array([])
    });
    this.hashtagsForm.valueChanges.subscribe(data => {
      this.writeValueToService();
    })
  }

  public search(event): void {
    const searchTerm: SearchTerm = { type: 'hashtag', query: event.query }
    this.searchValue$ = this._subscribeStoryService.searchFor(searchTerm).pipe(map(search => search.data))
  }

  public createItem(label: string = ''): FormGroup {
    return this._fb.group({ label: new FormControl('', RequireMatchOfType) });
  }

  public addItem(label?: string): void {
    this.hashtagsItems = this.hashtagsForm.get('items') as FormArray;
    this.hashtagsItems.push(this.createItem(label));
  }

  public deleteHashtag(hashtagIndex: number): void {
    this.hashtagsItems.removeAt(hashtagIndex);
  }

  public clearAll(): void {
    while (this.hashtagsItems.length !== 0) {
      this.hashtagsItems.removeAt(0);
    }
  }

  public writeValueToService(): void {
    let hashtags = [];
    this.hashtagsForm.value.items.map((hashtag) => {
      hashtags.push(hashtag.label)
    });
    this._subscribeStoryService.settings.tags = hashtags;
  }

  get itemsControl(): FormArray {
    return this.hashtagsForm.get('items') as FormArray;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

}
