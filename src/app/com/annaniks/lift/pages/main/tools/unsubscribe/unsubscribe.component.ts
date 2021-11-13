import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutoSubscribeOrWatchStoryService } from '../../../../shared/services/auto-subscribe-watch-story.service';
import { UnsubscribeService } from './unsubscribe.service';
import { UnsubscribePayload } from '../../../../core/models/unsubscribe';
import { LoadingService } from '../../../../core/services';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { currentInstagramSelector } from '../../../auth/store/selectors';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit, OnDestroy {

  private _unsubscribe$ = new Subject<void>();
  public unsubscribeForm: FormGroup;
  public settings: UnsubscribePayload;
  public currentInstagram: InstagramAccount;
  public unsubscribeOptions = [{value: 0, name: 'Всех', disabled: true}];
  public hourOption = [{value: null, name: 'Часы', disabled: true}, ...this.generateTime(24)];
  public minuteOption = [{value: null, name: 'Минуты', disabled: true}, ...this.generateTime(59)];
  constructor(
    private _fb: FormBuilder,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    private _unsubscribeService: UnsubscribeService,
    private store: Store,
    private _loadingService: LoadingService,
    public appSvc: AppService,
    private router: Router
  ) { }

  ngOnInit() {
    this._initForm();
    this._patchStateToForm()

    this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
      this.currentInstagram = resp;
    })
  }

  private _initForm(): void {
    this.unsubscribeForm = this._fb.group({
      unsubscribeFrom: ['Esim inch'],
      unsubscribeCount: 1,
      startFromEnd: false,
      whiteList: this._fb.group({ status: false, value: '' }),
      unsubscribeFromLift: false,
      date: [null, [Validators.required]],
      hours: [this.hourOption[0], [Validators.required]],
      minutes: [this.minuteOption[0], [Validators.required]]
    })
  }

  public saveUnsubscribeSettings(): void {
    const formValue = this.unsubscribeForm.value;
    const sendingData: UnsubscribePayload = {
      loginId: this.currentInstagram.id.toString(),
      countUnsubscribe: formValue.unsubscribeCount,
      filter: this._autoSubscribeOrWatchStoryService.settings.filter,
      startFromEnd: formValue.startFromEnd,
      unsubscribeFrom: formValue.unsubscribeFrom,
      unsubscribeFromLift: formValue.unsubscribeFromLift,
      whiteList: formValue.whiteList.status ? formValue.whiteList.value.split(',') : [],
      date: new Date(new Date(new Date(`${formValue.date}`).setHours(formValue.hours.value || 0)).setMinutes(formValue.minutes.value || 0))
    }
    if (this.unsubscribeForm.valid) {
      this._loadingService.showLoading();
      this._unsubscribeService.saveSettings(sendingData)
        .pipe(
          takeUntil(this._unsubscribe$),
          finalize(() => this._loadingService.hideLoading())
        )
        .subscribe((data) => {
          console.log(data);
        })
    }
  }

  private _patchStateToForm(): void {
    const loginId = this.currentInstagram.id.toString();
    this._unsubscribeService.getSettings(loginId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res) => {

        const response = res.data;

        this.settings = response
        this.unsubscribeForm.patchValue({
          countUnsubscribe: response.countUnsubscribe,
          startFromEnd: response.startFromEnd,
          unsubscribeFrom: response.unsubscribeFrom,
          unsubscribeFromLift: response.unsubscribeFromLift,
          whiteList: {
            status: response.whiteList ? true : false,
            value: JSON.parse(response.whiteList)
          },
          date: new Date(response.date),
          hours: new Date(response.date).getHours() === 0 ? '00' : new Date(response.date).getHours(),
          minutes: new Date(response.date).getMinutes() === 0 ? '00' : new Date(response.date).getMinutes(),

        })
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
    this.router.navigateByUrl('tariff/tarif_new');
  }
}
