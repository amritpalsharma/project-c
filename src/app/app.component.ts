// src/app/app.component.ts
import { DOCUMENT } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, Event as NavigationEvent, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { GlobalSettingsService } from './services/global-settings.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from './services/seo.service';
import { SEO_ROUTES, SEO_ROUTES_LANG } from './country-seo.config';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Changed to styleUrls
})
export class AppComponent implements OnInit {
  title = 'Project-c';
  showContent: boolean = false; // Control when to show the main content
  showHeader = true;
  showFooter = true;
  domainSelectedLanguage: string = '';

  event$: any;
  path: any;

  // constructor(
  //   private translateService: TranslateService,
  //   private router: Router,
  //   private globalSettings: GlobalSettingsService,
  //   @Inject(PLATFORM_ID) private platformId: Object
  // ) {
  //   console.log('APP COMPONENT SSR');
  //   if (!isPlatformBrowser(this.platformId)) {
  //     return;
  //   }
  //   this.domainSelectedLanguage = this.globalSettings.getLanguage();
  //   let domainLangId = this.globalSettings.getLanguageId();
  //   if (isPlatformBrowser(this.platformId)) {
  //     let selectedLang = localStorage.getItem('lang');
  //     let selectedLangID = localStorage.getItem('lang_id');
  //     if (selectedLang == null || selectedLang == undefined) {
  //       // this.translateService.use(this.domainSelectedLanguage);
  //       localStorage.setItem('lang', this.domainSelectedLanguage);
  //       localStorage.setItem('lang_id', String(domainLangId));
  //       console.warn('In App component Domain Language selected = ' + this.domainSelectedLanguage);
  //     } else if (selectedLang != '') {
  //       localStorage.setItem('lang', selectedLang);
  //       localStorage.setItem('lang_id', String(selectedLangID));
  //       console.warn('In App component LocalStorage Language selected = ' + selectedLang)
  //       // this.translateService.setDefaultLang(selectedLang);
  //     } else {
  //       console.error('Report To Dev For this language mess');
  //     }

  //     // Listen to router events to check route changes
  //     this.router.events.pipe(
  //       filter(event => event instanceof NavigationEnd)
  //     ).subscribe(() => {
  //       this.updateVisibility(); // Update visibility when route changes
  //     });


