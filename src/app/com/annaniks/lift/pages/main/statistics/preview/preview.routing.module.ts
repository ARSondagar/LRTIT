import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TariffResolveService } from '../../../../shared/services/tariff-resolve-service';

import { PreviewComponent } from './preview.component';

const previewRoutes: Routes = [
    {
      path: '',
      component: PreviewComponent,
      resolve: { data: TariffResolveService },
      pathMatch: 'full'
    },
]

@NgModule({
    imports: [RouterModule.forChild(previewRoutes)],
    exports: [RouterModule]
})
export class PreviewRoutingModule {
    static components = [PreviewComponent]
}
