import { Component, OnInit } from '@angular/core';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { Search, SearchTerm } from 'src/app/com/annaniks/lift/core/models/search';
import { Observable, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { RequireMatchOfType } from 'src/app/com/annaniks/lift/core/utilities/type-validator';

@Component({
  selector: 'app-scheduler-by-subscribers',
  templateUrl: './scheduler-by-subscribers.component.html',
  styleUrls: ['./scheduler-by-subscribers.component.scss']
})
export class SchedulerBySubscribersComponent implements OnInit {
  private _unsubscribe: Subject<void> = new Subject<void>();
  public searchValue$: Observable<Search>

  public accounts: FormControl = new FormControl([], RequireMatchOfType);

  constructor(
    private _subscribeStoryService: AutoSubscribeOrWatchStoryService
  ) { }

  ngOnInit() {
    this._subscribeToModelChange();
  }

  public writeValueToService(): void {
    this._subscribeStoryService.settings.followersByAccounts = this.accounts.value;
    this._subscribeStoryService.conditionWasModified = true;
  }


  public search(event): void {
    const searchTerm: SearchTerm = { type: "user", query: event.query }
    this.searchValue$ = this._subscribeStoryService.searchFor(searchTerm).pipe(map(search => search.data))
  }

  public clearAll(): void {
    this.accounts.setValue([]);
  }

  private _subscribeToModelChange(): void {
    this.accounts.valueChanges.subscribe(data => {
      this.writeValueToService()
    })
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

}
