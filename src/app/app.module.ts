import { DOCUMENT } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
// import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxEditorModule } from 'ngx-editor';
import { AuthInterceptor } from './auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MaterialModule } from '../app/modules/material/material.module'
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OAuthModule } from 'angular-oauth2-oidc';
// import { SharedModule } from './modules/shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { LightboxDialogComponent } from './modules/talent/lightbox-dialog/lightbox-dialog.component';
import { WebsiteModule } from './modules/website/website.module';
// import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPaginatorIntl } from './modules/shared/paginator/custom-paginator-intl';
// import { PerformanceAnalysisComponent } from './modules/admin/tabs/performance-analysis/performance-analysis.component';
// import { TinymceWrapperComponent } from './modules/shared/tinymce-wrapper/tinymce-wrapper.component';
// import { UnverifiedUserComponent } from './modules/shared/unverified-user/unverified-user.component';
// import '../../style.scss';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { DOCUMENT } from '@angular/common';

// New By Amrit
// import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
// import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


// No Scroll Body
// import { Overlay, OverlayModule } from '@angular/cdk/overlay';
// import { MAT_SELECT_SCROLL_STRATEGY } from '@angular/material/select';
// import { ScrollStrategy } from '@angular/cdk/overlay';
import { GlobalSettingsService } from './services/global-settings.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

// export function matSelectScrollStrategyFactory(overlay: Overlay): ScrollStrategy {
//   return overlay.scrollStrategies.reposition(); // you can try .noop() as well
// }
// End No Scroll Body
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeoService } from './services/seo.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);

}
// import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
@NgModule({
  declarations: [
    AppComponent,
    LightboxDialogComponent,
    // PerformanceAnalysisComponent,
    // TinymceWrapperComponent,
    // UnverifiedUserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    ReactiveFormsModule,
    FormsModule,
    // MatTooltipModule,
    HttpClientModule,
    MaterialModule,
    // MatTooltipModule,
    MatDialogModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    WebsiteModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      // defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // NgxEditorModule,
    // NgSelectModule,
    OAuthModule.forRoot(),
    // Added By AMrit
    // MatSelectModule,
    MatFormFieldModule,
    // NgxMatSelectSearchModule,
    // OverlayModule,
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   // enabled: !isDevMode(),
    //   enabled: environment.production,
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: MatPaginatorIntl,
      useFactory: getPaginatorIntl,
      deps: [TranslateService] // or TranslateService if used directly in factory
    },
    // {
    //   // provide: MAT_SELECT_SCROLL_STRATEGY
    //   // useFactory: matSelectScrollStrategyFactory,
    //   // deps: [Overlay],
    // },
    // provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private globalSettingsService: GlobalSettingsService,
    private translateService: TranslateService,
    private router: Router,
    private seoService: SeoService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.setLanguage();
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // const canonicalUrl =
        //   window.location.origin +
        //   this.router.url;
        // this.seoService.setCanonical(canonicalUrl);
        const currentUrl = this.document.URL;

        console.log('DOCUMENT URL:', currentUrl);

        this.seoService.setCanonical(currentUrl);

      });
  }


  // Set the language based on the GlobalSettingsService
  setLanguage(): void {
    let languageSlug = this.globalSettingsService.getLanguage();
    if (languageSlug) {
      this.translateService.use(languageSlug);
    } else {
      // Default language fallback
      this.translateService.use('de');
    }
  }
}
