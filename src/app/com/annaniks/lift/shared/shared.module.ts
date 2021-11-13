import { EditVideoComponent } from './../pages/main/autoposting/edit-video/edit-video.component';
import { AddStoryComponent } from './../pages/main/autoposting/add-story/add-story.component';
import { AppleMapService } from './services/appleMap.service';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Our Shared Components
import { CommonModule, registerLocaleData } from '@angular/common';
import { ActionModal } from '../core/modals';
import {
  LimitsComponent,
  FooterNavigationComponent,
  LineChartComponent,
  UserDetailsComponent,
  MostPopularItemComponent,
  DatepickerComponent,
  SimpleLineChartComponent,
} from './components';

// Our Shared Directives
import { OnlyNumberDirective } from './directives';

// 3rd Part Libraries
import { ClickOutsideModule } from 'ng-click-outside';

// PrimeNG
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';

// Angular Material
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// 3rd part libraries
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import localeRu from '@angular/common/locales/ru';
import { NgxMaskModule } from 'ngx-mask';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from 'ngx-mat-datetime-picker';
import { ToastUiImageEditorModule } from 'ngx-tui-image-editor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatButtonModule, MatDatepickerModule, MatProgressSpinnerModule, MatSelectModule } from '@angular/material';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

// Forms
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AudienceFilterComponent } from '../pages/main/promotion/auto-subscribe-or-watch-story';
import { MaxHashtags } from '../core/directives/max-hashtags.directive';
import { SearchPipe } from '../core/pipes/search.pipe';
import { AddPostStoryComponent } from '../pages/main/autoposting/add-post-story/add-post-story.component';
import { EditPictureComponent } from '../pages/main/autoposting/edit-picture/edit-picture.component';
import { SearchComponent } from './components/search/search.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SelectComponent } from './components/select/select.component';
import { SelectGroupComponent } from './components/select-group/select-group.component';
import {TabViewModule} from 'primeng/tabview';
import { RocketComponent } from './components/rocket/rocket.component';
import { DecodeURIComponentPipe, TakeWordsPipe } from './pipes';
import { FaqComponent } from './components/faq/faq.component';
import { CompanyComponent } from './components/company/company.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { BalansComponent } from '../pages/main/tariff/balans/balans.component';
import { PaymentDialogComponent } from '../pages/main/tariff/payment-dialog/payment-dialog.component';
import { ServicesComponent } from '../pages/main/tariff/services/services.component';
// import { ServicesComponentOld } from '../pages/main/tariff/services/services.component.old';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
registerLocaleData(localeRu);

@NgModule({
  declarations: [
    LimitsComponent,
    FooterNavigationComponent,
    LineChartComponent,
    UserDetailsComponent,
    AudienceFilterComponent,
    OnlyNumberDirective,
    MaxHashtags,
    MostPopularItemComponent,
    SearchPipe,
    AddStoryComponent,
    AddPostStoryComponent,
    EditPictureComponent,
    EditVideoComponent,
    ActionModal,
    DatepickerComponent,
    SearchComponent,
    SelectComponent,
    SelectGroupComponent,
    RocketComponent,
    SimpleLineChartComponent,
    DecodeURIComponentPipe,
    TakeWordsPipe,
    FaqComponent,
    CompanyComponent,
    ContactsComponent,
    BalansComponent,
    PaymentDialogComponent,
    ServicesComponent,
//    ServicesComponentOld  // TODO: remove this
  ],
  imports: [
    ToastUiImageEditorModule,
    CommonModule,
    RouterModule,
    ClickOutsideModule,
    AutoCompleteModule,
    MatSliderModule,
    TabViewModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatRadioModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatInputModule,
    PickerModule,
    NgxInfiniteScrollerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgxMaskModule.forRoot(),
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    ChipsModule,
    InfiniteScrollModule,
    NzDatePickerModule,
    PerfectScrollbarModule,
  ],
  entryComponents: [
    AudienceFilterComponent,
    AddPostStoryComponent,
    AddStoryComponent,
    EditVideoComponent,
    EditPictureComponent,
    ActionModal,
//    PaymentDialogComponent
  ],
  exports: [
    EditVideoComponent,
    EditPictureComponent,
    LimitsComponent,
    ClickOutsideModule,
    FooterNavigationComponent,
    LineChartComponent,
    AutoCompleteModule,
    MatSliderModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatExpansionModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    PickerModule,
    UserDetailsComponent,
    CalendarModule,
    OnlyNumberDirective,
    NgxMaskModule,
    NgxInfiniteScrollerModule,
    MatButtonModule,
    FormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    AudienceFilterComponent,
    ToastUiImageEditorModule,
    MaxHashtags,
    ChipsModule,
    InfiniteScrollModule,
    MostPopularItemComponent,
    SearchPipe,
    AddPostStoryComponent,
    AddStoryComponent,
    ActionModal,
    NzBadgeModule,
    NzSwitchModule,
    NzDropDownModule,
    DatepickerComponent,
    SearchComponent,
    PerfectScrollbarModule,
    SelectComponent,
    SelectGroupComponent,
    RocketComponent,
    SimpleLineChartComponent,
    DecodeURIComponentPipe,
    TakeWordsPipe,
    FaqComponent,
    CompanyComponent,
    ContactsComponent,
    BalansComponent,
    PaymentDialogComponent,
    ServicesComponent,
//    ServicesComponentOld
],
  providers: [
    AppleMapService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class SharedModule {}
