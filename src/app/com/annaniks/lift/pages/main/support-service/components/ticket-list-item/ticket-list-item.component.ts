import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from '../../../../../core/models/support-service';

@Component({
    selector: 'app-ticket-list-item',
    templateUrl: 'ticket-list-item.component.html',
    styleUrls: ['ticket-list-item.component.scss']
})
export class TicketListItemComponent implements OnInit {
    @Input('ticket') public ticket: Ticket = {} as Ticket;
    @Input('active') public active = false;
    @Input('mode') public mode: 'skeletion' | 'normal' = 'normal';

    constructor() { }

    ngOnInit() { }
}