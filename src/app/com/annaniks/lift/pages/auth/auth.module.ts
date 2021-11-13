import { SwitchUserEffect } from './store/effects/switchUser.effect';
import { LoginEffect } from './store/effects/login.effect';
import { RegisterEffect } from './store/effects/register.effect';
import { GetCurrentUserEffect } from './store/effects/getCurrentUser.effect';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AuthRoutingModule } from './auth.routing.module';
import { AuthService } from './auth.service';
import { reducers } from './store/reducers';
import {SharedModule} from '../../shared/shared.module';
// import { AccountConnectionModalComponent } from '../../core/modals';

@NgModule({
  imports: [
    AuthRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature('auth', reducers),
    EffectsModule.forFeature([
      RegisterEffect,
      LoginEffect,
      SwitchUserEffect,
      GetCurrentUserEffect
    ]),
    SharedModule,
  ],
  declarations: [
    AuthRoutingModule.components
  ],
  providers: [AuthService]
})
export class AuthModule { }
