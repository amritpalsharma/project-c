import { NgModule, TemplateRef } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { InboxComponent } from './inbox/inbox.component';
import { TemplatesComponent } from './templates/templates.component';
import { MarketingComponent } from './marketing/marketing.component';
import { WebsiteComponent } from './website/website.component';
import { SettingComponent } from './setting/setting.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';
import { AuthGuard } from '../../services/auth.guard'; // Import the AuthGuard
import { GalleryTabComponent } from './tabs/gallery-tab/gallery-tab.component';
import { ScoutDetailComponent } from './scout-detail/scout-detail.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { PrivacyComponent } from '../website/privacy/privacy.component';
import { FaqComponent } from '../website/faq/faq.component';
import { TermsComponent } from '../website/terms/terms.component';

const routes: Routes = [
  {
    path:"",
    component: IndexComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'users', component: UsersComponent},
      { path: 'inbox', component: InboxComponent},
      { path: 'templates', component: TemplatesComponent},
      { path: 'marketing', component: MarketingComponent},
      { path: 'website', component: WebsiteComponent},
      { path: 'setting', component: SettingComponent},
      { path: 'player/:id', component: PlayerDetailComponent},
      { path: 'gallery-detail', component: GalleryTabComponent },
      { path: 'scout/:id', component: ScoutDetailComponent },
      { path: 'club/:id', component: ClubDetailComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'terms', component: TermsComponent },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
