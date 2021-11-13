import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { currentInstagramSelector } from './../../../../../auth/store/selectors';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DirectService } from '../../direct.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NewMailing, OldMailing } from 'src/app/com/annaniks/lift/core/models/direct';
import { AutoSubscribeOrWatchStoryService } from 'src/app/com/annaniks/lift/shared/services/auto-subscribe-watch-story.service';
import { LoadingService } from 'src/app/com/annaniks/lift/core/services/loading-service';
import { AuthService } from 'src/app/com/annaniks/lift/core/services';
import { AudienceFilterComponent } from '../../../../promotion/auto-subscribe-or-watch-story';
import { Store, select } from '@ngrx/store';

@Component({
    selector: 'app-direct-schedule',
    templateUrl: 'direct-schedule.component.html',
    styleUrls: ['direct-schedule.component.scss']
})

export class DirectScheduleComponent implements OnInit, OnDestroy {
    @Input() files: string[]
    public signatureGroup: FormGroup;
    public oldMailings: FormGroup;
    public tab: number = 1;
    public minDate: Date;
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public currentInstagram: InstagramAccount

    constructor(
        private _fb: FormBuilder,
        private _matDialog: MatDialog,
        private store: Store,
        private _directService: DirectService,
        private _authService: AuthService,
        private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
        private _loadingService: LoadingService
    ) { }

    ngOnInit() {
        this._formBuilder();
        this._subscribeToSend();
        this.minDate = new Date(Date.now())

        this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
          this.currentInstagram = resp;
        })
    }

    private _formBuilder(): void {
        this.signatureGroup = this._fb.group({
            delayedSending: [null],
            delayedSendingTime: [null],
            dontSendIfCorrespondence: [null],
            sendAfterSubscription: [null],
            applyForSubscribers: [null],
            mailingText: [null],
        })
        this.signatureGroup.get('applyForSubscribers').valueChanges.subscribe((value) => {
            if (value) {
                this._openFiltersModal();
            }
        })
        this.signatureGroup.get('mailingText').valueChanges.subscribe(value => this._directService.disableInput.next(value))
        this.oldMailings = this._fb.group({
            applyForSubscribers: [null],
            mailingText: [null],
            start: [null],
            durationStatus: [null],
            duration: [null],
            lastDaysStatus: [null],
            lastDays: [null],
        })
        this.oldMailings.get('applyForSubscribers').valueChanges.subscribe((value) => {
            if (value) {
                this._openFiltersModal();
            }
        })
        this.oldMailings.get('mailingText').valueChanges.subscribe(value => this._directService.disableInput.next(value))

    }

    private _subscribeToSend(): void {
        this._directService.sendScheduleState.pipe(
            takeUntil(this._unsubscribe$)
        ).subscribe((message: string) => {
            if (this.tab == 1) {
                this._sendSchedule(message)
            } else if (this.tab == 2) {
                this._sendOldSchedule(message)
            }
        })
    }


    private _sendOldSchedule(typedMessage: string): void {
        this._loadingService.showLoading();
        const oldMailing = this.oldMailings.value
        const sendingData: OldMailing = {
            accountId: this.currentInstagram.id,
            start: oldMailing.start ? oldMailing.start : Date.now(),
            duration: oldMailing.durationStatus ? oldMailing.duration * 60 : null,
            lastDays: oldMailing.lastDaysStatus ? oldMailing.lastDaysStatus : null,
            filter: oldMailing.applyForSubscribers ? this._autoSubscribeOrWatchStoryService.settings.filter : {},
            messages: oldMailing.mailingText ? typedMessage.split(';') : this.files,
        }
        this._directService.postOldUserMailings(sendingData).pipe(
            finalize(() => this._loadingService.hideLoading()),
            takeUntil(this._unsubscribe$)
        ).subscribe((data) => {
            this.oldMailings.reset();
            this._directService.updateMailing.next()
        })
    }

    private _sendSchedule(typedMessage: string): void {
        this._loadingService.showLoading();
        const signatureGroup = this.signatureGroup.value
        const sendingData: NewMailing = {
            accountId: this.currentInstagram.id,
            delay: signatureGroup.delayedSending ? signatureGroup.delayedSendingTime * 60 : null,
            filter: signatureGroup.applyForSubscribers ? this._autoSubscribeOrWatchStoryService.settings.filter : {},
            messages: signatureGroup.mailingText ? typedMessage.split(';') : this.files,
            sendAfterFollow: signatureGroup.sendAfterSubscription
        }
        this._directService.postNewUserMailings(sendingData).pipe(
            finalize(() => this._loadingService.hideLoading()),
            takeUntil(this._unsubscribe$)
        ).subscribe((data) => {
            this.signatureGroup.reset();
            this._directService.updateMailing.next()
        })
    }

    private _openFiltersModal(): void {
        this._matDialog.open(AudienceFilterComponent, {
            maxWidth: '80%',
            height: '80%',
            maxHeight: '80%',
            position: {
                top: '120px'
            },
            data: { showButton: true }
        });
    }

    public onChangeTab(tab): void {
        this.tab = tab;
        // this._autoSubscribeOrWatchStoryService.settings.filter;
    }

    public onClickShowCalendar(): void { }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}
