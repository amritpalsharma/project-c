import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoutRoutingModule } from './club-routing.module';
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
import { RouterModule, RouterOutlet } from '@angular/router';
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
import { EditMembershipProfileComponent } from './edit-membership-profile/edit-membership-profile.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';
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
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LightboxDialogComponent } from './lightbox-dialog/lightbox-dialog.component';
import { LoaderComponent } from './loader/loader.component';
import { AddBoosterComponent } from './plan/add-booster-profile/add-booster.component';
import { UpdateCountryPlanComponent } from './update-country-plan/update-country-plan.component';
import { CancelCountryPlanComponent } from './membership/cancel-country-plan/cancel-country-plan.component';
import { UpdateConfirmationPlanComponent } from './membership/update-confirmation-plan/update-confirmation-plan.component';
import { LightboxModule } from 'ngx-lightbox';
import { GuidedTourModule } from 'ngx-guided-tour';
import { SharedModule } from '../shared/shared.module';
import { HistoryTabComponent } from './tabs/history-tab/history-tab.component';
import { PortfolioTabComponent } from './tabs/portfolio-tab/portfolio-tab.component';
import { AddRepresentatorPopupComponent } from './add-representator-popup/add-representator-popup.component';
import { TeamsTabComponent } from './tabs/teams-tab/teams-tab.component';
import { SightingTabComponent } from './tabs/sighting-tab/sighting-tab.component';
import { UploadAttachmentComponent } from './tabs/upload-attachment/upload-attachment.component';
import { InviteTalentPopupComponent } from './tabs/invite-talent-popup/invite-talent-popup.component';
import { CreateSightPopupComponent } from './tabs/create-sight-popup/create-sight-popup.component';
import { AddNewTalentComponent } from './tabs/add-new-talent/add-new-talent.component';
// import { NgxStripeModule } from 'ngx-stripe';

@NgModule({
  declarations: [
    IndexComponent,
    DashboardComponent,
    SidebarComponent,
    FooterComponent,
    ProfileTabComponent,
    PlayerProfileComponent,
    ViewMembershipPopupComponent,
    PlanComponent,
    EditMembershipProfileComponent,
    EditPersonalDetailsComponent,
    PaymentsPopupComponent,
    MembershipComponent,
    UploadPopupComponent,
    EditHighlightsComponent,
    DeletePopupComponent,
    EditGeneralDetailsComponent,
    GalleryTabComponent,
    PerformanceTabComponent,
    TransfersTabComponent,
    MessagePopupComponent,
    EditTransferDetailsComponent,
    AddTransferComponent,
    EditPerformanceDetailsComponent,
    AddPerformanceComponent,
    AddPerfomanceReportComponent,
    AddCardComponent,   
    PerformanceAnalysisTabComponent,
    LightboxDialogComponent,
    LoaderComponent,
    AddBoosterComponent,
    UpdateCountryPlanComponent,
    CancelCountryPlanComponent,
    UpdateConfirmationPlanComponent,
    HistoryTabComponent,
    PortfolioTabComponent,
    AddRepresentatorPopupComponent,
    TeamsTabComponent,
    SightingTabComponent,
    UploadAttachmentComponent,
    InviteTalentPopupComponent,
    CreateSightPopupComponent,
    AddNewTalentComponent
  ],
  imports: [
    CommonModule,
    ScoutRoutingModule,  // This includes RouterModule
    TranslateModule.forChild(),
    RouterModule,
    RouterOutlet,
    MatPaginator,    
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
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
    NgxEditorModule,
    MatProgressSpinnerModule,
    LightboxModule,
    GuidedTourModule,
    SharedModule,
    CommonModule,
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
    MatTabsModule ,
    MatTableModule,
    MatPaginator,
    NgxEditorModule,
    MatProgressSpinnerModule,
  ]
})

export class ScoutModule { }
