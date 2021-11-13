import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'footer-navigation',
  templateUrl: './footer-navigation.component.html',
  styleUrls: ['./footer-navigation.component.scss']
})
export class FooterNavigationComponent implements OnInit {

  constructor(private _appSvc: AppService) { }

  ngOnInit() {
  }

  // value == 0 --> Show main containt (restore host page)
  //          1 --> Show FAQ page
  //          2 --> Show CompanyComponent
  //          3 --> Show ContactsComponent

  toggleContent(evt, pageId: number) {
    evt.stopPropagation();
    evt.preventDefault();
    const lastValue = this._appSvc.getHeaderFlag();
    if (lastValue === pageId) {
      this._appSvc.setHeaderFlag(0);
    } else {
      this._appSvc.setHeaderFlag(pageId);
    }
  }
}
