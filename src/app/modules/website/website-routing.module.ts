import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ConfirmPasswordComponent } from './SetPassword/confirmPassword.component';
import { AboutComponent } from './about/about.component';
import { ClubComponent } from './club/club.component';
// import { FeatureComponent } from './feature/feature.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';
import { PricingComponent } from './pricing/pricing.component';
// import { CaComponent } from './ca/ca.component';
import { FaqComponent } from './faq/faq.component';
import { ImprintComponent } from './imprint/imprint.component';
import { CookieComponent } from './cookie/cookie.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TalentComponent } from './talent/talent.component';
// import { LearnMoreComponent } from './learn-more/learn-more.component';
import { DetailPagesComponent } from './detail-pages/detail-pages.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { ErrorComponent } from './error/error.component';
import { ThankuComponent } from './thanku/thanku.component';
// import { NewChatComponent } from './new-chat/new-chat.component';
import { CookiePopupComponent } from './cookie-popup/cookie-popup.component';
import { EmailVerifyComponent } from './email-verify/email-verify.component';
import { PasswordResetLinkComponent } from './password-reset-link/password-reset-link.component';
import { HomeComponent } from './home/home.component';
// import { SuccessComponent } from '../shared/success/success.component';
// import { DomainSlugGuard } from '../../services/domain-slug.guard';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, data: { seoKey: 'home' },
    children: [

      { path: '', component: IndexComponent, data: { seoKey: 'home' } }, // Default route
      { path: 'login', component: IndexComponent, data: { seoKey: 'home' } }, // Default route
      { path: 'index', component: IndexComponent, data: { seoKey: 'home' } }, // Default route
      { path: 'Index', component: IndexComponent, data: { seoKey: 'home' } }, // Default route
      { path: 'home', component: IndexComponent, data: { seoKey: 'home' } },
      { path: 'confirm-password', component: ConfirmPasswordComponent },
      { path: 'news', component: NewsComponent, data: { seoKey: 'news' } },
      { path: 'cookie', component: CookieComponent },
      { path: 'news/:slug', component: DetailPagesComponent },
      { path: 'explore', component: PlayerListComponent },
      { path: 'error', component: ErrorComponent, data: { seoKey: 'news' } },
      { path: '404', component: NotFoundComponent },
      { path: 'thank-you', component: ThankuComponent },
      { path: 'expired-link', component: PasswordResetLinkComponent },
      { path: 'password-reset-link', component: PasswordResetLinkComponent },
      { path: 'email-verify', component: EmailVerifyComponent },

      // For England .co.uk
      { path: 'talents', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubs-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'about-us', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'pricing', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'faq', component: FaqComponent, data: { seoKey: 'faq' } }, // addEventListener
      { path: 'imprint', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'privacy', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'terms-conditions', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contact', component: ContactComponent, data: { seoKey: 'contact' } },
      // For Switzerland .ch && For Germen .de
      { path: 'talente', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubs-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'ueber-uns', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'preise', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'impressum', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'datenschutz', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'agb', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'kontakt', component: ContactComponent, data: { seoKey: 'contact' } },
      // For France .fr 
      { path: 'talents', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubs-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'a-propos', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'tarifs', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'mentions-legales', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'politique-de-confidentialite', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'conditions-generales', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contact', component: ContactComponent, data: { seoKey: 'contact' } },
      // For SPain .es
      { path: 'talentos', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubes-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'acerca-de', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'precios', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'aviso-legal', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'politica-de-privacidad', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'terminos-condiciones', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contacto', component: ContactComponent, data: { seoKey: 'contact' } },
      //  For Portgal .pt
      { path: 'talentos', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubes-olheiros', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'sobre', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'preceos', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'impressum', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'política-de-privacidade', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'termos-e-condicoees', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contato', component: ContactComponent, data: { seoKey: 'contact' } },
      // For Sweden .se 
      { path: 'talenter', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubber-spejdere', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'om', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'priser', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'impressum', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'privatlivspolitik', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'vilkaer-og-betingelser', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'kontakt', component: ContactComponent, data: { seoKey: 'contact' } },
      // For Denmark .dk domain
      { path: 'talanger', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'klubbar-scouter', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'om', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'prissaettning', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'impressum', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'integritetspolicy', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'allmaenna-villkor', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'kontakt', component: ContactComponent, data: { seoKey: 'contact' } },
      // For Belgium .be
      { path: 'talents', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubs-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'a-propos', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'tarifs', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'mentions-legales', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'politique-de-confidentialite', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'conditions-generales', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contact', component: ContactComponent, data: { seoKey: 'contact' } },
      // For Italy .it
      { path: 'talenti', component: TalentComponent, data: { seoKey: 'talent' } },
      { path: 'clubs-scouts', component: ClubComponent, data: { seoKey: 'clubs' } },
      { path: 'informazioni-su', component: AboutComponent, data: { seoKey: 'about' } },
      { path: 'prezzi', component: PricingComponent, data: { seoKey: 'pricing' } },
      { path: 'impronta', component: ImprintComponent, data: { seoKey: 'imprint' } },
      { path: 'politica-sulla-privacy', component: PrivacyComponent, data: { seoKey: 'privacy' } },
      { path: 'termini-condizioni', component: TermsComponent, data: { seoKey: 'terms' } },
      { path: 'contatto', component: ContactComponent, data: { seoKey: 'contact' } },
    ]
  },
  // { path: 'success', component: SuccessComponent },
  // {path: '', component: ComingSoonComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
