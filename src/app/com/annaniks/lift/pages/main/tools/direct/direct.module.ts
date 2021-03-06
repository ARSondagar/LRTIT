// Angular Core Modules
import { NgModule } from '@angular/core';
import { DirectRoutingModule } from './direct.routing.module';
import { CommonModule } from '@angular/common';
// 3rd part libraries
import { MessagingService } from './messaging.service';
import { DirectScheduleComponent, DirectSentComponent } from './components';
import { CheckboxModule } from 'primeng/checkbox';
import { DirectService } from './direct.service';
import { SendMessageComponent } from './components/send-message/send-message.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AutoSubscribeOrWatchStoryService } from '../../../../shared/services/auto-subscribe-watch-story.service';


@NgModule({
    declarations: [
        DirectRoutingModule.components,
        DirectScheduleComponent,
        DirectSentComponent,
        SendMessageComponent
    ],
    imports: [
        DirectRoutingModule,
        CommonModule,
        SharedModule,
        CheckboxModule
    ],
    providers: [
        MessagingService,
        DirectService,
        AutoSubscribeOrWatchStoryService
    ]
})
export class DirectModule { }