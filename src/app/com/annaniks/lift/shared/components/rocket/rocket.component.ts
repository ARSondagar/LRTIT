import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-rocket',
  templateUrl: './rocket.component.html',
  styleUrls: ['./rocket.component.sass']
})
export class RocketComponent implements OnInit {
  /*
  *                     5 стадий ракеты
  * 0 - ракета в спокойном состоянии без языков пламени
  * 1 - ракета дрожит без языков пламени, готовится к запуску
  * 2 - ракета дрожит с языками пламени, предполетное состояние
  * 3 - ракета улетает
  * 4 - ракета с языками пламени без анимаций
  * */
  @Input() stage: 0 | 1 | 2 | 3 | 4 = 0;
  constructor() { }

  ngOnInit() {
  }

}
