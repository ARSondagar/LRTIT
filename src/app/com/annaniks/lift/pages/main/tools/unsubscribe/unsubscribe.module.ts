// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd part libraries
import { SharedModule } from '../../../../shared/shared.module';
import { UnsubscribeRoutingModule } from './unsubscribe.routing.module';
import { UnsubscribeComponent } from './unsubscribe.component';
import { CalendarModule } from 'primeng/calendar';



@NgModule({
    declarations: [
        UnsubscribeComponent
    ],
    imports: [
        UnsubscribeRoutingModule,
        CommonModule,
        SharedModule,
        CalendarModule
    ],
    providers: []
})
export class UnsubscribeModule {
    constructor() {
        console.log(this);
    }
}