

// Angular Core Modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Our Components
import {
  SignUpComponent,
  LoginComponent,
  ForgetPasswordComponent,
  AuthComponent
} from './components/index';
import {ActivateComponent} from './components/activate/activate.component';
import {NewPassComponent} from './components/new-password/new-password.component';
import { AddInstagramComponent } from './components/add-instagram/add-instagram.component';
import { CommonModule } from '@angular/common';
// import { AccountVerificationModal } from '../../core/modals'; // TODO:


const authRoutes: Routes = [
  { path: '', component: AuthComponent,
    children: [
      { path: 'signup', component: SignUpComponent },
      { path: 'login', component: LoginComponent },
      { path: 'remember-password-confirm', component: NewPassComponent },
      { path: 'activate', component: ActivateComponent },
      { path: 'recover', component: ForgetPasswordComponent },
      { path: 'add-instagram-account', component: AddInstagramComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]},
  ];

@NgModule({
  imports: [
    RouterModule.forChild(authRoutes),
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [RouterModule],
  declarations: [
//    AccountVerificationModal, //  TODO:
    AddInstagramComponent
  ],
  entryComponents: [
//    AccountVerificationModal  //  TODO:
  ]
})
export class AuthRoutingModule {
  static components = [
    SignUpComponent,
    LoginComponent,
    AuthComponent,
    ActivateComponent,
    NewPassComponent,
    ForgetPasswordComponent
  ]
}
