import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { AccountSearchParam } from '../../../../../core/models/subscription-parameter';
import { SubSink } from 'subsink';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { Search, SearchTerm } from 'src/app/com/annaniks/lift/core/models/search';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { RequireMatchOfType } from 'src/app/com/annaniks/lift/core/utilities/type-validator';
import { environment } from 'src/environments/environment';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-account-search',
  templateUrl: './account-search.component.html',
  styleUrls: ['./account-search.component.scss']
})
export class AccountSearchComponent implements OnInit, OnDestroy {
  private _unsubscribe: Subject<void> = new Subject<void>();
  form = new FormGroup({
    accounts: new FormControl([], RequireMatchOfType)
  });
  get accounts(): any {
    return this.form.get('accounts');
  };

  // tslint:disable-next-line:no-input-rename
  @Input('type') public type: AccountSearchParam;
  // tslint:disable-next-line:no-output-rename
  @Output('searched') private _searched = new EventEmitter<SearchTerm>();
  @Output() private allDeleted = new EventEmitter<string>();

  @Input() public searchValue: Search[];
  public isRestricted: boolean;

  @ViewChild('accountAutocomplete', {static: true}) ac: AutoComplete;

  private _subs = new SubSink();

  constructor(
    private _subscribeStoryService: AutoSubscribeOrWatchStoryService
  ) {
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {
    this._checkAccountSearchType();
    this._subscribeToModelChange();
  }

  private _checkAccountSearchType(): void {
    let accountType: string;
    if (this.type === 'subscriber') {
      accountType = 'followersByAccounts';
    }
    if (this.type === 'comment') {
      accountType = 'commentersByAccounts';
    }
    if (this.type === 'likes') {
      accountType = 'likers';
    }
    this._subscribeStoryService.getSettingsByType(accountType)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((data) => {
        this.accounts.patchValue(data);
      })
  }

  public search(event): void {
    this._searched.emit({ type: 'user', query: event.query })
  }

  public clearAll(): void {
    this.accounts.setValue([]);
    this.allDeleted.emit(this.type);
  }

  public writeValueToService(): void {
    switch (this.type) {
      case 'comment':
        this._subscribeStoryService.settings.commentersByAccounts = this.accounts.value;
        break;
      case 'likes':
        this._subscribeStoryService.settings.likers = this.accounts.value;
        break;
      case 'subscriber':
        this._subscribeStoryService.settings.followersByAccounts = this.accounts.value;
        break;
    }
  }
  private _subscribeToModelChange(): void {
    this.accounts.valueChanges.subscribe(data => {
      this.writeValueToService();
      if (data instanceof Array) {
        if (data.length > 0) {
          this._subscribeStoryService.conditionWasModified = true;
        } else {
          this.allDeleted.emit(this.type);
        }
      }
    })
  }
  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }
}
