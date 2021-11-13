import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItransactionLocal } from '../../../../shared/interfaces/tariff.interface';
import { DeviceDetectorService } from 'ngx-device-detector'

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent implements OnInit {

  listIsVisible: boolean;
  isMobile = false;

  @Input()
  history: ItransactionLocal[];

  @Input()
  pageNumber: number;

  @Output() getMore: EventEmitter<any> = new EventEmitter();

  constructor(private deviceService: DeviceDetectorService) { }

  ngOnInit() {
    this.listIsVisible = true;
    this.isMobile = this.deviceService.isMobile();
  }

  loadMoreTransactions() {
    this.getMore.emit(null);
  }
}
