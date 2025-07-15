import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalSettingsService } from '../../../../../services/global-settings.service';

@Component({
  selector: 'view-user-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.scss']
})
export class GeneralDetailsComponent {

  user: any = {};
  userNationalities: any = [];
  positions: any = [];
  position: any;
  mainPosition: any;
  otherPositions: any;

  @Input() userData: any;
  @Input() isPremium: any;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private globalSetting: GlobalSettingsService
  ) { }

  ngOnInit(): void {
    this.user = this.userData;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      // Update the user object with the latest userData
      this.user = changes['userData'].currentValue;

      // Check if user_nationalities exist and parse it
      if (this.user && this.user.user_nationalities) {
        try {
          this.userNationalities = JSON.parse(this.user.user_nationalities);
        } catch (error) {
          console.error('Invalid JSON in user_nationalities:', this.user.user_nationalities, error);
          this.userNationalities = [];
        }
      }

      this.getMainPosition();
      this.getOtherPositions();
    }
  }

  calculateAge(dob: string | Date): number {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  // Function to get the main position from the array
  getMainPosition() {
    if (this.user && this.user.positions) {
      try {
        this.positions = JSON.parse(this.user.positions);
        const mainPosition = this.positions.find((pos: any) => pos.main_position === 1);
        this.position = mainPosition ? mainPosition.position_name : null;
      } catch (error) {
        console.error('Invalid JSON in positions:', this.user.positions, error);
        this.positions = [];
        this.position = null;
      }
    }
  }

  // Function to get other positions from the array
  getOtherPositions() {
    if (this.positions) {
      // const otherPositions = this.positions
      //   .filter((pos: any) => pos.main_position == null)
      //   .map((pos: any) => pos.position_name)
      //   .join('<br>');

      // this.otherPositions = otherPositions ? `${otherPositions}` : '';

      this.otherPositions = this.positions
        .filter((pos: any) => pos.main_position == null)
        .map((pos: any) => `<li>${pos.position_name}</li>`)
        .join('');

      // Then wrap the list items in <ul> tags
      this.otherPositions = `<ul class="player_positions_lising">${this.otherPositions}</ul>`;
    } else {
      this.otherPositions = '';
    }
  }
  navigateToPlans() {
    const pathname = window.location.pathname;
    const regex = /^\/view\/(talent|scout|club)\/(\d+)$/;
    const match = pathname.match(regex);
    if (match) {
      const role = match[1];
      if (['talent', 'scout', 'club'].includes(role)) {
        this.router.navigate([`/${role}/plans`]);
      }
    }
  }

  numberFormatStyle(amount: any) {
    let domainID = this.globalSetting.getdomainId();
    let currency = this.globalSetting.getDomainCurrency();
    let currencySymbol;
    if (currency == 'GBP') {
      currencySymbol = '£';
    } else if (currency == 'CHF') {
      currencySymbol = 'CHF';
    } else if (currency == 'EUR') {
      currencySymbol = '€';
    } else if (currency == 'DKK') {
      currencySymbol = 'DKK';
    } else if (currency == 'SEK') {
      currencySymbol = 'SEK';
    }

    let locale;
    locale = 'de-CH';
    // if (domainID == 1) {
    //   locale = 'de-CH';
    // } else if (domainID == 2) {
    //   locale = 'de-DE';
    // } else if (domainID == 3) {
    //   locale = 'it-IT';
    // } else if (domainID == 4) {
    //   locale = 'fr-FR';
    // } else if (domainID == 5) {
    //   locale = 'en-GB';
    // } else if (domainID == 6) {
    //   locale = 'es-ES';
    // } else if (domainID == 7) {
    //   locale = 'pt-PT';
    // } else if (domainID == 8) {
    //   locale = 'nl-BE';
    // } else if (domainID == 9) {
    //   locale = 'da-DK';
    // } else if (domainID == 10) {
    //   locale = 'sv-SE';
    // }
    // getdomainId
    currencySymbol = '£';
    let modifiedAmount = new Intl.NumberFormat(locale).format(amount);
    if (amount > 0) {
      return currencySymbol + ' ' + modifiedAmount;
    } else {
      return '';
    }
  }
}
