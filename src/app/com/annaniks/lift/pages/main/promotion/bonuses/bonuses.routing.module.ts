import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BonusesComponent } from './bonuses.component';
import { BonusesFromLiftItemComponent } from './bonuses-from-lift-item/bonuses-from-lift-item.component';

const bonusesRoutes: Routes = [
    { path: '', component: BonusesComponent }
]

@NgModule({
    imports: [RouterModule.forChild(bonusesRoutes)],
    exports: [RouterModule]
})
export class BonusesRoutingModule {
    static components = [BonusesComponent, BonusesFromLiftItemComponent]
}