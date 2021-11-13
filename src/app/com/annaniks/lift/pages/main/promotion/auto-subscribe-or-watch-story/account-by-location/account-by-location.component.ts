import { environment } from 'src/environments/environment';
import { AppleMapService } from './../../../../../shared/services/appleMap.service';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  AfterViewInit,
} from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { SearchTerm, Search } from '../../../../../core/models/search';
import { Observable, Subject } from 'rxjs';
import { Location } from '../../../../../core/models/account';
import { takeUntil } from 'rxjs/operators';
import { RequireMatchOfType } from '../../../../../core/utilities/type-validator';
import { AutoSubscribeOrWatchStoryService } from '../../../../../shared/services/auto-subscribe-watch-story.service';

declare var mapkit;
@Component({
  selector: 'app-account-by-location',
  templateUrl: './account-by-location.component.html',
  styleUrls: ['./account-by-location.component.scss'],
})
export class AccountByLocationComponent implements OnInit {
  private _unsubscribe$: Subject<void> = new Subject<void>();

  // new code
  public map: any;
  public annotations: any[] = [];
  public selectedPlaces: any[] = [];

  // tslint:disable-next-line:no-output-rename
  @Output('searched') private _searched = new EventEmitter<SearchTerm>();
  @Output() private allDeleted = new EventEmitter<string>();
  @Input() public searchValue: Search[];

  public locationForm: FormGroup;
  public locationsItems: FormArray;

  constructor(
    private _fb: FormBuilder,
    public appleMapService: AppleMapService,
    private _subscribeStoryService: AutoSubscribeOrWatchStoryService
  ) {}

  ngOnInit() {
    this._formBuilder();

    // Map init
    this.map = new mapkit.Map('map');
    this.appleMapInit();

    setTimeout(() => {
      this._checkSelectedLocations();
    }, 1000);
  }

  private _checkSelectedLocations(): void {
    this._subscribeStoryService
      .getSettingsByType('location')
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((response: Location[]) => {
        this._resetProperties();
        const items = this.locationForm.get('items') as FormArray;
        if (response && response.length > 0) {
          response.map((location: Location, index: number) => {
            this.locationsItems = this.locationForm.get('items') as FormArray;
            items.push(
              this._fb.group({
                label: new FormControl(location, RequireMatchOfType),
              })
            );
            if (location) {
              this.createAnnotation({
                lat: location.lat,
                lng: location.lng,
              });
            }
          });
        }
      });
  }

  private _resetProperties(): void {
    this._formBuilder();
  }

  private _formBuilder(): void {
    this.locationForm = this._fb.group({
      items: this._fb.array([]),
    });
    this.locationForm.valueChanges.subscribe((values) => {
      this.writeValueToService();
    });
  }

  public search(event): void {
    this._searched.emit({ type: 'place', query: event.query });
  }

  public createAnnotation(location: { lat: number; lng: number }): void {
    // Create Coordinates of Annotation from place Location
    const annotationPos = new mapkit.Coordinate(location.lat, location.lng);

    // Create Annotation
    const annotation = new mapkit.MarkerAnnotation(annotationPos);

    // Add Annotation to local array
    this.annotations.push(annotation);

    // Create Annotation on the Apple Map
    this.map.addAnnotation(annotation);

    // Zoom on Annotation
    this.zoom();
  }

  public createItem(): FormGroup {
    return this._fb.group({ label: new FormControl('', RequireMatchOfType) });
  }

  public addItem(): void {
    this.locationsItems = this.locationForm.get('items') as FormArray;
    this.locationsItems.push(this.createItem());
  }

  public deleteLocation(locationIndex: number): void {
    // remove annotation from Apple Map if it's exist
    if (this.annotations[locationIndex]) {
      const annotation = this.annotations[locationIndex];
      this.map.removeAnnotation(annotation);
    }

    // remove annotation from local array
    this.annotations.splice(locationIndex, 1);

    // remove location from form
    this.locationsItems.removeAt(locationIndex);
    if (this.locationsItems.length < 1) {
      this.allDeleted.emit('place');
    } else {
      this.zoom();
    }

  }

  public clearAll(): void {
    while (this.locationsItems.length !== 0) {
      this.locationsItems.removeAt(0);
    }
    this.annotations.map((annotation) => {
      this.map.removeAnnotation(annotation);
    });
    this.annotations = [];
    this.allDeleted.emit('place');
  }

  // TODO: We can rewrite it to more clear code
  public writeValueToService(): void {
    const locations: Location[] = [];

    this.locationForm.value.items.map((coordinate: { label: Location }) => {
      locations.push(coordinate.label);
    });
    this._subscribeStoryService.settings.location = locations;
    this._subscribeStoryService.conditionWasModified = true;
  }

  get itemsControl(): FormArray {
    return this.locationForm.get('items') as FormArray;
  }

