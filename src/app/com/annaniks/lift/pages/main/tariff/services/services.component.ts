import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IorderedServices, IServiceLocal } from '../../../../shared/interfaces/tariff.interface';

export interface Tile {
  value: boolean;
  text: string;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {

  public countLeft: number;
  public leftIndexes: number[];
  public rightIndexes: number[];
  private _orderedServices: IServiceLocal[]

  @Input() set orderedServices(value: IServiceLocal[])
  {
    this._orderedServices = value;
    this.countLeft = Math.ceil(value.length / 2);
    this.leftIndexes = [];
    this.rightIndexes = [];
    for (let i = 0; i < this.countLeft; i++) {
      this.leftIndexes.push(i);
      const j = i + this.countLeft;
      this.rightIndexes.push(j < this._orderedServices.length ? j : -1);
    }
  }
  get orderedServices(): IServiceLocal[] {
    return this._orderedServices;
  }

  @Input()
  validUntil: string;

  constructor() { }

  ngOnInit() {
  }
}
