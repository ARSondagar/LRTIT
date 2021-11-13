import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { BasicSettingsComponent } from './components/basic-settings/basic-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdditionalSettings } from './components/additional-settings/additional-settings.component';
import { PersonalSettings } from './components/personal-settings/personal-settings.component';
import { NotificationModal } from './components/notification-modal/notification.modal';
import { MatRadioModule } from '@angular/material/radio';
import { ProfileService } from './profile.service';
import {
} from '../../../core/modals';

@NgModule({
    declarations: [
        ProfileComponent,
        BasicSettingsComponent,
        AdditionalSettings,
        PersonalSettings,
        NotificationModal,
    ],
    imports: [
        ProfileRoutingModule,
        SharedModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatRadioModule,
    ],
    entryComponents: [
        NotificationModal,
    ],
    providers: [ProfileService]
})
export class ProfileModule { }
