import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../../../core/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header-notification',
  templateUrl: './header-notification.component.html',
  styleUrls: ['./header-notification.component.scss']
})
export class HeaderNotificationComponent implements OnInit, OnDestroy {

  private _unsubscribe = new Subject<void>();
  public showNots: boolean = false;

  constructor(
    private _navbarService: NavbarService
  ) { }

  ngOnInit() {
    this._getNotifications();
  }

  private _getNotifications() {
    this._navbarService.getNotifications().
      pipe(takeUntil(this._unsubscribe))
      .subscribe(data => {
        console.log(data);

      })
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

}
