import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Limits } from '../../../core/models/limits';
import { AuthService } from '../../../core/services/auth.service';
import { currentInstagramSelector } from '../../../pages/auth/store/selectors';

@Component({
  selector: 'app-limits',
  templateUrl: './limits.component.html',
  styleUrls: ['./limits.component.scss']
})
export class LimitsComponent implements OnInit {
  public limits: Limits;

  public currentInstagram: InstagramAccount;

  @Input('limits')
  set _limits($event) {
    this.limits = $event;
  }

  constructor(private _authService: AuthService, private store: Store) { }

  ngOnInit() {
    this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
      this.currentInstagram = resp;
    })
  }

  get userLogin(): string {
    return this.currentInstagram.login;
  }

  get perHourProgress(): number {
    if (this.limits) {
      return (100 * this.limits.subscribersForHour) / 40; // max = 40
    }
    return 0;
  }

  get perDayProgress(): number {
    if (this.limits) {
      return (100 * this.limits.subscribersForDay) / 120; // max = 120
    }
    return 0;
  }

}
