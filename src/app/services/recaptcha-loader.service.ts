import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RecaptchaLoaderService {
  loadReCaptchaScript(language: string) {
    const existingScript = document.querySelector('script[src*="google.com/recaptcha"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${language}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  getLanguageCodeFromId(langId: string | number): string {
    const langMap: { [key: string]: string } = {
      '1': 'de',
      '2': 'en',
      '3': 'fr',
      '4': 'it',
      '5': 'es',
      '6': 'pt',
      '7': 'da',
      '8': 'sv'
    };
    return langMap[langId] || 'en'; // Default to 'en'
  }
}