  appleMapInit() {
    // TODO: THIS TOKEN WILL EXPIRE 11/01/2022
    const tokenID = environment.mapKitToken;
    mapkit.init({
      authorizationCallback: function (done) {
        done(tokenID);
      },
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (!this.annotations.length) {
            console.log(pos);
            const UserLocation = new mapkit.CoordinateRegion(
              new mapkit.Coordinate(pos.lat, pos.lng),
              new mapkit.CoordinateSpan(4, 4)
            );
            this.map.region = UserLocation;
          }

          console.log('MAP INIT');
        },
        () => {
          // TODO: ADD CATCH ERROR
        }
      );
    } else {
      const defaultLocation = new mapkit.CoordinateRegion(
        new mapkit.Coordinate(55.4797, 39.74401),
        new mapkit.CoordinateSpan(10)
      );
      this.map.region = defaultLocation;
    }
  }

  onPlaceSelect(id: number, event: Location) {
    const place = this.selectedPlaces.find((p) => p.id === id);

    if (place) {
      const index = this.selectedPlaces.indexOf(place);

      const annotation = this.annotations[index];
      this.map.removeAnnotation(annotation);

      this.selectedPlaces[index] = { id, event };
    } else {
      this.selectedPlaces.push({ id, event });
    }

    this.createAnnotation({
      lat: event.lat,
      lng: event.lng,
    });
  }

  zoom() {
    const lastAnnotation = this.annotations[this.annotations.length - 1];
    const lat = lastAnnotation.coordinate.latitude;
    const lng = lastAnnotation.coordinate.longitude;

    const newCenter = new mapkit.Coordinate(lat, lng),
      span = new mapkit.CoordinateSpan(0.1),
      region = new mapkit.CoordinateRegion(newCenter, span);

    this.map.region = region;

    // if (this.annotations.length > 1) {
    //   this.map.region = this.calculateRegion();
    // } else {
    //   // If length = 0
    //   // We will take last annotation from local array
    //   let lat = this.annotations[0].coordinate.latitude;
    //   let lng = this.annotations[0].coordinate.longitude;

    //   var newCenter = new mapkit.Coordinate(lat, lng),
    //     span = new mapkit.CoordinateSpan(0.1),
    //     region = new mapkit.CoordinateRegion(newCenter, span);

    //   this.map.region = region;
    // }
  }

  calculateRegion() {
    // Calculate center of map
    let latSum = 0;
    let lngSum = 0;

    let coordinatesOnly = [];

    coordinatesOnly = this.annotations.map(
      (annotation) => annotation.coordinate
    );

    const maxLng = Math.max.apply(
      Math,
      coordinatesOnly.map((coordinate) => coordinate.longitude)
    );
    const maxLat = Math.max.apply(
      Math,
      coordinatesOnly.map((coordinate) => coordinate.latitude)
    );
    const minLng = Math.min.apply(
      Math,
      coordinatesOnly.map((coordinate) => coordinate.longitude)
    );
    const minLat = Math.min.apply(
      Math,
      coordinatesOnly.map((coordinate) => coordinate.latitude)
    );

    const pointLeft = coordinatesOnly.find(
      (coordinate) => coordinate.latitude <= minLat
    );
    const pointRight = coordinatesOnly.find(
      (coordinate) => coordinate.latitude >= maxLat
    );
    const pointTop = coordinatesOnly.find(
      (coordinate) => coordinate.longitude >= maxLng
    );
    const pointBottom = coordinatesOnly.find(
      (coordinate) => coordinate.longitude <= minLng
    );

    latSum = pointLeft.latitude + pointRight.latitude;
    lngSum = pointBottom.longitude + pointTop.longitude;

    // Calculate span of map
    let latDistance = maxLat - minLat;
    let lngDistance = maxLng - minLng;

    let distance = 0;
    if (latDistance > lngDistance) {
      distance = latDistance;
    } else {
      distance = lngDistance;
    }

    let calculatedSpan = 0;

    console.log('LAT: ', latDistance);
    console.log('LNG: ', lngDistance);

    // FOR LONGITUDE
    if ((lngDistance = distance)) {
      calculatedSpan = distance;
      if (distance >= 40) {
        calculatedSpan = 50;
      }
    }

    // FOR LATITUDE
    if ((latDistance = distance)) {
      calculatedSpan = distance;
      // if (distance >= 0.01 && distance <= 0.08) {
      //   calculatedSpan = 0.1;
      // }
      // if (distance >= 0.08 && distance <= 0.1) {
      //   calculatedSpan = 0.2;
      // }
      // if (distance >= 0.1 && distance <= 0.5) {
      //   calculatedSpan = 0.5;
      // }
      // if (distance >= 0.5 && distance <= 1) {
      //   calculatedSpan = 1;
      // }
      // if (distance >= 1 && distance <= 5)
      // {
      //   calculatedSpan = 3
      // }
      // if (distance >= 5 && distance <= 10)
      // {
      //   calculatedSpan = 10
      // }
      // if (distance >= 10 && distance <= 20)
      // {
      //   calculatedSpan = 20
      // }
      // if (distance >= 20 && distance <= 30)
      // {
      //   calculatedSpan = 30
      // }
      // if (distance >= 30 && distance <= 40)
      // {
      //   calculatedSpan = 40
      // }
      if (distance >= 40) {
        calculatedSpan = 50;
      }
    }

    console.log(calculatedSpan);

    const newCenter = new mapkit.Coordinate(latSum / 2, lngSum / 2);
    const span = new mapkit.CoordinateSpan(calculatedSpan);
    const region = new mapkit.CoordinateRegion(newCenter, span);

    return region;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