  //     this.event$ = this.router.events.subscribe((event: NavigationEvent) => {
  //       if (event instanceof NavigationStart) {
  //         this.path = event.url;
  //         if (document.body.classList.contains('body-overflow')) {
  //           document.body.classList.remove('body-overflow');
  //         }
  //         window.scrollTo({
  //           top: 0,
  //           behavior: 'smooth' // Smooth scroll
  //         });
  //       }
  //     });
  //   }
  // }
  constructor(
    private translateService: TranslateService,
    private router: Router,
    private globalSettings: GlobalSettingsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoService: SeoService,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {

    console.log('APP COMPONENT SSR');

    this.domainSelectedLanguage = this.globalSettings.getLanguage();

    let domainLangId = this.globalSettings.getLanguageId();

    if (isPlatformBrowser(this.platformId)) {

      let selectedLang = localStorage.getItem('lang');
      let selectedLangID = localStorage.getItem('lang_id');

      if (selectedLang == null || selectedLang == undefined) {

        localStorage.setItem('lang', this.domainSelectedLanguage);
        localStorage.setItem('lang_id', String(domainLangId));

      } else if (selectedLang != '') {

        localStorage.setItem('lang', selectedLang);
        localStorage.setItem('lang_id', String(selectedLangID));

      }

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateVisibility();
      });

      this.event$ = this.router.events.subscribe((event: NavigationEvent) => {

        if (event instanceof NavigationStart) {

          this.path = event.url;

          if (typeof document !== 'undefined') {

            if (document.body.classList.contains('body-overflow')) {
              document.body.classList.remove('body-overflow');
            }

          }

          if (typeof window !== 'undefined') {

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

          }
        }

      });

    }

  }

  ngOnInit() {

    // Check if the logout message flag is set
    this.updateSeo();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.updateSeo();
      });
    if (isPlatformBrowser(this.platformId)) {


      const logoutMessage = localStorage.getItem('logoutMessage');
      if (logoutMessage) {
        console.log('Token successfully removed from local storage.');

        // Clear the message after 10 seconds
        setTimeout(() => {
          console.clear();
          localStorage.removeItem('logoutMessage');
        }, 10000);
      }

      // window.addEventListener('storage', (event) => {
      //   if (event.key === 'lang' || event.key === 'theme') {
      //     // Option 1: Reload page
      //     window.location.reload();
      //   }
      // });
      const browserWindow =
        typeof globalThis !== 'undefined'
          ? (globalThis as any).window
          : null;

      if (browserWindow) {

        // browserWindow.addEventListener('storage', (event: StorageEvent) => {

        //   if (event.key === 'lang' || event.key === 'theme') {

        //     browserWindow.location.reload();

        //   }

        // });

      }
    }




    // this.checkBodyClass()
  }

  private getSeoKey(): string | null {

    let route = this.activatedRoute;

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route.snapshot.data?.['seoKey'] || null;

  }

  private updateSeo(): void {
    console.log('SEO RUNNING');

    const canonical =
      this.document.location?.href;

    const path = this.router.url.split('?')[0];

    // HOME
    if (
      [
        '',
        '/',
        '/index',
        '/Index',
        '/home',
        '/login'
      ].includes(path)
    ) {

      this.seoService.setHreflangs(SEO_ROUTES.home);
      this.seoService.setCanonical(environment.currentDomain + path);

      return;

    }

    // TALENT
    if (
      [
        '/talents',
        '/talente',
        '/talentos',
        '/talenter',
        '/talanger',
        '/talenti'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.talent);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.talent)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // CLUBS
    if (
      [
        '/clubs-scouts',
        '/clubes-scouts',
        '/clubes-olheiros',
        '/clubber-spejdere',
        '/klubbar-scouter'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.clubs);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.clubs)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // ABOUT
    if (
      [
        '/about-us',
        '/ueber-uns',
        '/a-propos',
        '/acerca-de',
        '/sobre',
        '/om',
        '/informazioni-su'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.about);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.about)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // PRICING
    if (
      [
        '/pricing',
        '/preise',
        '/tarifs',
        '/precios',
        '/preceos',
        '/priser',
        '/prissaettning',
        '/prezzi'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.pricing);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.pricing)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // FAQ
    if (
      [
        '/faq'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.faq);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.faq)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // IMPRINT
    if (
      [
        '/imprint',
        '/impressum',
        '/mentions-legales',
        '/aviso-legal',
        '/impronta'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.imprint);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.imprint)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // PRIVACY
    if (
      [
        '/privacy',
        '/datenschutz',
        '/politique-de-confidentialite',
        '/politica-de-privacidad',
        '/política-de-privacidade',
        '/privatlivspolitik',
        '/integritetspolicy',
        '/politica-sulla-privacy'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.privacy);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.privacy)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // TERMS
    if (
      [
        '/terms-conditions',
        '/agb',
        '/conditions-generales',
        '/terminos-condiciones',
        '/termos-e-condicoees',
        '/vilkaer-og-betingelser',
        '/allmaenna-villkor',
        '/termini-condizioni'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.terms);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.terms)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // CONTACT
    if (
      [
        '/contact',
        '/kontakt',
        '/contacto',
        '/contato',
        '/contatto'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.contact);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.contact)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // NEWS LISTING
    if (
      [
        '/news'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.news);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.news)
      // );
      this.seoService.setCanonical(environment.currentDomain + path);
      return;
    }

    // EXPLORE
    if (
      [
        '/explore'
      ].includes(path)
    ) {
      this.seoService.setHreflangs(SEO_ROUTES.explore);
      // this.seoService.setCanonical(
      //   this.globalSettings.getCanonical(SEO_ROUTES.explore)
      // );
      this.seoService.setCanonical(path);
      return;
    }
  }

  checkBodyClass() {
    const currentRoute = this.router.url;
    alert(currentRoute)
  }

  onCookiesAccepted() {
    // Logic to handle what happens when cookies are accepted
    console.log('Cookies have been accepted.');
    this.showContent = true; // Show the main content after accepting cookies
  }

  // Method to determine if the route is within the WebsiteModule
  private updateVisibility() {
    const currentRoute = this.router.url;

    // Assuming 'website' is part of the route for WebsiteModule
    if (currentRoute.startsWith('/admin') ||
      currentRoute.startsWith('/material') ||
      currentRoute.startsWith('/scout') ||
      currentRoute === '/') {
      this.showHeader = true;
      this.showFooter = true;
    } else {
      this.showHeader = false;
      this.showFooter = false;
    }
  }

  ngAfterViewChecked(): void {
    // Scroll to the top after every route change

  }
}
