import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './com/annaniks/lift/core/guards/auth.guard';
// import { CompanyComponent } from './com/annaniks/lift/layout/company/company.component';
// import { ContactsComponent } from './com/annaniks/lift/layout/contacts/contacts.component';


const appRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./com/annaniks/lift/pages/main/main.module')    // +g.b.
      .then(m => m.MainModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./com/annaniks/lift/pages/auth/auth.module')
      .then(m => m.AuthModule)
  },
  {
    path: 'not-found',
    loadChildren: () => import('./com/annaniks/lift/pages/not-found/not-found.module')
      .then(m => m.NotFoundModule)
  },
  {
    path: 'join/:referalCode',
    loadChildren: () => import('./com/annaniks/lift/pages/join/join.module')
      .then((m) => m.JoinModule)
  },
  // {
  //   path: 'company',
  //   component: CompanyComponent
  // },
  // {
  //   path: 'contacts',
  //   component: ContactsComponent
  // },

];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
