import { Component, Input, OnInit } from '@angular/core';
import { IorderedServices } from '../../../../shared/interfaces/tariff.interface';

export interface Tile {
  value: boolean;
  text: string;
}

@Component({
  selector: 'app-services-old',
  templateUrl: './services.component.old.html',
  styleUrls: ['./services.component.old.scss']
})
// tslint:disable-next-line:component-class-suffix
export class ServicesComponentOld implements OnInit {

  @Input()
  orderedServices: IorderedServices;

  @Input()
  accounts: number;

  @Input()
  validUntil: string;

  constructor() { }

  ngOnInit() {
  }
}
