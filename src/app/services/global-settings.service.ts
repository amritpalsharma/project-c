import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, BehaviorSubject } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ThemeService } from './theme.service';
import { BrowserService } from './browser.service';
import { SEO_ROUTES_LANG } from '../country-seo.config';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  private isBrowser: boolean;

  private domainExtensions = [
    '.ch',
    '.de',
    '.it',
    '.fr',
    '.co.uk',
    '.es',
    '.pt',
    '.be',
    '.dk',
    '.se',
    '.at',
    '.org',
    '.al'
  ];

  private defaultLanguage = 'en';
  private defaultLangId = 1;
  private defaultDomainId = 1;
  private domainCurrency = 'GBP';

  private indexFunctionCallSubject = new Subject<void>();
  private themeAndLangCallSubject = new Subject<void>();

  indexFunctionCall$ = this.indexFunctionCallSubject.asObservable();
  themeAndLangCallSubject$ = this.themeAndLangCallSubject.asObservable();

  private viewOnlyMode = new BehaviorSubject<string>('');
  viewOnly$ = this.viewOnlyMode.asObservable();

  constructor(
    private authService: AuthService,
    private browserService: BrowserService,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    this.setDefaultLanguage();
    this.setDomainCurrency();

    if (this.isBrowser) {
      this.themeService.setDefaultDarkTheme();
    }
  }

  setViewOnly(state: string) {
    this.viewOnlyMode.next(state);
  }

  getCurrentViewOnly(): string {
    return this.viewOnlyMode.getValue();
  }

  private getHostname(): string {

    if (!this.isBrowser) {
      return '';
    }

    return this.browserService.hostname || '';
  }

  private getDomainExtension(): string {

    const hostname = this.getHostname();

    for (const ext of this.domainExtensions) {
      if (hostname.endsWith(ext)) {
        return ext;
      }
    }

    return '';
  }

  public getCurrentDomainExtension(): string {
    return this.getDomainExtension();
  }

  private setDefaultLanguage(): void {

    const domainExt = this.getDomainExtension();

    switch (domainExt) {

      case '.ch':
        this.defaultLanguage = 'de';
        this.defaultDomainId = 1;
        break;

      case '.de':
        this.defaultLanguage = 'de';
        this.defaultDomainId = 2;
        break;

      case '.it':
        this.defaultLanguage = 'it';
        this.defaultDomainId = 3;
        break;

      case '.fr':
        this.defaultLanguage = 'fr';
        this.defaultDomainId = 4;
        break;

      case '.co.uk':
        this.defaultLanguage = 'en';
        this.defaultDomainId = 5;
        break;

      case '.es':
        this.defaultLanguage = 'es';
        this.defaultDomainId = 6;
        break;

      case '.pt':
        this.defaultLanguage = 'pt';
        this.defaultDomainId = 7;
        break;

      case '.be':
        this.defaultLanguage = 'fr';
        this.defaultDomainId = 8;
        break;

      case '.dk':
        this.defaultLanguage = 'dk';
        this.defaultDomainId = 9;
        break;

      case '.se':
        this.defaultLanguage = 'se';
        this.defaultDomainId = 10;
        break;

      case '.at':
        this.defaultLanguage = 'de';
        this.defaultDomainId = 11;
        break;

      case '.org':
        this.defaultLanguage = 'en';
        this.defaultDomainId = 12;
        break;

      case '.al':
        this.defaultLanguage = 'en';
        this.defaultDomainId = 13;
        break;

      default:
        this.defaultLanguage = 'de';
        this.defaultDomainId = 1;
    }
  }

  public getLanguage(): string {

    if (!this.isBrowser) {
      return this.defaultLanguage;
    }

    const localStorageLang = localStorage.getItem('lang');

    if (localStorageLang) {
      this.defaultLanguage = localStorageLang;
    }

    return this.defaultLanguage;
  }

  public getdomainId(): number {
    return this.defaultDomainId;
  }

  public getLanguageId(): number {

    const language = this.defaultLanguage;

    switch (language) {

      case 'en':
        this.defaultLangId = 1;
        break;

      case 'de':
        this.defaultLangId = 2;
        break;

      case 'it':
        this.defaultLangId = 3;
        break;

      case 'fr':
        this.defaultLangId = 4;
        break;

      case 'es':
        this.defaultLangId = 5;
        break;

      case 'pt':
        this.defaultLangId = 6;
        break;

      case 'dk':
        this.defaultLangId = 7;
        break;

      case 'se':
        this.defaultLangId = 8;
        break;
    }

    return this.defaultLangId;
  }

  public getdomainExtension(): string {

    const hostname = this.getHostname();

    const parts = hostname.split('.');

    return parts.length > 1
      ? parts.pop() || ''
      : '';
  }

  callIndexComponentFunction() {
    this.indexFunctionCallSubject.next();
  }

  themeAndLangChange(action: string, object: any) {
    this.themeAndLangCallSubject.next();
  }

  getDeviceType(): string {

    if (!this.isBrowser) {
      return 'desktop';
    }

    const ua = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }

    if (/Mobile|iPhone|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
  }

  getPlansLink() {
    return this.authService.getPlansPageLink();
  }

  setDomainCurrency() {

    let currency = 'GBP';

    switch (this.defaultDomainId) {

      case 1:
        currency = 'CHF';
        break;

      case 2:
      case 3:
      case 4:
      case 6:
      case 7:
      case 8:
        currency = 'EUR';
        break;

      case 5:
        currency = 'GBP';
        break;

      case 9:
        currency = 'DKK';
        break;

      case 10:
        currency = 'SEK';
        break;

      case 13:
        currency = 'LEK';
        break;
    }

    this.domainCurrency = currency;
  }

  getDomainCurrency() {
    return this.domainCurrency;
  }

  getDialCodeByDomain(): string {

    const hostname = this.getHostname();

    const domainExt = hostname.endsWith('.co.uk')
      ? '.co.uk'
      : '.' + hostname.split('.').pop();

    const dialCodes: { [key: string]: string } = {
      '.ch': '+41',
      '.de': '+49',
      '.it': '+39',
      '.fr': '+33',
      '.co.uk': '+44',
      '.es': '+34',
      '.pt': '+351',
      '.be': '+32',
      '.dk': '+45',
      '.se': '+46',
      '.at': '+43',
      '.al': '+355'
    };

    return dialCodes[domainExt] || '+1';
  }
  getCanonical(pageType: any) {
    return pageType[this.defaultLanguage];
  }
}