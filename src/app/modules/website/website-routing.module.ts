import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ConfirmPasswordComponent } from './SetPassword/confirmPassword.component'
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { ClubComponent } from './club/club.component';
import { FeatureComponent } from './feature/feature.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';
import { PricingComponent } from './pricing/pricing.component';
import { CaComponent } from './ca/ca.component';
import { FaqComponent } from './faq/faq.component';
import { ImprintComponent } from './imprint/imprint.component';
import { CookieComponent } from './cookie/cookie.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TalentComponent } from './talent/talent.component';
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { DetailPagesComponent } from './detail-pages/detail-pages.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { ErrorComponent } from './error/error.component';
import { ThankuComponent } from './thanku/thanku.component';
import { NewChatComponent } from './new-chat/new-chat.component';
import { CookiePopupComponent } from './cookie-popup/cookie-popup.component';
import { EmailVerifyComponent } from './email-verify/email-verify.component';
import { PasswordResetLinkComponent } from './password-reset-link/password-reset-link.component';
import { HomeComponent } from './home/home.component';
import { SuccessComponent } from '../shared/success/success.component';


const routes: Routes = [
  {
    path:'', component: HomeComponent,
    children: [

      { path: '', component: IndexComponent }, // Default route
      { path: 'home', component: IndexComponent },
      { path: 'confirm-password', component: ConfirmPasswordComponent },
      // { path: 'header', component: HeaderComponent },
      { path: 'footer', component: FooterComponent },
      { path: 'about', component: AboutComponent },
      { path: 'club', component: ClubComponent },
      { path: 'feature', component: FeatureComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'news', component: NewsComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'ca', component: CaComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'cookie', component: CookieComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'talent', component: TalentComponent },
      { path: 'learn-more', component: LearnMoreComponent },
      { path: 'news/:slug', component: DetailPagesComponent },
      { path: 'player-list', component: PlayerListComponent },
      { path: 'error', component: ErrorComponent },
      { path: 'thank-you', component: ThankuComponent },
      { path: 'cookie-popup', component: CookiePopupComponent},
      { path: 'new-chat', component: NewChatComponent},
      { path: 'expired-link', component: PasswordResetLinkComponent},
      { path: 'password-reset-link', component: PasswordResetLinkComponent},
      { path: 'email-verify', component:EmailVerifyComponent},
      
    ]
  },
  { path: 'success', component:SuccessComponent},
  // {path: '', component: ComingSoonComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
