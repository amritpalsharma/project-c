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
      name: 'Allow Advertising Permissions', 
      description: 'I am allowing Advertising Permissions. New Advertising Permissions will be enabled by default.', 
      enabled: false 
    },
    { 
      name: 'Strictly Necessary Permissions', 
      description: 'These tools are necessary for the app to function and thus You cannot switch this off.',
      enabled: true,
      readOnly: true // Marking it as read-only
    },
    { 
      name: 'Google Analytics', 
      description: 'I am allowing Analytics Permissions. New Analytics Permissions will be enabled by default.',
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
