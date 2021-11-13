
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Our Modules
import { SubscribersRoutingModule } from './subscribes-posts.routing.module';
import { SubscribesPostsService } from './subscribes-posts.service';
import { SharedModule } from '../../../../shared/shared.module';
import { MatDatepickerModule } from '@angular/material';

@NgModule({
    declarations: [
        SubscribersRoutingModule.components,
    ],
    imports: [
        SubscribersRoutingModule,
        CommonModule,
        SharedModule,
        MatDatepickerModule
    ],
    providers: [
        SubscribesPostsService,
        DatePipe
    ]
})
export class SubscribesPostsModule { }
