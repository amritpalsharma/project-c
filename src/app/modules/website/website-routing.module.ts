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
    path: '', component: HomeComponent,
    children: [

      { path: '', component: IndexComponent }, // Default route
      { path: 'Index', component: IndexComponent }, // Default route
      { path: 'home', component: IndexComponent },
      { path: 'confirm-password', component: ConfirmPasswordComponent },
      { path: 'footer', component: FooterComponent },
      { path: 'club', component: ClubComponent },
      { path: 'feature', component: FeatureComponent },
      { path: 'news', component: NewsComponent },

      { path: 'ca', component: CaComponent },


      { path: 'cookie', component: CookieComponent },


      { path: 'talent', component: TalentComponent },
      { path: 'learn-more', component: LearnMoreComponent },
      { path: 'news/:slug', component: DetailPagesComponent },
      { path: 'player-list', component: PlayerListComponent },
      { path: 'error', component: ErrorComponent },
      { path: 'thank-you', component: ThankuComponent },
      { path: 'cookie-popup', component: CookiePopupComponent },
      { path: 'new-chat', component: NewChatComponent },
      { path: 'expired-link', component: PasswordResetLinkComponent },
      { path: 'password-reset-link', component: PasswordResetLinkComponent },
      { path: 'email-verify', component: EmailVerifyComponent },

      // For England
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy', component: PrivacyComponent },
      // For Germen
      { path: 'uber-uns', component: AboutComponent },
      { path: 'kontakt', component: ContactComponent },
      { path: 'preise', component: PricingComponent },
      { path: 'hilfebereich', component: FaqComponent },
      { path: 'agb', component: TermsComponent },
      { path: 'impressum', component: ImprintComponent },
      { path: 'datenschutz', component: PrivacyComponent },

    ]
  },
  { path: 'success', component: SuccessComponent },
  // {path: '', component: ComingSoonComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
