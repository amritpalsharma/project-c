import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { RouterModule } from '@angular/router';
import { WebsiteRoutingModule } from './website-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon'; 
// import { NgImageSliderModule } from 'ng-image-slider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { IndexComponent } from './index/index.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmPasswordComponent } from './SetPassword/confirmPassword.component';
import { ValidateUserComponent } from './validateUser/validateUser.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { FeatureComponent } from './feature/feature.component';
import { NewsComponent } from './news/news.component';
import { ContactComponent } from './contact/contact.component';
import { ClubComponent } from './club/club.component';
import { CaComponent } from './ca/ca.component';
import { PricingComponent } from './pricing/pricing.component';
import { FaqComponent } from './faq/faq.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { CookieComponent } from './cookie/cookie.component';
import { TalentComponent } from './talent/talent.component';
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { DetailPagesComponent } from './detail-pages/detail-pages.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { ErrorComponent } from './error/error.component';
import { ThankuComponent } from './thanku/thanku.component';
import { NewChatComponent } from './new-chat/new-chat.component';
import { CookiePopupComponent } from './cookie-popup/cookie-popup.component';
import { LoaderComponent } from './loader/loader.component';
import { ToastrModule } from 'ngx-toastr';
import { RecaptchaModule } from 'ng-recaptcha';
import { EmailVerifyComponent } from './email-verify/email-verify.component';
import { PasswordResetLinkComponent } from './password-reset-link/password-reset-link.component';

// Import services
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { HomeComponent } from './home/home.component';




@NgModule({
  declarations: [
    IndexComponent,
    ConfirmPasswordComponent,
    HeaderComponent,
    EmailVerifyComponent,
    FooterComponent,
    AboutComponent,
    FeatureComponent,
    NewsComponent,
    CookiePopupComponent,
    PasswordResetLinkComponent,
    NewChatComponent,
    ContactComponent,
    ClubComponent,
    CaComponent,
    TalentComponent,
    PricingComponent,
    PlayerListComponent,
    FaqComponent,
    LearnMoreComponent,
    DetailPagesComponent,
    ImprintComponent,
    TermsComponent,
    PrivacyComponent,
    CookieComponent,
    ThankuComponent,
    ErrorComponent,
    LoaderComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    CarouselModule,
    RouterModule,
    MatIconModule,
    RecaptchaModule,
    // NgImageSliderModule,
    ToastrModule,
    WebsiteRoutingModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    FormsModule,
    TranslateModule, // Make sure to include TranslateModule here if using in this module
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslateModule // Import TranslateModule here if using it in this module
  ],
  providers: [
    AuthService,
    ThemeService,
    // TranslateService is typically used as an injectable service and should not be listed here
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    CookiePopupComponent
  ]
})
export class WebsiteModule { }
