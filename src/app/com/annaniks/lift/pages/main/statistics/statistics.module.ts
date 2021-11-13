
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Our Modules
import { StatisticsRoutingModule } from './statistics.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { StatisticsService } from './statistics.service';


@NgModule({
    declarations: [
        StatisticsRoutingModule.components,
    ],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        SharedModule
    ],
    providers: [
        StatisticsService
    ],
    exports: []
})
export class StatisticsModule {
}
