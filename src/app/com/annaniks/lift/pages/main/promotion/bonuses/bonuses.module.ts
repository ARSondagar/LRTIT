
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Our Modules
import { BonusesRoutingModule } from './bonuses.routing.module';
import { BonusesService } from './bonuses.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
    declarations: [
        BonusesRoutingModule.components,
    ],
    imports: [
        BonusesRoutingModule,
        CommonModule,
        MatCheckboxModule,
        SharedModule
    ],
    providers: [
        BonusesService
    ]
})
export class BonusesModule {
}
