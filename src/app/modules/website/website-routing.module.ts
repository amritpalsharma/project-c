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
import { DomainSlugGuard } from '../../services/domain-slug.guard';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [

      { path: '', component: IndexComponent }, // Default route
      { path: 'login', component: IndexComponent }, // Default route
      { path: 'index', component: IndexComponent }, // Default route
      { path: 'Index', component: IndexComponent }, // Default route
      { path: 'home', component: IndexComponent },
      { path: 'confirm-password', component: ConfirmPasswordComponent },
      { path: 'footer', component: FooterComponent },
      { path: 'feature', component: FeatureComponent },
      { path: 'news', component: NewsComponent },
      { path: 'ca', component: CaComponent },
      { path: 'cookie', component: CookieComponent },
      { path: 'learn-more', component: LearnMoreComponent },
      { path: 'news/:slug', component: DetailPagesComponent },
      { path: 'explore', component: PlayerListComponent },
      { path: 'error', component: ErrorComponent },
      { path: '404', component: NotFoundComponent },
      { path: 'thank-you', component: ThankuComponent },
      { path: 'cookie-popup', component: CookiePopupComponent },
      { path: 'new-chat', component: NewChatComponent },
      { path: 'expired-link', component: PasswordResetLinkComponent },
      { path: 'password-reset-link', component: PasswordResetLinkComponent },
      { path: 'email-verify', component: EmailVerifyComponent },

      // For England .co.uk
      { path: 'talents', component: TalentComponent },
      { path: 'clubs-scouts', component: ClubComponent,  },
      { path: 'about-us', component: AboutComponent,  },
      { path: 'pricing', component: PricingComponent,  },
      { path: 'faq', component: FaqComponent,  },
      { path: 'imprint', component: ImprintComponent,  },
      { path: 'privacy', component: PrivacyComponent,  },
      { path: 'terms-conditions', component: TermsComponent,  },
      { path: 'contact', component: ContactComponent,  },
      // For Switzerland .ch && For Germen .de
      { path: 'talente', component: TalentComponent,  },
      { path: 'clubs-scouts', component: ClubComponent,  },
      { path: 'ueber-uns', component: AboutComponent,  },
      { path: 'preise', component: PricingComponent,  },
      { path: 'impressum', component: ImprintComponent,  },
      { path: 'datenschutz', component: PrivacyComponent,  },
      { path: 'agb', component: TermsComponent,  },
      { path: 'kontakt', component: ContactComponent,  },
      // For France .fr 
      { path: 'talents', component: TalentComponent,  },
      { path: 'clubs-scouts', component: ClubComponent,  },
      { path: 'a-propos', component: AboutComponent,  },
      { path: 'tarifs', component: PricingComponent },
      { path: 'mentions-legales', component: ImprintComponent,  },
      { path: 'politique-de-confidentialite', component: PrivacyComponent,  },
      { path: 'conditions-generales', component: TermsComponent,  },
      { path: 'contact', component: ContactComponent,  },
      // For SPain .es
      { path: 'talentos', component: TalentComponent,  },
      { path: 'clubes-scouts', component: ClubComponent,  },
      { path: 'acerca-de', component: AboutComponent,  },
      { path: 'precios', component: PricingComponent,  },
      { path: 'aviso-legal', component: ImprintComponent,  },
      { path: 'politica-de-privacidad', component: PrivacyComponent,  },
      { path: 'terminos-condiciones', component: TermsComponent,  },
      { path: 'contacto', component: ContactComponent,  },
      //  For Portgal .pt
      { path: 'talentos', component: TalentComponent,  },
      { path: 'clubes-olheiros', component: ClubComponent,  },
      { path: 'sobre', component: AboutComponent,  },
      { path: 'preceos', component: PricingComponent,  },
      { path: 'impressum', component: ImprintComponent,  },
      { path: 'política-de-privacidade', component: PrivacyComponent,  },
      { path: 'termos-e-condicoees', component: TermsComponent,  },
      { path: 'contato', component: ContactComponent,  },
      // For Sweden .se 
      { path: 'talenter', component: TalentComponent,  },
      { path: 'clubber-spejdere', component: ClubComponent,  },
      { path: 'om', component: AboutComponent,  },
      { path: 'priser', component: PricingComponent,  },
      { path: 'impressum', component: ImprintComponent,  },
      { path: 'privatlivspolitik', component: PrivacyComponent,  },
      { path: 'vilkaer-og-betingelser', component: TermsComponent,  },
      { path: 'kontakt', component: ContactComponent,  },
      // For Denmark .dk domain
      { path: 'talanger', component: TalentComponent,  },
      { path: 'klubbar-scouter', component: ClubComponent,  },
      { path: 'om', component: AboutComponent,  },
      { path: 'prissaettning', component: PricingComponent,  },
      { path: 'impressum', component: ImprintComponent,  },
      { path: 'integritetspolicy', component: PrivacyComponent,  },
      { path: 'allmaenna-villkor', component: TermsComponent,  },
      { path: 'kontakt', component: ContactComponent,  },
      // For Belgium .be
      { path: 'talents', component: TalentComponent,  },
      { path: 'clubs-scouts', component: ClubComponent,  },
      { path: 'a-propos', component: AboutComponent,  },
      { path: 'tarifs', component: PricingComponent,  },
      { path: 'mentions-legales', component: ImprintComponent,  },
      { path: 'politique-de-confidentialite', component: PrivacyComponent,  },
      { path: 'conditions-generales', component: TermsComponent,  },
      { path: 'contact', component: ContactComponent,  },
      // For Italy .it
      { path: 'talenti', component: TalentComponent,  },
      { path: 'clubs-scouts', component: ClubComponent,  },
      { path: 'informazioni-su', component: AboutComponent,  },
      { path: 'prezzi', component: PricingComponent,  },
      { path: 'impronta', component: ImprintComponent,  },
      { path: 'politica-sulla-privacy', component: PrivacyComponent,  },
      { path: 'termini-condizioni', component: TermsComponent,  },
      { path: 'contatto', component: ContactComponent,  },
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
