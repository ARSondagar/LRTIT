import { Component, OnInit } from '@angular/core';
import { NavbarItem } from '../../../core/models/navbar';
import { NavbarService } from '../../../core/services/navbar.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor(private _navbarService: NavbarService) {
    const items = [
    //  {
    //    label: 'Обзор',
    //   routerLink: '/statistics/preview'
    //  },
    //  {
    //    label: 'Подписчики',
    //    routerLink: '/statistics/subscribers'
    //  },
    //  {
    //    label: 'Мои подписки',
    //    routerLink: '/statistics/my-subscribes'
    //  },
    //  {
    //    label: 'Посты',
    //    routerLink: '/statistics/posts'
    //  },
    //  {
    //    label: 'Активность',
    //    routerLink: '/statistics/activity'
    //  },

    ]
    this._navbarService.setNavbarItems(items);
  }


  ngOnInit() { }
} 
