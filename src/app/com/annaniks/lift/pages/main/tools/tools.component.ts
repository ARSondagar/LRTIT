import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { NavbarService } from '../../../core/services';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  private isRestricted: boolean;

  constructor(public appSvc: AppService,
              private _navbarService: NavbarService) {
    this.isRestricted = environment.isRestricted;

    const items = [
      {
        label: 'Планировщик',
        routerLink: '/tools/scheduler',
        isValid: true
      },
      {
        label: 'Директ',
        routerLink: '/tools/direct',
        isRestricted: this.isRestricted,
        isValid: true
      },
      {
        label: 'Отписка',
        routerLink: '/tools/unsubscribe',
        isRestricted: this.isRestricted,
        isValid: true
      },
    //  {
    //    label: 'Списки',
    //    routerLink: '/tools/lists',
    //    isRestricted: this.isRestricted
    //  }
    ]
    this._navbarService.setNavbarItems(items);
  }

  ngOnInit() {
  }

}
