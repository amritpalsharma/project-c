import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  private domainExtensions = ['.ch', '.de', '.it', '.fr', '.co.uk', '.es', '.pt', '.be', '.dk', '.sv']; // List of domain extensions to check
  private defaultLanguage = 'en'; // Default language
  private defaultLangId: number = 1;

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

  private setDefaultLanguage(): void {
    const domainExt = this.getDomainExtension();

    switch (domainExt) {
      case '.ch':
        this.defaultLanguage = 'de';
        break;
      case '.de':
        this.defaultLanguage = 'de';
        break;
      case '.it':
        this.defaultLanguage = 'it';
        break;
      case '.fr':
        this.defaultLanguage = 'fr';
        break;
      case '.co.uk':
        this.defaultLanguage = 'en';
        break;
      case '.es':
        this.defaultLanguage = 'es';
        break;
      case '.pt':
        this.defaultLanguage = 'pt';
        break;
      case '.be':
        this.defaultLanguage = 'fr';
        break;
      case '.dk':
        this.defaultLanguage = 'dk';
        break;
      case '.sv':
        this.defaultLanguage = 'se';
        break;
      default:
        this.defaultLanguage = 'en';
    }

    console.log(`Domain: ${window.location.hostname}, Language Set: ${this.defaultLanguage}`);
  }

  public getLanguage(): string {
    return this.defaultLanguage;
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
    } else if (language == 'da') {
      this.defaultLangId = 7;
    } else if (language == 'sv') {
      this.defaultLangId = 8;
    }
    return this.defaultLangId;
  }
}
