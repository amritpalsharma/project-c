import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TalentRoutingModule } from './talent-routing.module';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
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
import { NgxEditorModule } from 'ngx-editor';
import { ProfileTabComponent } from './tabs/profile-tab/profile-tab.component';
import { PerformanceTabComponent } from './tabs/performance-tab/performance-tab.component';
import { TransfersTabComponent } from './tabs/transfers-tab/transfers-tab.component';
import { GalleryTabComponent } from './tabs/gallery-tab/gallery-tab.component';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { EditPersonalDetailsComponent } from './edit-personal-details/edit-personal-details.component';
import { MessagePopupComponent } from './message-popup/message-popup.component';
import { MembershipComponent } from './membership/membership.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
import { PerformanceAnalysisTabComponent } from './tabs/performance-analysis-tab/performance-analysis-tab.component';
import { ViewMembershipPopupComponent } from './view-membership-popup/view-membership-popup.component';
import { PaymentsPopupComponent } from './payments-popup/payments-popup.component';
import { EditGeneralDetailsComponent } from './edit-general-details/edit-general-details.component';
import { EditPerformanceDetailsComponent } from './edit-performance-details/edit-performance-details.component';
import { AddPerformanceComponent } from './tabs/performance-tab/add-performance/add-performance.component';
import { DeletePopupComponent } from './delete-popup/delete-popup.component';
import { EditTransferDetailsComponent } from './edit-transfer-details/edit-transfer-details.component';
import { AddTransferComponent } from './tabs/transfers-tab/add-transfer/add-transfer.component';
import { AddPerfomanceReportComponent } from './tabs/performance-analysis-tab/add-perfomance-report/add-perfomance-report.component';
import { EditHighlightsComponent } from './tabs/edit-highlights/edit-highlights.component';
import { PlanComponent } from './plan/plan.component';
import { AddCardComponent } from './membership/add-card/add-card.component';
import { UpdateCountryPlanComponent } from './update-country-plan/update-country-plan.component';
import { CancelCountryPlanComponent } from './membership/cancel-country-plan/cancel-country-plan.component';
import { AddBoosterComponent } from './plan/add-booster-profile/add-booster.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { EditMembershipProfileComponent } from './edit-membership-profile/edit-membership-profile.component';
import {GuidedTourModule, GuidedTourService} from 'ngx-guided-tour';
import { LightboxModule } from 'ngx-lightbox';
import { SharedModule } from '../shared/shared.module';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY', // Parse input in DD.MM.YYYY format
  },
  display: {
    dateInput: 'DD.MM.YYYY', // Display format for date input
    monthYearLabel: 'MMM YYYY', // Month and year label
    dateA11yLabel: 'DD.MM.YYYY', // Accessibility label for date
    monthYearA11yLabel: 'MMMM YYYY', // Accessibility label for month and year
  },
};

@NgModule({
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
    GuidedTourService
  ],
  declarations: [
    IndexComponent,
    DashboardComponent,
    SidebarComponent,
    FooterComponent,
    ProfileTabComponent,
    PerformanceTabComponent,
    TransfersTabComponent,
    GalleryTabComponent,
    UploadPopupComponent,
    EditPersonalDetailsComponent,
    MessagePopupComponent,
    MembershipComponent,
    PlayerProfileComponent,
    PerformanceAnalysisTabComponent,
    ViewMembershipPopupComponent,
    PaymentsPopupComponent,
    EditMembershipProfileComponent,
    EditGeneralDetailsComponent,
    EditPerformanceDetailsComponent,
    AddPerformanceComponent,
    DeletePopupComponent,
    EditTransferDetailsComponent,
    AddTransferComponent,
    AddPerfomanceReportComponent,
    EditHighlightsComponent,
    PlanComponent,
    AddCardComponent,
    UpdateCountryPlanComponent,
    CancelCountryPlanComponent,
    AddBoosterComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule ,
    TalentRoutingModule,  // This includes RouterModule
    MatPaginator,    
    TranslateModule ,
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
    MatTableModule,
    MatPaginator,
    NgxEditorModule,
    MatTooltipModule,
    LightboxModule,
    GuidedTourModule,
    SharedModule
  ]
})

export class TalentModule { }
