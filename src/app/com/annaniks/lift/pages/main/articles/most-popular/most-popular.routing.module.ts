import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MostPopularComponent } from './most-popular.component';

const mostPopularRoutes: Routes = [
    { path: '', component: MostPopularComponent }
]

@NgModule({
    imports: [RouterModule.forChild(mostPopularRoutes)],
    exports: [RouterModule]
})
export class MostPopularRoutingModule {
    static components = [MostPopularComponent]
}