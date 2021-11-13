// Angular Core Modules
import { NgModule } from '@angular/core';

// Components
import {
    HeaderComponent,
    HeaderUserComponent,
    HeaderNotificationComponent,
    HeaderSwitchAccountComponent,
    SubmenuComponent
} from './';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';


@NgModule({
    declarations: [
        HeaderComponent,
        HeaderUserComponent,
        HeaderNotificationComponent,
        HeaderSwitchAccountComponent,
        SubmenuComponent,
        FooterComponent,
    ],
  exports: [
    HeaderComponent,
    SubmenuComponent,
    FooterComponent,
    HeaderNotificationComponent,
  ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule
    ]
})
export class LayoutModule { }
