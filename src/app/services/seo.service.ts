import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) { 
    this.setOrganizationSchema();
  }

  updateMetaData(title: string, description: string) {

    // Set Title
    this.title.setTitle(title);

    // Set Description
    this.meta.updateTag({
      name: 'description',
      content: description
    });

  }


  setCanonical(url: string): void {

    if (!url) {
      return;
    }

    let link = this.document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }

    console.log('Recived For canonical ' + url)
    link.href = url as string;
    // link.href = url;
  }

  setHreflangs(pageConfig: any) {
    console.log('herfLang picked from app component in seo service', pageConfig);
    this.document
      .querySelectorAll('link[rel="alternate"]')
      .forEach(x => x.remove());

    Object.entries(pageConfig).forEach(([lang, url]) => {

      const link = this.document.createElement('link');

      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url as string;

      this.document.head.appendChild(link);
      console.log('herfLang alternate link is ', link.href);
    });

  }


  setOrganizationSchema() {

    const host = this.document.location.origin;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SoccerYou",
      "legalName": "Soccer You Sports AG",
      "url": environment.currentDomain,
      "logo": `${environment.currentDomain}/assets/images/light-logo.svg`,
      "foundingLocation": {
        "@type": "Place",
        "addressLocality": "Winterthur",
        "addressCountry": "CH"
      },
      "sameAs": [
        "https://www.instagram.com/socceryou_football/",
        "https://www.linkedin.com/company/socceryou-football/",
        "https://www.tiktok.com/@socceryou_football"
      ]
    };

    const script = this.document.createElement('script');

    console.log('Schema Url is '+host)
    script.type = 'application/ld+json';

    script.text = JSON.stringify(schema);

    this.document.head.appendChild(script);

    return host;
  }
}
