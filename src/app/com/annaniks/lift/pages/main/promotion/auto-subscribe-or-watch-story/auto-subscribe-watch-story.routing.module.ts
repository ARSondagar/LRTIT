// Angular Core Modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Our Components
import { AutoSubscribeOrWatchStoryComponent } from './auto-subscribe-watch-story.component';
import {
    SubscriptionOrStorySuitableComponent,
    AfterSubscriptionComponent
} from './index';

const autoSubscribeOrWatchStoryRoutes: Routes = [
    { path: '', component: AutoSubscribeOrWatchStoryComponent }
]

@NgModule({
    imports: [RouterModule.forChild(autoSubscribeOrWatchStoryRoutes)],
    exports: [RouterModule]
})
export class AutoSubscribeOrWatchStoryRoutingModule {
    static components = [
        AutoSubscribeOrWatchStoryComponent,
        SubscriptionOrStorySuitableComponent,
        AfterSubscriptionComponent
    ]
}