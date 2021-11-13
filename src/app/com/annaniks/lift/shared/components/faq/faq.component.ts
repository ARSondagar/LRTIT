import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  public listIsVisible_0 = false;
  public listIsVisible_1 = false;
  public listIsVisible_2 = false;
  public listIsVisible_3 = false;
  public listIsVisible_4 = false;
  public listIsVisible_5 = false;
  public listIsVisible_6 = false;
  public listIsVisible_7 = false;
  public listIsVisible_8 = false;
  public listIsVisible_9 = false;
  public listIsVisible_10 = false;
  public listIsVisible_11 = false;

  constructor(private _appSvc: AppService) {
  }

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
      case 4:
        this.listIsVisible_4 = !this.listIsVisible_4;
        break;
      case 5:
        this.listIsVisible_5 = !this.listIsVisible_5;
        break;
      case 6:
        this.listIsVisible_6 = !this.listIsVisible_6;
        break;
      case 7:
        this.listIsVisible_7 = !this.listIsVisible_7;
        break;
      case 8:
        this.listIsVisible_8 = !this.listIsVisible_8;
        break;
      case 9:
        this.listIsVisible_9 = !this.listIsVisible_9;
        break;
      case 10:
        this.listIsVisible_10 = !this.listIsVisible_10;
        break;
      case 11:
        this.listIsVisible_11 = !this.listIsVisible_11;
        break;
      }
  }


}

