import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TariffResolveService } from '../../../shared/services/tariff-resolve-service';
import { TariffNewComponent } from './tariff-new/tariff-new.component';
import { TariffComponent } from './tariff.component';

const tariffRoutes: Routes = [
    { path: 'tarif_old', component: TariffComponent },
    {
       path: 'tarif_new',
       component: TariffNewComponent,
       resolve: { data: TariffResolveService }
    },
    { path: '', redirectTo: 'tarif_new', pathMatch: 'full' },
]

@NgModule({
    imports: [RouterModule.forChild(tariffRoutes)],
    exports: [RouterModule]
})

export class TariffRoutingModule {

}
