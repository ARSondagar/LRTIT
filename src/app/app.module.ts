import { AuthModule } from './com/annaniks/lift/pages/auth/auth.module';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { GestureConfig } from '@angular/material';

import { NgModule, Injector, LOCALE_ID } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { ru_RU } from 'ng-zorro-antd/i18n';
import { CookieModule } from 'ngx-cookie';
import { ApiInterceptor } from './com/annaniks/lift/core/interceptors/api.interceptor';
import { AuthGuard } from './com/annaniks/lift/core/guards/auth.guard';
import { JwtInterceptor } from './com/annaniks/lift/core/interceptors/jwt.interceptor';
import { LoadingService } from './com/annaniks/lift/core/services/loading-service';
import { LoadingComponent } from './com/annaniks/lift/layout/loading/loading.component';
import { ToastrModule } from 'ngx-toastr';
import { AppService } from './app.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@angular/common';

import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { StoreRouterConnectingModule } from '@ngrx/router-store'
import { EffectsModule } from '@ngrx/effects';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LayoutModule } from './com/annaniks/lift/layout/layout-module';
import { MainService } from './com/annaniks/lift/pages/main/main.service';

import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AccountConnectionModalComponent, AccountVerificationModal } from './com/annaniks/lift/core/modals';

registerLocaleData(localeRu);
@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    AccountVerificationModal,
    AccountConnectionModalComponent
  ],
  entryComponents: [
    AccountVerificationModal,
    AccountConnectionModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([]),
    // TODO: Fix authmodule, need replace Auth Store to AppStateModule or something
    AuthModule,
    BrowserAnimationsModule,
    CookieModule.forRoot(),
    ToastrModule.forRoot(),
    LayoutModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },

    AppService,
    AuthGuard,
    LoadingService,
    MainService,
    DeviceDetectorService,
    {
      provide: NZ_I18N,
      useValue: ru_RU
    },
    {
      provide: 'BASE_URL',
      useValue: environment.apiUrl,
      multi: true
    },
    {
      provide: 'FILE_URL',
      useValue: environment.fileUrl,
      multi: true
    },
    {
      provide: 'ARTICLE_FILE',
      useValue: environment.articleFilesUrl,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: "ru" },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  static injector: Injector;
  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}
