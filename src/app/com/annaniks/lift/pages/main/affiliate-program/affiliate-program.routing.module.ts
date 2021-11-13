import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliateProgramComponent } from './affiliate-program.component';

const affiliateProgramRoutes: Routes = [
    { path: '', component: AffiliateProgramComponent }
]

@NgModule({
    imports: [RouterModule.forChild(affiliateProgramRoutes)],
    exports: [RouterModule]
})
export class AffiliateProgramRoutingModule { }