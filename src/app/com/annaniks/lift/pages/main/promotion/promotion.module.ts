
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Our Modules
import { PromotionRoutingModule } from './promotion.routing.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    declarations: [
        PromotionRoutingModule.components,
    ],
    imports: [
        CommonModule,
        PromotionRoutingModule,
        SharedModule
    ],
    exports: []
})
export class PromotionModule {
}
