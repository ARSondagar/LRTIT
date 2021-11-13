import { currentInstagramSelector } from './../../../../auth/store/selectors';
import { Component, OnInit, Inject, ElementRef, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { CalendarEvent } from 'angular-calendar';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MassFollowingSettings } from 'src/app/com/annaniks/lift/core/models/account';
import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { AuthService } from 'src/app/com/annaniks/lift/core/services';
import { AutoSubscribeOrWatchStoryService } from 'src/app/com/annaniks/lift/shared/services/auto-subscribe-watch-story.service';
import { SubSink } from 'subsink';
import { AddPostStoryComponent } from '../../../autoposting/add-post-story/add-post-story.component';
import { MainService } from '../../../main.service';
import { SchedulerService } from '../scheduler.service';

@Component({
  selector: 'app-scheduler-details',
  templateUrl: './scheduler-details.component.html',
  styleUrls: ['./scheduler-details.component.scss']
})
export class SchedulerDetailsComponent implements OnInit, OnDestroy {
  private _subs = new SubSink();
  private _activeAccount: InstagramAccount = {} as InstagramAccount;
  private positionRelativeToElement: HTMLElement
  public settings: MassFollowingSettings = new MassFollowingSettings()

  constructor(
    private _schedulerService: SchedulerService,
    private _dialogRef: MatDialogRef<SchedulerDetailsComponent>,
    private _dialog: MatDialog,
    private _authService: AuthService,
    private store: Store,
    private _mainService: MainService,
    @Inject('FILE_URL') public fileUrl: string,
    @Inject(MAT_DIALOG_DATA) public options: { positionRelativeToElement: HTMLElement, event: CalendarEvent }) {
    this.positionRelativeToElement = options.positionRelativeToElement
  }

  ngOnInit() {
    console.log(this.options);
    this._getActiveAccount();
    this._fetchSettings();
    this.setSchedulerDetailsPosition();
  }

  private _fetchSettings(): void {
    this.settings = this.options.event.meta.settings;
    console.log(this.settings);
    if (this.settings) {
      this.settings.tags = JSON.parse(this.settings.tags.toString());
      this.settings.commentersByAccounts = JSON.parse(this.settings.commentersByAccounts.toString());
      this.settings.likers = JSON.parse(this.settings.likers.toString());
      this.settings.followersByAccounts = JSON.parse(this.settings.followersByAccounts.toString());
      this.settings.location = JSON.parse(this.settings.location.toString());
    }

    // this._subs.add(
    //   this._autoSubscribeOrWatchStoryService.settingsState.subscribe((data: MassFollowingSettings) => {
    //     this.settings = data;
    //   })
    // )
  }

  public editPostOrStory(): void {
    const dialogRef = this._dialog.open(AddPostStoryComponent, {
      maxWidth: '1200px',
      panelClass: 'add-ps-container',
      data: {
        type: this.options.event.meta.type,
        editable: false,
        event: this.options.event.meta.postOrStory
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.changed) {
        this.immediatilyDeleteStoryPostScheduler();
      }
    })

  }

  @HostListener('window:resize')
  setSchedulerDetailsPosition() {
    const matDialogConfig = new MatDialogConfig()
    const rect: DOMRect | ClientRect = this.positionRelativeToElement.getBoundingClientRect()
    if (window.innerWidth - rect.left - rect.width > 516) {
      matDialogConfig.position = { left: `${rect.right + 1}px`, top: `${rect.bottom - 40}px` }
    } else {
      matDialogConfig.position = { left: `${rect.left - 517}px`, top: `${rect.bottom - 40}px` }
    }
    const contentHeight = document.getElementById('scheduler-details').offsetHeight
    if (window.innerHeight - contentHeight < contentHeight) {
      matDialogConfig.position.bottom = `0px`
    }
    this._dialogRef.updatePosition(matDialogConfig.position)
  }

  public deleteScheduler(): void {
    const sendingData: { accountId: number, date: number, type: string } = {
      accountId: this._activeAccount.id,
      date: this.options.event.start.getTime() + 46800000,
      type: this.options.event.meta.type,
    }
    this._subs.add(
      this._mainService.openActionModal()
        .pipe(
          switchMap((data) => {
            if (data === 'yes') {
              return this._schedulerService.deleteActionScheduler(sendingData)
            }
            return of();
          })
        ).subscribe(() => {
          this._dialogRef.close(true);
        })
    )
  }

  public immediatilyDeleteStoryPostScheduler(): void {
    const sendingData: { accountId: number, type: string, id: number } = {
      accountId: this._activeAccount.id,
      type: this.options.event.meta.type,
      id: this.options.event.meta.postOrStory.id
    }
    this._subs.add(
      this._schedulerService.deletePostStoryScheduler(sendingData).subscribe(() => this._dialogRef.close(true))
    )
  }

  public deleteStoryPostScheduler(): void {
    const sendingData: { accountId: number, type: string, id: number } = {
      accountId: this._activeAccount.id,
      type: this.options.event.meta.type,
      id: this.options.event.meta.postOrStory.id
    }
    this._subs.add(
      this._mainService.openActionModal()
        .pipe(
          switchMap((data) => {
            if (data === 'yes') {
              return this._schedulerService.deletePostStoryScheduler(sendingData)
            }
            return of();
          })
        ).subscribe(() => {
          this._dialogRef.close(true);
        })
    )
  }


  private _getActiveAccount(): void {
    this._subs.add(
      this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
        this._activeAccount = resp;
      })
    )
  }


  public onDeleteScheduler(): void {
    if (this.options.event.meta.type == 'post' || this.options.event.meta.type == 'story') {
      this.deleteStoryPostScheduler();
    } else {
      this.deleteScheduler();
    }
  }

  ngOnDestroy() {
    this._subs.unsubscribe()
  }
}
