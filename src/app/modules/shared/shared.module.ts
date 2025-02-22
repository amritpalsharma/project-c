import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { GalleryComponent } from './view-profile/tabs/gallery/gallery.component';
import { GeneralDetailsComponent } from './view-profile/tabs/general-details/general-details.component';
import { PerformanceDetailsComponent } from './view-profile/tabs/performance-details/performance-details.component';
import { PerformanceReportComponent } from './view-profile/tabs/performance-report/performance-report.component';
import { TransferDetailsComponent } from './view-profile/tabs/transfer-details/transfer-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxEditorModule } from 'ngx-editor';
import { MessagePopupComponent } from './message-popup/message-popup.component';
import { IndexComponent } from './index/index.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { CouponCodeAlertComponent } from './coupon-code-alert/coupon-code-alert.component';
import { HeaderComponent } from './header/header.component';
import { ChatComponent } from './chat/chat.component';
import { ChatPopupComponent } from './chat/chat-popup/chat-popup.component';
import { CountriesComponent } from './countries/countries.component';
import { AddCountryComponent } from './countries/add-country/add-country.component';
import { EditPlanComponent } from './edit-plan/edit-plan.component';
import { UpdateConfirmationPlanComponent } from './update-confirmation-plan/update-confirmation-plan.component';
import { ViewMembershipPopupComponent } from './view-membership-popup/view-membership-popup.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingComponent } from './setting/setting.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ExploreComponent } from './explore/explore.component';
import { ActivityLogComponent } from './setting/activity-log/activity-log.component';
import { AppSettingComponent } from './setting/app-setting/app-setting.component';
import { CommonFilterPopupComponent } from './common-filter-popup/common-filter-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    SuccessComponent,
    CancelComponent,
    ViewProfileComponent,
    GalleryComponent,
    GeneralDetailsComponent,
    PerformanceDetailsComponent,
    PerformanceReportComponent,
    TransferDetailsComponent,
    MessagePopupComponent,
    IndexComponent,
    SidebarComponent,
    FooterComponent,
    CouponCodeAlertComponent,
    HeaderComponent,
    ChatComponent,
    CountriesComponent,
    ChatPopupComponent,
    AddCountryComponent,
    EditPlanComponent,
    UpdateConfirmationPlanComponent,
    ViewMembershipPopupComponent,
    PlayerProfileComponent,
    ResetPasswordComponent,
    SettingComponent,
    ActivityLogComponent,
    AppSettingComponent,
    FavoritesComponent,
    ExploreComponent,
    CommonFilterPopupComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    TranslateModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    RouterModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginator,
    NgxEditorModule,
    MatTooltipModule 
  ],
  exports:[
    SuccessComponent,
    CancelComponent,
    ViewProfileComponent,
    GalleryComponent,
    GeneralDetailsComponent,
    PerformanceDetailsComponent,
    PerformanceReportComponent,
    TransferDetailsComponent,
    MessagePopupComponent,
    IndexComponent,
    SidebarComponent,
    FooterComponent,
    CouponCodeAlertComponent,
    HeaderComponent,
  ]
})
export class SharedModule { }
