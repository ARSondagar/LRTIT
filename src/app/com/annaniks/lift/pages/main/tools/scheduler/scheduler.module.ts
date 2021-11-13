// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulerRoutingModule } from './scheduler.routing.module';
// 3rd part libraries
import { SharedModule } from '../../../../shared/shared.module';

import { SchedulerService } from './scheduler.service';
import { SchedulerComponent } from './scheduler.component';
import { EventsSchedulerComponent } from './events-scheduler/events-scheduler.component';
import { SchedulerDetailsComponent } from './scheduler-details/scheduler-details.component';
import { DialogService } from './dialog.service';
import { SchedulerByListComponent } from './scheduler-by-list/scheduler-by-list.component';
import { SchedulerByLocationComponent } from './scheduler-by-location/scheduler-by-location.component';
import { SchedulerBySubscribersComponent } from './scheduler-by-subscribers/scheduler-by-subscribers.component';
import { SchedulerByHashtagsComponent } from './scheduler-by-hashtags/scheduler-by-hashtags.component';
import { FollowersDetailsComponent } from './followers-details/followers-details.component';

import { MatCard, MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [
        SchedulerComponent,
        EventsSchedulerComponent,
        SchedulerDetailsComponent,
        SchedulerByListComponent,
        SchedulerByLocationComponent,
        SchedulerBySubscribersComponent,
        SchedulerByHashtagsComponent,
        FollowersDetailsComponent
    ],
    imports: [
        SchedulerRoutingModule,
        CommonModule,
        SharedModule,
        MatCardModule
    ],
    entryComponents: [
      EventsSchedulerComponent,
      SchedulerDetailsComponent,
      FollowersDetailsComponent
    ],
    providers: [
        SchedulerService,
        DialogService
    ]
})
export class SchedulerModule { }
