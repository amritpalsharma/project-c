import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(true);
  isDarkTheme = this.darkMode.asObservable();
  private readonly themeKey = 'theme';
  private readonly darkThemeClass = 'dark-theme';
  private readonly lightThemeClass = 'light-theme';
  // private themeSubject: BehaviorSubject<string> = new BehaviorSubject<string>('light'); // ✅ Default theme
  private themeSubject: BehaviorSubject<string> = new BehaviorSubject<string>('dark-theme'); // ✅ Default theme
  public theme$: Observable<string> = this.themeSubject.asObservable();
  isBrowser: boolean = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadTheme();
    }
  }

  // private loadTheme() {
  //   if (typeof document === 'undefined') {
  //     return;
  //   }
  //   if (isPlatformBrowser(this.platformId)) {
  //     const stored = localStorage.getItem(this.themeKey);
  //     const theme = stored ?? 'dark'; // default to dark on first visit
  //     if (theme === 'dark') {
  //       this.darkMode.next(true);
  //       document.body.classList.add(this.darkThemeClass);
  //       document.body.classList.remove(this.lightThemeClass);
  //     } else {
  //       this.darkMode.next(false);
  //       document.body.classList.add(this.lightThemeClass);
  //       document.body.classList.remove(this.darkThemeClass);
  //     }
  //   }
  // }

  // setDarkTheme(isDarkTheme: boolean): void {
  //   if (typeof document === 'undefined') {
  //     return;
  //   }
  //   this.darkMode.next(isDarkTheme);
  //   if (isPlatformBrowser(this.platformId)) {
  //     if (isDarkTheme) {
  //       document.body.classList.add(this.darkThemeClass);
  //       document.body.classList.remove(this.lightThemeClass);
  //       if (isPlatformBrowser(this.platformId)){
  //         localStorage.setItem(this.themeKey, 'dark');
  //       }
  //     } else {
  //       document.body.classList.add(this.lightThemeClass);
  //       document.body.classList.remove(this.darkThemeClass);
  //       if (isPlatformBrowser(this.platformId)){
  //         localStorage.setItem(this.themeKey, 'light');
  //       }
  //     }
  //   }
  // }
  private loadTheme(): void {

    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {

      if (typeof localStorage !== 'undefined') {
        const storedTheme = localStorage.getItem(this.themeKey);
        const theme = storedTheme || 'dark';

        const isDark = theme === 'dark';

        this.darkMode.next(isDark);

        document.body.classList.toggle(this.darkThemeClass, isDark);
        document.body.classList.toggle(this.lightThemeClass, !isDark);
      }
    }

  }

  setDarkTheme(isDarkTheme: boolean): void {

    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.darkMode.next(isDarkTheme);
    if (isPlatformBrowser(this.platformId)) {

      if (typeof localStorage !== 'undefined') {
        document.body.classList.toggle(this.darkThemeClass, isDarkTheme);
        document.body.classList.toggle(this.lightThemeClass, !isDarkTheme);

        localStorage.setItem(
          this.themeKey,
          isDarkTheme ? 'dark' : 'light'
        );
      }
    }

  }

  getTheme(): string {
    return this.themeSubject.getValue();
  }


  setDefaultDarkTheme(): void {
    let theme = 'dark';
    if (isPlatformBrowser(this.platformId)) {
      if (isPlatformBrowser(this.platformId)) {
        theme = String(localStorage.getItem(this.themeKey));
        if (theme == "null" || theme == null) {
          theme = 'dark';
        }
      }
      if (theme == "null" || theme == null) {
        theme = 'dark';
      }
      console.info('setDefaultDarkTheme returns ' + theme, theme)
      if (theme != 'light' && typeof theme === undefined || theme == null) {
        this.darkMode.next(true);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.themeKey, 'dark');
        }
      }
    }
  }



}