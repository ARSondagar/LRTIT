import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Search, SearchTerm } from '../../../../../core/models/search';
import { Observable, Subject } from 'rxjs';
import { RequireMatchOfType } from '../../../../../core/utilities/type-validator';
import { map } from 'rxjs/operators';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';
import { Location } from '../../../../../core/models/account';

@Component({
  selector: 'scheduler-by-location',
  templateUrl: './scheduler-by-location.component.html',
  styleUrls: ['./scheduler-by-location.component.scss']
})
export class SchedulerByLocationComponent implements OnInit {
  @Output('formData') private _formData = new EventEmitter<any>();
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public searchStream$: Observable<Search>;
  public locationForm: FormGroup;
  public locationsItems: FormArray;
  public results: string[];

  constructor(
    private _fb: FormBuilder,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService
  ) { }

  ngOnInit() {
    this._formBuilder();
  }

  private _resetProperties(): void {
    this._formBuilder()
  }

  private _formBuilder(): void {
    this.locationForm = this._fb.group({
      items: this._fb.array([])
    });
    this.locationForm.valueChanges.subscribe((data) => {
      this.writeValueToService();
    })
  }

  public writeValueToService(): void {
    let locations: Location[] = [];

    this.locationForm.value.items.map((coordinate: { label: Location }) => {
      locations.push(coordinate.label);
    });
    this._autoSubscribeOrWatchStoryService.settings.location = locations;
  }

  public searchFor(event): void {
    const searchTerm: SearchTerm = { type: "place", query: event.query }
    this.searchStream$ = this._autoSubscribeOrWatchStoryService.searchFor(searchTerm).pipe(map(search => search.data))
  }

  public createItem(): FormGroup {
    return this._fb.group({ label: new FormControl('', RequireMatchOfType) });
  }

  public addItem(): void {
    this.locationsItems = this.locationForm.get('items') as FormArray;
    this.locationsItems.push(this.createItem());
  }

  public deleteLocation(locationIndex: number): void {
    this.locationsItems.removeAt(locationIndex);
  }

  public clearAll(): void {
    while (this.locationsItems.length !== 0) {
      this.locationsItems.removeAt(0);
    }
  }

  get itemsControl(): FormArray {
    return this.locationForm.get('items') as FormArray;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
