import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
// import { FooterNavigationComponent } from '../../app/com/annaniks/lift/shared/components/footer-navigation'

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  public listIsVisible_0 = false;
  public listIsVisible_1 = false;
  public listIsVisible_2 = false;
  public listIsVisible_3 = false;

  constructor(
    private router: Router,
    private _appSvc: AppService
  ) { }

  ngOnInit() {
  }

  public toggleHeaderFlag(evt): void {
    evt.stopPropagation();
    evt.preventDefault();
    this._appSvc.setHeaderFlag(0);
  }

  toggleArrow(index: number) {
    switch (index) {
      case 0:
        this.listIsVisible_0 = !this.listIsVisible_0;
        break;
      case 1:
        this.listIsVisible_1 = !this.listIsVisible_1;
        break;
      case 2:
        this.listIsVisible_2 = !this.listIsVisible_2;
        break;
      case 3:
        this.listIsVisible_3 = !this.listIsVisible_3;
        break;
      }
  }
}
