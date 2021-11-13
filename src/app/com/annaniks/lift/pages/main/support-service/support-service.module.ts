
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Our Modules
import { SupportServiceRoutingModule } from './support-service.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { TicketListItemComponent } from './components';
import { SupportService } from './support-service.service';


@NgModule({
    declarations: [
        SupportServiceRoutingModule.components,
        TicketListItemComponent
    ],
    imports: [
        CommonModule,
        SupportServiceRoutingModule,
        SharedModule
    ],
    entryComponents: [SupportServiceRoutingModule.entryComponents],
    providers: [SupportService],
    exports: []
})
export class SupportServiceModule {
}
