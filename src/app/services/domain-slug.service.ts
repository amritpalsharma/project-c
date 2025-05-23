import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DomainSlugService {
  private domainSlugMap: Record<string, Record<string, string>> = {
    'co.uk': { about: 'about', contact: 'contact', pricing: 'pricing', faq: 'faq', terms: 'terms', imprint: 'imprint', privacy: 'privacy' },
    'ch': { about: 'uber-uns', contact: 'kontakt', pricing: 'preise', faq: 'hilfebereich', terms: 'agb', imprint: 'impressum', privacy: 'datenschutz' },
    // Add more domains and routes here
  };

  private currentDomain: string;

  constructor() {
    // const host = window.location.hostname;
    // const parts = host.split('.');
    // this.currentDomain = parts.slice(-2).join('.');
    const tld = window.location.hostname.split('.').slice(-1)[0];
    this.currentDomain = tld;
  }

  getRouteSlug(key: string): string {
    // console.warn('currentDomain',this.currentDomain);
    // console.warn(this.domainSlugMap[this.currentDomain]);
    return (
      this.domainSlugMap[this.currentDomain]?.[key] ??
      this.domainSlugMap['co.uk'][key] // default fallback
    );
  }
}
