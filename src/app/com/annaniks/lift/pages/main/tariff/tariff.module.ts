import { NgModule } from '@angular/core';
import { TariffComponent } from './tariff.component';
import { TariffRoutingModule } from './tariff.routing.module';
import { TariffService } from './tariff.service';
import { CommonModule } from '@angular/common';

// Material Library
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule, MatSelectModule, MatSnackBarModule } from '@angular/material';

import { SharedModule } from '../../../shared/shared.module';

import { StoreModule } from '@ngrx/store';
import { TariffNewComponent } from './tariff-new/tariff-new.component';
import { ServiceManagerComponent } from './service-manager/service-manager.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ScrollManagerComponent } from './scroll-manager/scroll-manager.component';
// import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component'

@NgModule({
    declarations: [
      TariffComponent,
      TariffNewComponent,
      ServiceManagerComponent,
      TransactionsComponent,
      ScrollManagerComponent,
    ],
    entryComponents: [
      PaymentDialogComponent
    ],
    imports: [
      TariffRoutingModule,
      CommonModule,
      ReactiveFormsModule,
      SlickCarouselModule,

      MatProgressSpinnerModule,
      MatTabsModule,
      MatCardModule,
      MatGridListModule,
      MatFormFieldModule,
      MatSelectModule,
      MatSnackBarModule,

      SharedModule,
    ],
    providers: [TariffService]
})

export class TariffModule { }
