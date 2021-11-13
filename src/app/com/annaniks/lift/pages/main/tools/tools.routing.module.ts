import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';

const toolsRoutes: Routes = [
    {
        path: '', component: ToolsComponent, children: [
            { path: '', redirectTo: '/tools/scheduler', pathMatch: 'full' },
            {
                path: 'scheduler',
                loadChildren: () => import('./scheduler/scheduler.module').then(m => m.SchedulerModule)
            },
            {
                path: 'direct',
                loadChildren: () => import('./direct/direct.module').then(m => m.DirectModule)
            },
            {
                path: 'unsubscribe',
                loadChildren: () => import('./unsubscribe/unsubscribe.module').then(m => m.UnsubscribeModule)
            },
            {
                path: 'lists',
                loadChildren: () => import('./lists/lists.module').then(m => m.ListModule)
            }
        ]
    }
]


@NgModule({
    imports: [RouterModule.forChild(toolsRoutes)],
    exports: [RouterModule]
})

export class ToolsRoutingModule { }