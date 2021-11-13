import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';

import { Limits } from '../../../core/models/limits';
import { NavbarItem } from '../../../core/models/navbar';
import { NavbarService } from '../../../core/services/navbar.service';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  public items: NavbarItem[] = [];
  public limits: Limits;
  public currentRoute = '';

  constructor(
    private _router: Router,
    private appSvc: AppService,
    private _navbarService: NavbarService
  ) {
    this.currentRoute = _router.url;
    this.items = [
      {
        label: 'Получение подписчиков',
        routerLink: '/promotion/autosubscribe',
        isRestricted: false,
        isValid: true
      },
      {
        label: 'Повышение охватов',
        routerLink: '/promotion/auto-watch-story',
        isRestricted: environment.isRestricted,
        isValid: true
      },
      {
        label: 'Получение активности',
        routerLink: '/promotion/bonuses',
        isRestricted: environment.isRestricted,
        isValid: true
      }
  ]
    this._navbarService.setNavbarItems(this.items);
  }

  ngOnInit() { }

}
