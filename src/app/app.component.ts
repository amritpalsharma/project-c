// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Changed to styleUrls
})
export class AppComponent implements OnInit {
  title = 'Project-c';
  showContent: boolean = false; // Control when to show the main content
  showHeader = true;
  showFooter = true;

  constructor(
    private translateService: TranslateService,
    private router: Router
  ) {
    this.translateService.setDefaultLang('en'); // Set default language
    this.translateService.use(localStorage.getItem('lang') || 'en');
    
    // Listen to router events to check route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateVisibility(); // Update visibility when route changes
    });
  }

  ngOnInit() {
    // Check if the logout message flag is set
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
      console.log('Token successfully removed from local storage.');

      // Clear the message after 10 seconds
      setTimeout(() => {
        console.clear();
        localStorage.removeItem('logoutMessage');
      }, 10000);
    }
  }

  onCookiesAccepted() {
    // Logic to handle what happens when cookies are accepted
    console.log('Cookies have been accepted.');
    this.showContent = true; // Show the main content after accepting cookies
  }

  // Method to determine if the route is within the WebsiteModule
  private updateVisibility() {
    const currentRoute = this.router.url;

    // Assuming 'website' is part of the route for WebsiteModule
    if ( currentRoute.startsWith('/admin') ||
    currentRoute.startsWith('/material') ||
    currentRoute.startsWith('/scout') ||
    currentRoute === '/') {
      this.showHeader = true;
      this.showFooter = true;
    } else {
      this.showHeader = false;
      this.showFooter = false;
    }
  }
}
