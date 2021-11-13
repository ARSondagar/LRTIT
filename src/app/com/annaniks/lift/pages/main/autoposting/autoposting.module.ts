
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Our Modules
import { AutopostingRoutingModule } from './autoposting.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TabViewModule} from 'primeng/tabview';

//modal
import { PopUpModal } from '../../../core/modals';
import { MatSelectModule } from '@angular/material';
import {LayoutModule} from '../../../layout/layout-module';


@NgModule({
    declarations: [
        AutopostingRoutingModule.components,
        PopUpModal,
    ],
  imports: [
    CommonModule,
    TabViewModule,
    MatSelectModule,
    AutopostingRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule
  ],
    providers: [],
    entryComponents: [PopUpModal],
    exports: []
})
export class AutopostingModule {
}
