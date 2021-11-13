import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchedulerComponent } from './scheduler.component';

const schedulerRoutes: Routes = [
    { path: '',
      component: SchedulerComponent,
    }
]

@NgModule({
    imports: [RouterModule.forChild(schedulerRoutes)],
    exports: [RouterModule],
})
export class SchedulerRoutingModule { }
