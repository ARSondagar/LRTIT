import { InstagramAccountChangeModal } from './../../core/modals/instagram-account-change/instagram-account-change.modal';
import { AccountVerificationModal } from './../../core/modals/account-verification/account-verification.modal';
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Our Modules
import { MainRoutingModule } from './main.routing.module';
import { LayoutModule } from '../../layout/layout-module';
// import { AccountConnectionModalComponent } from '../../core/modals';
import { SharedModule } from '../../shared/shared.module';
// import { MainService } from './main.service';
import { AutoSubscribeOrWatchStoryService } from '../../shared/services/auto-subscribe-watch-story.service';
import { AutoPostingService } from './autoposting/autoposting.service';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { RestrictionGuard } from 'src/app/restriction.service';


@NgModule({
    declarations: [
        MainRoutingModule.components,
//        AccountConnectionModalComponent,
//        AccountVerificationModal,
        InstagramAccountChangeModal
    ],
    imports: [
        MainRoutingModule,
        SharedModule,
        CommonModule,
        LayoutModule,
        MatDialogModule,
    ],
    entryComponents: [
//        AccountConnectionModalComponent,
        InstagramAccountChangeModal,
//        AccountVerificationModal
    ],
    providers: [
//      MainService,
      AutoSubscribeOrWatchStoryService,
      AutoPostingService,
      DatePipe,
      RestrictionGuard,
      { provide: MatDialogRef, useValue: {} },
      { provide: MAT_DIALOG_DATA, useValue: {} }
    ],
})
export class MainModule {
}
