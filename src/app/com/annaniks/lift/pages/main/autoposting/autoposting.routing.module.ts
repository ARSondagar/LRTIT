import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Our Components
import { AutopostingComponent } from './autoposting.component';

const autopostingRoutes: Routes = [
    { path: '', component: AutopostingComponent }
]

@NgModule({
    imports: [RouterModule.forChild(autopostingRoutes)],
    exports: [RouterModule]
})
export class AutopostingRoutingModule {
    static components = [AutopostingComponent]
}