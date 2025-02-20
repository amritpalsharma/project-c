import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  isDarkTheme = this.darkMode.asObservable();
  private readonly themeKey = 'theme';
  private readonly darkThemeClass = 'dark-theme';
  private readonly lightThemeClass = 'light-theme';

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    const theme = localStorage.getItem(this.themeKey);
    if (theme === 'dark') {
      this.darkMode.next(true);
      document.body.classList.add(this.darkThemeClass);
      document.body.classList.remove(this.lightThemeClass);
    } else {
      this.darkMode.next(false);
      document.body.classList.add(this.lightThemeClass);
      document.body.classList.remove(this.darkThemeClass);
    }
  }

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkMode.next(isDarkTheme);
    if (isDarkTheme) {
      document.body.classList.add(this.darkThemeClass);
      document.body.classList.remove(this.lightThemeClass);
      localStorage.setItem(this.themeKey, 'dark');
    } else {
      document.body.classList.add(this.lightThemeClass);
      document.body.classList.remove(this.darkThemeClass);
      localStorage.setItem(this.themeKey, 'light');
    }
  }
}