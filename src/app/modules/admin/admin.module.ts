import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { InboxComponent } from './inbox/inbox.component';
import { TemplatesComponent } from './templates/templates.component';
import { MarketingComponent } from './marketing/marketing.component';
import { WebsiteComponent } from './website/website.component';
import { SettingComponent } from './setting/setting.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { EmptyTableComponent } from './empty-table/emplty-table.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatDialogModule } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

import { ClickOutsideDirective } from './marketing/click-outside.directive';
import { RouterModule } from '@angular/router';
import { UserDetailPopupComponent } from './users/user-detail-popup/user-detail-popup.component';
import { GalleryTabComponent } from './tabs/gallery-tab/gallery-tab.component';
import { TransfersTabComponent } from './tabs/transfers-tab/transfers-tab.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { PerformanceTabComponent } from './tabs/performance-tab/performance-tab.component';
import { FavoritesTabComponent } from './tabs/favorites-tab/favorites-tab.component';
import { PurchaseTabComponent } from './tabs/purchase-tab/purchase-tab.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CoupenPopupComponent } from './website/coupon-popup/coupon-popup.component';
import { AdvertisingPopupComponent } from './website/advertising-popup/advertising-popup.component';
import { NgxEditorModule  } from 'ngx-editor';
import { ChatTabComponent } from './tabs/chat-tab/chat-tab.component';
import { TeamMemberDetailComponent } from './setting/teamMember/teamMember.detail.component';
import { InboxPopupComponent } from './inbox/inbox-popup/inbox-popup.component';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatTableModule} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TemplatePopupComponent } from './templates/template-popup/template-popup.component';
import { BlogPopupComponent } from './website/blog/blog-popup/blog-popup.component';
import { MarketingPopupComponent } from './marketing/marketing-popup/marketing-popup.component';
import { FilterPopupComponrnt } from './filter-popup/filter-popup.component';
import { MessagePopupComponent } from './message-popup/message-popup.component';
import { ScoutDetailComponent } from './scout-detail/scout-detail.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { ProfileTabComponent } from './tabs/profile-tab/profile-tab.component';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { PortfolioTabComponent } from './tabs/portfolio-tab/portfolio-tab.component';
import { ScoutProfileTabComponent } from './tabs/scout-profile-tab/scout-profile-tab.component';
import { HistoryTabComponent } from './tabs/history-tab/history-tab.component';
import { ScoutPlayerViewPopupComponent } from './tabs/scout-player-view-popup/scout-player-view-popup.component';
import { ClubProfileTabComponent } from './tabs/club-profile-tab/club-profile-tab.component';
import { TeamsTabComponent } from './tabs/teams-tab/teams-tab.component';
import { SightingTabComponent } from './tabs/sighting-tab/sighting-tab.component';
import { CreateSightPopupComponent } from './tabs/create-sight-popup/create-sight-popup.component';
import { InviteTalentPopupComponent } from './tabs/invite-talent-popup/invite-talent-popup.component';
import { WebPagesComponent } from './website/web-pages/web-pages.component';
import { BlogComponent } from './website/blog/blog.component';
import { CouponsComponent } from './website/coupons/coupons.component';
import { AdvertisingComponent } from './website/advertising/advertising.component';
import { LoaderComponent } from './loader/loader.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ProfileComponent } from './setting/profile/profile.component';
import { ActivityLogComponent } from './setting/activity-log/activity-log.component';
import { TeamMembersComponent } from './setting/team-members/team-members.component';
import { UserEditPopupComponent } from './user-edit-popup/user-edit-popup.component';
import { AddRepresentatorPopupComponent } from './add-representator-popup/add-representator-popup.component';
import { CommonFilterPopupComponent } from './common-filter-popup/common-filter-popup.component';
import { UploadAttachmentComponent } from './tabs/upload-attachment/upload-attachment.component';
import { NgxDatepickerModule } from '@handylib/ngx-datepicker';
import { InviteScoutTalentPopupComponent } from './tabs/invite-scout-talent-popup/invite-scout-talent-popup.component';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { AddPageComponent } from './website/web-pages/add-page/add-page.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { BrowserModule } from '@angular/platform-browser';
import { AddHomePageComponent } from './website/web-pages/add-home-page/add-home-page.component';
import { AddContactPageComponent } from './website/web-pages/add-contact-page/add-contact-page.component';
import { AddAboutPageComponent } from './website/web-pages/add-about-page/add-about-page.component';
import { AddContentPageComponent } from './website/web-pages/add-content-page/add-content-page.component';
import { AddTalentPageComponent } from './website/web-pages/add-talent-page/add-talent-page.component';
import { AddNewsPageComponent } from './website/web-pages/add-news-page/add-news-page.component';
import { AddClubnScoutPageComponent } from './website/web-pages/add-clubnscout-page/add-clubnscout-page.component';
import { AddFaqPageComponent } from './website/web-pages/add-faq-page/add-faq-page.component';
import { AddPricingPageComponent } from './website/web-pages/add-pricing-page/add-pricing-page.component';
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
  declarations: [
    IndexComponent,
    DashboardComponent,
    UsersComponent,
    InboxComponent,
    TemplatesComponent,
    MarketingComponent,
    WebsiteComponent,
    SettingComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    EmptyTableComponent,
    PlayerDetailComponent,
    ClickOutsideDirective,
    UserDetailPopupComponent,
    GalleryTabComponent,
    TransfersTabComponent,
    FavoritesTabComponent,
    PurchaseTabComponent,
    PerformanceTabComponent,
    CoupenPopupComponent,
    AdvertisingPopupComponent,
    ChatTabComponent,
    TeamMemberDetailComponent,
    InboxPopupComponent,
    MarketingPopupComponent,
    TemplatePopupComponent,
    BlogPopupComponent,
    FilterPopupComponrnt,
    MessagePopupComponent,
    ScoutDetailComponent,
    ClubDetailComponent,
    ProfileTabComponent,
    UploadPopupComponent,
    PortfolioTabComponent,
    ScoutProfileTabComponent,
    HistoryTabComponent,
    ScoutPlayerViewPopupComponent,
    ClubProfileTabComponent,
    TeamsTabComponent,
    SightingTabComponent,
    CreateSightPopupComponent,
    InviteTalentPopupComponent,
    WebPagesComponent,
    BlogComponent,
    CouponsComponent,
    AdvertisingComponent,
    LoaderComponent,
    ProfileComponent,
    ActivityLogComponent,
    TeamMembersComponent,
    UserEditPopupComponent,
    AddRepresentatorPopupComponent,
    CommonFilterPopupComponent,
    UploadAttachmentComponent,
    InviteScoutTalentPopupComponent,
    AddPageComponent,
    AddHomePageComponent,
    AddContactPageComponent,
    AddAboutPageComponent,
    AddContentPageComponent,
    AddTalentPageComponent,
    AddNewsPageComponent,
    AddClubnScoutPageComponent,
    AddFaqPageComponent,
    AddPricingPageComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
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
    NgxDatepickerModule,
    CKEditorModule
  ],
  providers: [
    UserService,
    provideMomentDateAdapter(MY_FORMATS)
  ]
})
export class AdminModule { }
