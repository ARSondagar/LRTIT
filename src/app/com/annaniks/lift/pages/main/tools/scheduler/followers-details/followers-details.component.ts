import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICalendarMetaData } from 'src/app/com/annaniks/lift/shared/interfaces/massfollow.interface';
import moment from 'moment';
import { SchedulerService } from '../scheduler.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-followers-details',
  templateUrl: './followers-details.component.html',
  styleUrls: ['./followers-details.component.scss']
})
export class FollowersDetailsComponent implements OnInit {
  private dialogData: ICalendarMetaData;
  dateUtcRu: string;
  dateMinUtcRu: string;
  minDate: any;   // Moment object
  isMobile: boolean;
  countTasks: number;
  currentInstagramId: number;

  constructor(
    private dialogRef: MatDialogRef<FollowersDetailsComponent>,
    private _toastrService: ToastrService,
    private _schedulerService: SchedulerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogData = this.data.shedulerEvt.meta;
    this.minDate =  moment.utc(this.data.minDate);
    this.dateUtcRu = this.formatUtcDate(this.dialogData.schedulerData.followDateObj, false);
    this.dateMinUtcRu = this.formatUtcDate(this.minDate);
    this.isMobile = this.data.panelClass.startsWith('Mobile');
    this.countTasks = this.data.countTasks;
    this.currentInstagramId = this.data.currentInstagramId;
  }

  ngOnInit() {
  }

  // noClickEvt(evt) {
  //   evt.stopPropagation();
  //   evt.preventDefault();
  //   this.dialogRef.close();
  // }
  closeTaskEvt(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this._schedulerService.closeTask(this.currentInstagramId, 1, false)
      .subscribe((data: any) => {
        console.log(data);
        const resp = {
          code: data.code,
          serverResp: data.data   // {id: 198, serviceId: number, active: boolean}
        };
        this.dialogRef.close(resp);
      }, err => {
        this._toastrService.error('Задача не была закрыта из-за ошибки');
        console.log(err);
        const resp = {
          code: 500,
          serverResp: null   // {id: 198, serviceId: number, active: boolean}
        };
      })
  }

  private formatUtcDate(momentDate, withTime: boolean = true): string {
    const dtValue: string[] = momentDate.toDate().toISOString().split('T');
    moment.locale('ru');
    const date = momentDate.format('LL')
    if (withTime) {
      const time  = dtValue[1].substring(0, 8);
      return `${date}, ${time}`;
    } else {
      return date;
    }
  }

  closeDialog(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.dialogRef.close();
  }
}
