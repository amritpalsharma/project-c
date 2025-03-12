import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  private domainExtensions = ['.ch', '.de', '.it', '.fr', '.co.uk', '.es', '.pt', '.be', '.dk', '.se']; // List of domain extensions to check
  private defaultLanguage = 'en'; // Default language
  private defaultLangId: number = 1;
  private defaultDomainId: number = 1;
  private indexFunctionCallSubject = new Subject<void>();
  indexFunctionCall$ = this.indexFunctionCallSubject.asObservable();
  constructor() {
    this.setDefaultLanguage();
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
    let localStorage_lang_id = localStorage.getItem('lang_id');
    if (localStorage_lang_id == null || localStorage_lang_id === undefined) {
      localStorage.setItem('lang_id', this.defaultLangId + '');
    } else {
      console.log('In Global service Localstorage has already  lang ' + localStorage_lang_id);
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
}
