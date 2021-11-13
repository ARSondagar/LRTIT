import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnsubscribeComponent } from './unsubscribe.component';

const unsubscribeRoutes: Routes = [
    { path: '', component: UnsubscribeComponent }
]

@NgModule({
    imports: [RouterModule.forChild(unsubscribeRoutes)],
    exports: [RouterModule]
})
export class UnsubscribeRoutingModule { }