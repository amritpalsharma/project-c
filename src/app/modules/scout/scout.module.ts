import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoutRoutingModule } from './scout-routing.module';
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
import { GalleryTabComponent } from './tabs/gallery-tab/gallery-tab.component';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { EditPersonalDetailsComponent } from './edit-personal-details/edit-personal-details.component';
import { MessagePopupComponent } from './message-popup/message-popup.component';
import { MembershipComponent } from './membership/membership.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ViewMembershipPopupComponent } from './view-membership-popup/view-membership-popup.component';
import { PaymentsPopupComponent } from './payments-popup/payments-popup.component';
import { EditMembershipProfileComponent } from './edit-membership-profile/edit-membership-profile.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EditGeneralDetailsComponent } from './edit-general-details/edit-general-details.component';
import { DeletePopupComponent } from './delete-popup/delete-popup.component';
import { EditHighlightsComponent } from './tabs/edit-highlights/edit-highlights.component';
import { PlanComponent } from './plan/plan.component';
import { AddCardComponent } from './membership/add-card/add-card.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HistoryTabComponent } from './tabs/history-tab/history-tab.component';
import { LoaderComponent } from './loader/loader.component';
import { PortfolioTabComponent } from './tabs/portfolio-tab/portfolio-tab.component';
import { AddNewTalentComponent } from './tabs/portfolio-tab/add-new-talent/add-new-talent.component';
import { EditNewTalentComponent } from './tabs/portfolio-tab/edit-new-talent/edit-new-talent.component';
import { LightboxModule } from 'ngx-lightbox';
import { GuidedTourModule } from 'ngx-guided-tour';
import { SharedModule } from '../shared/shared.module';
import { CancelCountryPlanComponent } from './membership/cancel-country-plan/cancel-country-plan.component';
import { AddBoosterComponent } from './plan/add-booster-profile/add-booster.component';
import { AddRepresentatorPopupComponent } from './add-representator-popup/add-representator-popup.component';
import { InviteScoutTalentPopupComponent } from './invite-scout-talent-popup/invite-scout-talent-popup.component';
// import { NgxStripeModule } from 'ngx-stripe';

@NgModule({
  declarations: [
    IndexComponent,
    DashboardComponent,
    SidebarComponent,
    ProfileTabComponent,
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
    MessagePopupComponent,
    AddCardComponent,
    HistoryTabComponent,
    LoaderComponent,
    PortfolioTabComponent,
    AddNewTalentComponent,
    CancelCountryPlanComponent,
    EditNewTalentComponent,
    AddBoosterComponent,
    FooterComponent,
    AddRepresentatorPopupComponent,
    InviteScoutTalentPopupComponent,
    ProfileTabComponent
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
    SharedModule
    // NgxStripeModule.forRoot('pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a')
  ]
})

export class ScoutModule { }
