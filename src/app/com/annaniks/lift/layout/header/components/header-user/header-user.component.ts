import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent implements OnInit, OnDestroy {
  public showUserDetails: boolean = false;
  public isRestricted: boolean;

  @Output('navigated')
  public navigated = new EventEmitter<void>();

  @Output('logOut')
  public logOut = new EventEmitter<void>();

  constructor(
  ) {
    this.isRestricted = environment.isRestricted;
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

}
