import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  private domainExtensions = ['.ch', '.de', '.it', '.fr', '.co.uk', '.es', '.pt', '.be', '.dk', '.se']; // List of domain extensions to check
  private defaultLanguage = 'en'; // Default language
  private defaultLangId: number = 1;
  private defaultDomainId: number = 1;
  private domainCurrency: string = 'GBP';
  private indexFunctionCallSubject = new Subject<void>();
  private themeAndLangCallSubject = new Subject<void>();
  indexFunctionCall$ = this.indexFunctionCallSubject.asObservable();
  themeAndLangCallSubject$ = this.themeAndLangCallSubject.asObservable();
  private viewOnlyMode = new BehaviorSubject<string>('');
  viewOnly$ = this.viewOnlyMode.asObservable();
  constructor(private authService: AuthService, private themeService: ThemeService) {
    this.setDefaultLanguage();
    this.setDomainCurrency();
    this.themeService.setDefaultDarkTheme();
  }

  setViewOnly(state: string) {
    console.info('state set in global service as ',state)
    this.viewOnlyMode.next(state);
  }

  getCurrentViewOnly(): string {
    return this.viewOnlyMode.getValue();
  }

  private getDomainExtension(): string {
    const hostname = window.location.hostname; // Get full domain name
    for (const ext of this.domainExtensions) {
      if (hostname.endsWith(ext)) {
        return ext; // Return matched extension
      }
    }
    return ''; // Return empty string if no match
  }


  public getCurrentDomainExtension() {
    const hostname = window.location.hostname; // Get full domain name
    for (const ext of this.domainExtensions) {
      if (hostname.endsWith(ext)) {
        return ext; // Return matched extension
      }
    }
    return '';
  }

  private setDefaultLanguage(): void {
    const domainExt = this.getDomainExtension();
    // alert(domainExt)
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
      default:
        this.defaultLanguage = 'en';
    }

    console.log(`Domain: ${window.location.hostname}, Language Set: ${this.defaultLanguage}`);
  }

  public getLanguage(): string {
    return this.defaultLanguage;
  }

  public getdomainId(): number {
    return this.defaultDomainId;
  }
  public getLanguageId(): number {
    // this.setDefaultLanguage();
    let language = this.defaultLanguage;
    if (language == 'en') {
      this.defaultLangId = 1;
    } else if (language == 'de') {
      this.defaultLangId = 2;
    } else if (language == 'it') {
      this.defaultLangId = 3;
    } else if (language == 'fr') {
      this.defaultLangId = 4;
    } else if (language == 'es') {
      this.defaultLangId = 5;
    } else if (language == 'pt') {
      this.defaultLangId = 6;
    } else if (language == 'dk') {
      this.defaultLangId = 7;
    } else if (language == 'se') {
      this.defaultLangId = 8;
    }
    return this.defaultLangId;
  }

  public getdomainExtension(): string {
    let hostname = window.location.hostname;  // Get domain (e.g., "example.ch")
    let parts = hostname.split('.');          // Split by dots
    return parts.length > 1 ? '' + parts.pop() : '';
  }

  callIndexComponentFunction() {
    this.indexFunctionCallSubject.next(); // Notify listeners (IndexComponent)
  }

  themeAndLangChange(action: string, object: any) {
    // this.themeAndLangCallSubject.next(action, object);
    this.themeAndLangCallSubject.next();
  }

  getDeviceType() {
    const ua = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|iPhone|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  getPlansLink() {
    return this.authService.getPlansPageLink();
  }

  setDomainCurrency() {
    let currency = 'GBP';
    if (this.defaultDomainId == 1) {
      currency = 'CHF';
    } else if (this.defaultDomainId == 2 || this.defaultDomainId == 3 || this.defaultDomainId == 4) {
      currency = 'EUR';
    } else if (this.defaultDomainId == 5) {
      currency = 'GBP';
    } else if (this.defaultDomainId == 6 || this.defaultDomainId == 7 || this.defaultDomainId == 8) {
      currency = 'EUR';
    } else if (this.defaultDomainId == 9) {
      currency = 'DKK';
    } else if (this.defaultDomainId == 10) {
      currency = 'SEK';
    }
    this.domainCurrency = currency;
  }

  getDomainCurrency() {
    return this.domainCurrency;
  }

  getDialCodeByDomain(): string {
    const domain = window.location.hostname;
    const domainExt = domain.endsWith('.co.uk') ? '.co.uk' : '.' + domain.split('.').pop();

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
      '.se': '+46'
    };

    return dialCodes[domainExt] || '+1'; // Default to +1 (USA) if no match
  }
}
