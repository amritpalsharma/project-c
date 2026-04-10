import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DomainSlugService {
  private domainSlugMap: Record<string, Record<string, string>> = {
    'co.uk': {
      talent: 'talents',
      clubAndScout: 'clubs-scouts',
      about: 'about-us',
      pricing: 'pricing',
      faq: 'faq',
      imprint: 'imprint',
      privacy: 'privacy',
      terms: 'terms-conditions',
      contact: 'contact',
    },
    'ch': {
      talent: 'talente',
      clubAndScout: 'clubs-scouts',
      about: 'ueber-uns',
      pricing: 'preise',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'datenschutz',
      terms: 'agb',
      contact: 'kontakt',
    },
    'de': {
      talent: 'talente',
      clubAndScout: 'clubs-scouts',
      about: 'ueber-uns',
      pricing: 'preise',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'datenschutz',
      terms: 'agb',
      contact: 'kontakt',
    },
    'fr': {
      talent: 'talents',
      clubAndScout: 'clubs-scouts',
      about: 'a-propos',
      pricing: 'tarifs',
      faq: 'faq',
      imprint: 'mentions-legales',
      privacy: 'politique-de-confidentialite',
      terms: 'conditions-generales',
      contact: 'contact',
    },
    'es': {
      talent: 'talentos',
      clubAndScout: 'clubes-scouts',
      about: 'acerca-de',
      pricing: 'precios',
      faq: 'faq',
      imprint: 'aviso-legal',
      privacy: 'politica-de-privacidad',
      terms: 'terminos-condiciones',
      contact: 'contacto',
    },
    'pt': {
      talent: 'talentos',
      clubAndScout: 'clubes-olheiros',
      about: 'sobre',
      pricing: 'preceos',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'política-de-privacidade',
      terms: 'termos-e-condicoees',
      contact: 'contato',
    },
    'se': {
      talent: 'talenter',
      clubAndScout: 'clubber-spejdere',
      about: 'om',
      pricing: 'priser',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'privatlivspolitik',
      terms: 'vilkaer-og-betingelser',
      contact: 'kontakt',
    },
    'dk': {
      talent: 'talanger',
      clubAndScout: 'klubbar-scouter',
      about: 'om',
      pricing: 'prissaettning',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'integritetspolicy',
      terms: 'allmaenna-villkor',
      contact: 'kontakt',
    },
    'be': {
      talent: 'talents',
      clubAndScout: 'clubs-scouts',
      about: 'a-propos',
      pricing: 'tarifs',
      faq: 'faq',
      imprint: 'mentions-legales',
      privacy: 'politique-de-confidentialite',
      terms: 'conditions-generales',
      contact: 'contact',
    },
    'it': {
      talent: 'talenti',
      clubAndScout: 'clubs-scouts',
      about: 'informazioni-su',
      pricing: 'prezzi',
      faq: 'faq',
      imprint: 'impronta',
      privacy: 'politica-sulla-privacy',
      terms: 'termini-condizioni',
      contact: 'contatto',
    },
    'at': {
      talent: 'talente',
      clubAndScout: 'clubs-scouts',
      about: 'ueber-uns',
      pricing: 'preise',
      faq: 'faq',
      imprint: 'impressum',
      privacy: 'datenschutz',
      terms: 'agb',
      contact: 'kontakt',
    },
    
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
