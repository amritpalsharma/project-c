import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ssrDebug } from '../../../services/ssr-debug';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cookie-popup',
  templateUrl: './cookie-popup.component.html',
  styleUrls: ['./cookie-popup.component.scss']
})
export class CookiePopupComponent implements OnInit {
  showPopup: boolean = false; // Initially false
  showPersonalizationBox: boolean = false; // Flag to show personalization options

  permissions = [
    {
      name: 'permissions.allowAdvertising.name',
      description: 'permissions.allowAdvertising.description',
      enabled: false
    },
    {
      name: 'permissions.strictlyNecessary.name',
      description: 'permissions.strictlyNecessary.description',
      enabled: true,
      readOnly: true // Marking it as read-only
    },
    {
      name: 'permissions.googleAnalytics.name',
      description: 'permissions.googleAnalytics.description',
      enabled: false
    },
  ];

  disableButton: string = 'declineCookies';


  constructor(
    @Inject(PLATFORM_ID) private platformId: any

  ) { }

  ngOnInit() {
    // ssrDebug(this.platformId, 'HomeComponent');
    if (typeof window === 'undefined') {
      return;
    }
    this.checkCookieConsent(); // Check if cookie consent is already given
    this.loadPermissionsFromStorage(); // Load saved preferences from localStorage
  }

  // checkCookieConsent() {
  //   if (typeof window === 'undefined') {
  //     return;
  //   }
  //   const consent = localStorage.getItem('cookieConsent');
  //   const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

  //   if (consent && consentTimestamp) {
  //     const now = new Date().getTime();
  //     const timestamp = parseInt(consentTimestamp, 10);
  //     const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  //     if (now - timestamp < thirtyDays) {
  //       return; // Don't show the popup if it's within 30 days
  //     }
  //   }

  //   this.showPopup = true;
  // }
  checkCookieConsent() {

    if (
      typeof window === 'undefined' ||
      typeof localStorage === 'undefined'
    ) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookieConsent');

      const consentTimestamp =
        localStorage.getItem('cookieConsentTimestamp');

      if (consent && consentTimestamp) {

        const now = new Date().getTime();

        const timestamp = parseInt(consentTimestamp, 10);

        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        if (now - timestamp < thirtyDays) {
          return;
        }
      }


    }

    this.showPopup = true;

  }

  acceptCookies() {
    if (typeof window === 'undefined') {
      return;
    }
    console.log('button clicked')
    this.disableButton = 'acceptCookies';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'accepted'); // Save consent as accepted
      localStorage.setItem('cookieConsentTimestamp', new Date().getTime().toString()); // Save timestamp
    }
    this.showPopup = false; // Hide the popup
  }

  declineCookies() {
    if (typeof window === 'undefined') {
      return;
    }
    this.disableButton = 'declineCookies';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'declined'); // Save consent as declined
      localStorage.setItem('cookieConsentTimestamp', new Date().getTime().toString()); // Save timestamp
    }
    this.showPopup = false; // Hide the popup
  }

  personalizeChoices() {
    if (typeof window === 'undefined') {
      return;
    }
    this.showPopup = false; // Close the cookie popup when personalization box opens
    this.showPersonalizationBox = true; // Show personalization options
  }

  allowAll() {
    if (typeof window === 'undefined') {
      return;
    }
    this.permissions.forEach(permission => {
      if (permission.name !== 'Strictly Necessary Permissions' && !permission.readOnly) {
        permission.enabled = true; // Enable permissions except strictly necessary
      }
    });
  }

  refuseAll() {
    this.permissions.forEach(permission => {
      if (permission.name !== 'Strictly Necessary Permissions' && !permission.readOnly) {
        permission.enabled = false; // Disable all except strictly necessary
      }
    });
  }

  savePreferences() {
    if (typeof window === 'undefined') {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookiePreferences', JSON.stringify(this.permissions)); // Save the permissions preferences to localStorage
    }
    this.acceptCookies(); // Accept cookies and save the timestamp
    this.showPersonalizationBox = false; // Hide personalization box after saving preferences
  }

  loadPermissionsFromStorage() {
    if (typeof window === 'undefined') {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const savedPreferences = localStorage.getItem('cookiePreferences');
      if (savedPreferences) {
        this.permissions = JSON.parse(savedPreferences); // Load the saved preferences and update the permissions array
      }
    }
  }
}
