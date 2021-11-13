import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-balans',
  templateUrl: './balans.component.html',
  styleUrls: ['./balans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalansComponent implements OnInit {
  @Input()
  public amount: number;

  @Input()
  public dailyDiscount: number;

  @Input()
  public accounts: number;

  @Input()
  public validUntil: string;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }
/*
  openDialog() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    const intViewportWidth = Math.min(window.innerWidth, 750);
    dialogConfig.width = `${intViewportWidth}px`;
    dialogConfig.height = '541px';
    dialogConfig.panelClass = 'payment-dialog';
    dialogConfig.data = {'value': Math.max(this.amount, 1000)};

    this.dialog.open(PaymentDialogComponent, dialogConfig);
  }
*/

  openDialog() {
    window.scrollTo(0, 0);
    const backDrop = document.getElementById('custom-modal-back-drop');
    backDrop.style.display = 'block';
    const dialog = document.getElementById('custom-payment-dialog');
    dialog.style.display = 'block';
  }
}
