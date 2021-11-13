import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarService } from '../../core/services/navbar.service';
import { NavbarItem } from '../../core/models/navbar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.scss']
})
export class SubmenuComponent implements OnInit {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public currentRoute: string;
  public navbarItems: NavbarItem[] = [];

  constructor(
    private _router: Router,
    private _navbarService: NavbarService
  ) {
    this.currentRoute = _router.url;

    this._takeOutCurrentRoute();
  }

  ngOnInit() {
    this._takeNavbarItems();
  }

  private _takeOutCurrentRoute(): void {
    this._router.events
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
        }
      });
  }

  private _takeNavbarItems(): void {
    this._navbarService.navbarItemsChangeEvent
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((items: NavbarItem[]) => {
        setTimeout(() => {
          this.navbarItems = items;
        });
      })
  }

  isShow () {
    return this.navbarItems && this.currentRoute !== '/autoposting' && this.currentRoute !== '/tariff' &&
           this.currentRoute.indexOf('/articles') === -1
  }
}
