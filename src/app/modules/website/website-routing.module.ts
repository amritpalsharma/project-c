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

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [

      { path: '', component: IndexComponent }, // Default route
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
      { path: 'thank-you', component: ThankuComponent },
      { path: 'cookie-popup', component: CookiePopupComponent },
      { path: 'new-chat', component: NewChatComponent },
      { path: 'expired-link', component: PasswordResetLinkComponent },
      { path: 'password-reset-link', component: PasswordResetLinkComponent },
      { path: 'email-verify', component: EmailVerifyComponent },

      // For England .co.uk
      { path: 'talents', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubs-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'about-us', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'pricing', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'faq', component: FaqComponent, canActivate: [DomainSlugGuard] },
      { path: 'imprint', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'privacy', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'terms-conditions', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contact', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For Switzerland .ch && For Germen .de
      { path: 'talente', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubs-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'ueber-uns', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'preise', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'impressum', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'datenschutz', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'agb', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'kontakt', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For France .fr 
      { path: 'talents', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubs-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'a-propos', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'tarifs', component: PricingComponent },
      { path: 'mentions-legales', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'politique-de-confidentialite', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'conditions-generales', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contact', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For SPain .es
      { path: 'talentos', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubes-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'acerca-de', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'precios', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'aviso-legal', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'politica-de-privacidad', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'terminos-condiciones', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contacto', component: ContactComponent, canActivate: [DomainSlugGuard] },
      //  For Portgal .pt
      { path: 'talentos', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubes-olheiros', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'sobre', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'preceos', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'impressum', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'política-de-privacidade', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'termos-e-condicoees', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contato', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For Sweden .se 
      { path: 'talenter', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubber-spejdere', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'om', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'priser', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'impressum', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'privatlivspolitik', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'vilkaer-og-betingelser', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'kontakt', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For Denmark .dk domain
      { path: 'talanger', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'klubbar-scouter', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'om', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'prissaettning', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'impressum', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'integritetspolicy', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'allmaenna-villkor', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'kontakt', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For Belgium .be
      { path: 'talents', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubs-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'a-propos', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'tarifs', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'mentions-legales', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'politique-de-confidentialite', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'conditions-generales', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contact', component: ContactComponent, canActivate: [DomainSlugGuard] },
      // For Italy .it
      { path: 'talenti', component: TalentComponent, canActivate: [DomainSlugGuard] },
      { path: 'clubs-scouts', component: ClubComponent, canActivate: [DomainSlugGuard] },
      { path: 'informazioni-su', component: AboutComponent, canActivate: [DomainSlugGuard] },
      { path: 'prezzi', component: PricingComponent, canActivate: [DomainSlugGuard] },
      { path: 'impronta', component: ImprintComponent, canActivate: [DomainSlugGuard] },
      { path: 'politica-sulla-privacy', component: PrivacyComponent, canActivate: [DomainSlugGuard] },
      { path: 'termini-condizioni', component: TermsComponent, canActivate: [DomainSlugGuard] },
      { path: 'contatto', component: ContactComponent, canActivate: [DomainSlugGuard] },
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
