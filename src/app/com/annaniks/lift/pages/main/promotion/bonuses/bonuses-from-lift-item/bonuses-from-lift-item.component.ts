import { Component, OnInit, Input } from '@angular/core';
import { Bonus } from 'src/app/com/annaniks/lift/core/models/bonus';

@Component({
  selector: 'app-bonuses-from-lift-item',
  templateUrl: './bonuses-from-lift-item.component.html',
  styleUrls: ['./bonuses-from-lift-item.component.scss']
})
export class BonusesFromLiftItemComponent implements OnInit {

  @Input()
  bonusInfo: Bonus

  constructor() { }

  ngOnInit() {
  }

}
