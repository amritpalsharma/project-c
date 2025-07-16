import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditGeneralDetailsComponent } from '../../edit-general-details/edit-general-details.component';
import { TalentService } from '../../../../services/talent.service';
import { ResetPasswordComponent } from '../../../shared/reset-password/reset-password.component';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'talent-profile-tab',
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss'
})
export class ProfileTabComponent {
  user: any = {}
  userNationalities: any = [];
  positions: any = [];
  position: any;
  mainPosition: any;
  otherPositions: any;

  @Input() userData: any;
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  isMainPositionFound: boolean = false;

  constructor(
    public globalSetting: GlobalSettingsService,
    public dialog: MatDialog,
    private talentService: TalentService,
    private translate: TranslateService,
    private router: Router) {
    // If you want to load the user data from localStorage during initialization    
    translate.onLangChange.subscribe(() => {
      this.getUserProfile();
    });
  }

  ngOnInit(): void {
    this.user = this.userData;
    // console.info('this.user',this.user)
    this.getUserProfile();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      // Update the user object with the latest userData
      this.user = changes['userData'].currentValue;

      // Check if user_nationalities exist and parse it
      if (this.user && this.user.user_nationalities) {
        this.userNationalities = JSON.parse(this.user.user_nationalities);
      }

    }
    if (changes['user']) {
      // Update the user object with the latest userData
      this.user = changes['user'].currentValue;

      // Check if user_nationalities exist and parse it
      if (this.user && this.user.user_nationalities) {
        this.userNationalities = JSON.parse(this.user.user_nationalities);
      }

    }
    // if (changes['mainPosition']) {
    //   // Update the mainPosition object with the latest mainPositionData
    //   this.mainPosition = changes['mainPosition'].currentValue;
    // }

    this.getMainPosition();
    this.getOtherPositions();
  }


  calculateAge(dob: string | Date): number {
    // Convert the input date to a Date object if it's a string
    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust the age if the current date is before the birthday
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  getUserProfile() {
    try {
      this.talentService.getProfileData().subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {

          localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));

          this.user = response.data.user_data;
          if (this.user.positions != undefined && this.user.positions != '') {
            this.userData.positions = this.user.positions;
          }
          // Check if user_nationalities exist and parse it
          if (this.user && this.user.user_nationalities) {
            this.userNationalities = JSON.parse(this.user.user_nationalities);
          }

          this.getMainPosition();
          this.getOtherPositions();
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  openEditGeneralDialog() {

    const dialogRef = this.dialog.open(EditGeneralDetailsComponent, {
      width: '870px',
      data: { user: this.user }  // Corrected data passing      
    });


    dialogRef.afterClosed().subscribe(result => {
      setTimeout(() => {
        this.getUserProfile();
      }, 1500);
    });
  }

  openResetDialog() {

    const dialogRef = this.dialog.open(ResetPasswordComponent, {
      width: '600px',
      data: {
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User saved:', this.userData);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  // Function to get the main position from the array
  getMainPosition() {

    // Check if positions exist and are valid JSON before parsing
    if (this.userData?.positions) {
      try {
        // Parse the JSON string only if it's defined
        this.positions = JSON.parse(this.userData.positions);
        console.log(this.positions)
        // Find the main position object with main_position set to 1
        this.mainPosition = this.positions?.find((pos: any) => pos.main_position == 1)?.position_name;
        this.isMainPositionFound = true;
      } catch (error) {
        console.error("Error parsing positions JSON:", error);
        this.positions = []; // Set to an empty array if parsing fails
        this.mainPosition = undefined; // Reset main position if parsing fails
        this.isMainPositionFound = false;
      }
    } else {
      // Handle case when positions is undefined or empty
      this.positions = [];
      this.mainPosition = undefined;
      this.isMainPositionFound = false;
    }
  }


  // Function to get other positions from the array
  getOtherPositions() {
    // this.otherPositions = this.positions
    //   .filter((pos: any) => pos.main_position == null)
    //   .map((pos: any) => pos.position_name)
    //   .join('<br>');

    this.otherPositions = this.positions
      .filter((pos: any) => pos.main_position == null)
      .map((pos: any) => `<li>${pos.position_name}</li>`)
      .join('');

    // Then wrap the list items in <ul> tags
    this.otherPositions = `<ul class="player_positions_lising">${this.otherPositions}</ul>`;

  }



  navigatePlans() {
    this.router.navigate(['/talent/plans']);
  }

  showVerificationPopup() {
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
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
    currencySymbol = '€'; // deafult
    let modifiedAmount = new Intl.NumberFormat(locale).format(amount);
    if (amount > 0) {
      return currencySymbol + ' ' + modifiedAmount;
    } else {
      return '';
    }
  }
}
