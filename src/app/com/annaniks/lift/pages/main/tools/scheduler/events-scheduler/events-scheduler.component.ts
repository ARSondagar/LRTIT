import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { AutoSubscribeOrWatchStoryService } from 'src/app/com/annaniks/lift/shared/services/auto-subscribe-watch-story.service';
import { AddPostStoryComponent } from '../../../autoposting/add-post-story/add-post-story.component';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services';
import { ToastrService } from 'ngx-toastr';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Value } from 'src/app/com/annaniks/lift/shared/interfaces/value.interface';

@Component({
  selector: 'app-events-scheduler',
  templateUrl: './events-scheduler.component.html',
  styleUrls: ['./events-scheduler.component.scss']
})
export class EventsSchedulerComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject<void>();
  public activeTabControl = new FormControl('1');
  public eventsSchedulerForm: FormGroup;
  public isRestricted: boolean;

  public actionControlOption: Value[];
  public hourOption = [{value: null, name: 'Часы', disabled: true}, ...this.generateTime(24)];
  public minuteOption = [{value: null, name: 'Минуты', disabled: true}, ...this.generateTime(59)];
  constructor(
    private _dialogRef: MatDialogRef<EventsSchedulerComponent>,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    @Inject(MAT_DIALOG_DATA) public data: Date,
    private _dialog: MatDialog,
    private _loadingService: LoadingService,
    private _toastrService: ToastrService,
    private _fb: FormBuilder,
    private _router: Router
  ) {
    this.isRestricted = environment.isRestricted;
    this.actionControlOption = [
      {
        value: 'subscribe',
        name: this.isRestricted ? 'Получение подписчиков (заблокирована)' : 'Получение подписчиков',
        disabled: this.isRestricted
      },
      {
        value: 'stories',
        name: this.isRestricted ? 'Получение активности (скоро)': 'Получение активности',
        disabled: this.isRestricted
      },
      {value: 'post', name: 'Добавить post'},
      {value: 'story', name: 'Добавить story'},
    ];

  }

  ngOnInit() {
    this._initForm();
    this._subscribeToActionControlChange();
  }

  private _initForm(): void {
    this.eventsSchedulerForm = this._fb.group({
      actionControl: this.actionControlOption[0],
      startHours: {value: 4, name: '04'},
      startMinutes: {value: 30, name: '30'},
      endHours: {value: 23, name: '23'},
      endMinutes: {value: 59, name: '59'}
    })
  }

  private _addPostOrStory(type: string): void {
    const dialogRef = this._dialog.open(AddPostStoryComponent, {
      maxWidth: '1200px',
      panelClass: 'add-ps-container',
      data: {
        type: type,
        editable: true,
      }
    });
  }
  public closeDialog(): void {
    this._dialogRef.close();
  }

  private _subscribeToActionControlChange(): void {
    this.eventsSchedulerForm.get('actionControl').valueChanges.subscribe(type => {
      if (type === 'post' || type === 'story') {
        this._dialogRef.close();
        this._addPostOrStory(type)
      }
      if (type === 'unsubscribe') {
        this._dialogRef.close();
        this._router.navigate(['/tools/unsubscribe']);
      }
    })
  }


  public onSettingsSave(): void {

    const formValue = this.eventsSchedulerForm.value;

    const startDate = new Date(this.data.setHours(formValue.startHours.value || 0, formValue.startMinutes.value || 0, 0));
    const endDate = new Date(this.data.setHours(formValue.endHours.value || 0, formValue.endMinutes.value || 0, 0));

    const followTime = {
      start: startDate,
      end: endDate
    }

    this._loadingService.showLoading();

    this._autoSubscribeOrWatchStoryService.saveSettings(this.eventsSchedulerForm.get('actionControl').value === 'subscribe', followTime)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((data) => {
        this._toastrService.success('Изменение успешно сохранены');
        this._loadingService.hideLoading();
        this._dialogRef.close(true)
      }, (err) => {
        this._toastrService.error('Ошибка');
        this._loadingService.hideLoading();
      })

  }
  generateTime(value) {
    const arr = [];
    for (let i = 0; i <= value; i++) {
      const pattern = i.toString().length === 1 ? '0' : '';
      arr.push({
        value: i,
        name: pattern + i
      });
    }
    return arr;
  }
  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  goToPayment() {
    this._dialogRef.close(true);
    this._router.navigateByUrl('tariff/tarif_new');
  }

}
