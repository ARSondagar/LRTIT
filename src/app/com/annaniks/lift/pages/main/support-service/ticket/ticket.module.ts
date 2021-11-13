import { NgModule } from '@angular/core';
import { TicketComponent } from './ticket.component';
import { TicketRoutingModule } from './ticket.routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { TicketService } from './ticket.service';
import { CommonModule } from '@angular/common';
import { TicketMessageComponent } from './components';

@NgModule({
    declarations: [
        TicketComponent,
        TicketMessageComponent
    ],
    imports: [
        TicketRoutingModule,
        SharedModule,
        CommonModule
    ],
    providers: [
        TicketService
    ]
})
export class TicketModule { }