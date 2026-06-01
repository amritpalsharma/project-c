import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private documentRef: Document
  ) { }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get hostname(): string {

    if (!this.isBrowser) {
      return 'localhost';
    }

    try {
      return globalThis?.location?.hostname || 'localhost';
    } catch {
      return 'localhost';
    }
  }

  get localStorage(): Storage | null {

    if (!this.isBrowser) {
      return null;
    }

    try {
      return globalThis?.localStorage || null;
    } catch {
      return null;
    }
  }

  get document(): Document | null {

    if (!this.isBrowser) {
      return null;
    }

    try {
      return this.documentRef || null;
    } catch {
      return null;
    }
  }
}