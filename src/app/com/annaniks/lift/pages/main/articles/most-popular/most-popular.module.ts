// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Our Modules
import { SharedModule } from '../../../../shared/shared.module';
import { MostPopularRoutingModule } from './most-popular.routing.module';


@NgModule({
    declarations: [
        MostPopularRoutingModule.components
    ],
    imports: [
        MostPopularRoutingModule,
        CommonModule,
        SharedModule
    ],
})
export class MostPopularModule { }
