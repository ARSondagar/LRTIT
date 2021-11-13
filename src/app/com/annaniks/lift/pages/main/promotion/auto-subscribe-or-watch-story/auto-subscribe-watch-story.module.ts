import { OptionsStore } from './services/options.service';

// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Our Modules
import { AutoSubscribeOrWatchStoryRoutingModule } from './auto-subscribe-watch-story.routing.module';
import { AutoSubscribeOrWatchStoryService } from '../../../../shared/services/auto-subscribe-watch-story.service';

import { SubscribeWatchConditionComponent } from './subscribe-watch-condition/subscribe-watch-condition.component';
import { AddHashtagComponent } from './add-hashtag/add-hashtag.component';
import { AccountSearchComponent } from './account-search/account-search.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AccountByLocationComponent } from './account-by-location/account-by-location.component';
import { SubscribeParametresComponent } from './subscribe-parametres/subscribe-parametres.component';
// Installed Modules
import { ToastrModule } from 'ngx-toastr';
import { SchedulerService } from '../../tools/scheduler/scheduler.service';

@NgModule({
    declarations: [
        AutoSubscribeOrWatchStoryRoutingModule.components,
        SubscribeWatchConditionComponent,
        AddHashtagComponent,
        AccountSearchComponent,
        AccountByLocationComponent,
        SubscribeParametresComponent,
    ],
    imports: [
        AutoSubscribeOrWatchStoryRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        ToastrModule
    ],
    providers: [
      SchedulerService,
      OptionsStore
    ]
})
export class AutoSubscribeOrWatchStoryModule {
}
