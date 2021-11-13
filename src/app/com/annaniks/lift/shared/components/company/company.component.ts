import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
// import { FooterNavigationComponent } from '../../app/com/annaniks/lift/shared/components/footer-navigation'

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

  public listIsVisible_0 = false;

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
      }
  }
}
