// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Our Modules
import { PreviewRoutingModule } from './preview.routing.module';
import { PreviewService } from './preview.service';
import { SharedModule } from '../../../../shared/shared.module';
import { PreviewComponent } from './preview.component';
import { BestPostsForLastMonthComponent } from './components';
import { PaymentDialogComponent } from '../../tariff/payment-dialog/payment-dialog.component';

@NgModule({
  declarations: [PreviewComponent,
                 BestPostsForLastMonthComponent
  ],
  imports: [
    PreviewRoutingModule,
    CommonModule,
    SlickCarouselModule,
    MatSlideToggleModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [
    PaymentDialogComponent
  ],
  providers: [PreviewService, DatePipe],
})
export class PreviewModule {}
