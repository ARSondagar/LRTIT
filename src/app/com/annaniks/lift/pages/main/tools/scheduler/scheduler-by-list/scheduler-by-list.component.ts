import { Component, OnInit } from '@angular/core';
import { SchedulerService } from '../scheduler.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersList } from 'src/app/com/annaniks/lift/core/models/my-lists';

@Component({
  selector: 'scheduler-by-list',
  templateUrl: './scheduler-by-list.component.html',
  styleUrls: ['./scheduler-by-list.component.scss']
})
export class SchedulerByListComponent implements OnInit {
  private _unsubscribe$ = new Subject();
  public usersList: UsersList[];

  constructor(private _schedulerService: SchedulerService) { }

  ngOnInit() {
    this._getAllUsersLists();
  }

  private _getAllUsersLists(): void {
    this._schedulerService.getAllUsersLists()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((response) => {
        response.data.forEach(element => element.users = JSON.parse(element.users));
        this.usersList = response.data.map(item => {item['value'] = item.id; return item});
      })
  }

}
