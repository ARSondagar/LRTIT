import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArcticleDetailsComponent } from './article-details.component';

const arcticleDetailsRoutes: Routes = [
    { path: '', component: ArcticleDetailsComponent }
]

@NgModule({
    imports: [RouterModule.forChild(arcticleDetailsRoutes)],
    exports: [RouterModule]
})
export class ArcticleDetailsRoutingModule { }