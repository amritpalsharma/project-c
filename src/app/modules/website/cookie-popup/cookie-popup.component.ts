import { Component, OnInit } from '@angular/core';

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
  

  ngOnInit() {
    this.checkCookieConsent(); // Check if cookie consent is already given
    this.loadPermissionsFromStorage(); // Load saved preferences from localStorage
  }

  checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

    if (consent && consentTimestamp) {
      const now = new Date().getTime();
      const timestamp = parseInt(consentTimestamp, 10);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      if (now - timestamp < thirtyDays) {
        return; // Don't show the popup if it's within 30 days
      }
    }

    this.showPopup = true;
  }

  acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted'); // Save consent as accepted
    localStorage.setItem('cookieConsentTimestamp', new Date().getTime().toString()); // Save timestamp
    this.showPopup = false; // Hide the popup
  }

  declineCookies() {
    localStorage.setItem('cookieConsent', 'declined'); // Save consent as declined
    localStorage.setItem('cookieConsentTimestamp', new Date().getTime().toString()); // Save timestamp
    this.showPopup = false; // Hide the popup
  }

  personalizeChoices() {
    this.showPopup = false; // Close the cookie popup when personalization box opens
    this.showPersonalizationBox = true; // Show personalization options
  }

  allowAll() {
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
    localStorage.setItem('cookiePreferences', JSON.stringify(this.permissions)); // Save the permissions preferences to localStorage
    this.acceptCookies(); // Accept cookies and save the timestamp
    this.showPersonalizationBox = false; // Hide personalization box after saving preferences
  }

  loadPermissionsFromStorage() {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      this.permissions = JSON.parse(savedPreferences); // Load the saved preferences and update the permissions array
    }
  }
}
