import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { EditGeneralDetailsComponent } from '../../edit-general-details/edit-general-details.component';
// import { TalentService } from '../../../../services/talent.service';
// import { ScoutService } from '../../../../services/scout.service';
import { UserService } from '../../../../../services/user.service';
// import { MessagePopupComponent } from '../../message-popup/message-popup.component';
// import { AddRepresentatorPopupComponent } from '../../add-representator-popup/add-representator-popup.component';
import { ClubService } from '../../../../../services/club.service';
// import { ResetPasswordComponent } from '../../../shared/reset-password/reset-password.component';
import { WebPages } from '../../../../../services/webpages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-club-profile',
  templateUrl: './club-profile.component.html',
  styleUrl: './club-profile.component.scss'
})
export class ClubProfileComponent {
  user: any = {}
  userNationalities: any = [];
  positions: any = [];
  position: any;
  mainPosition: any;
  otherPositions: any;
  representators: any = [];
  baseUrl: any;
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() currentUserId: any;

  userId: any = "";
  currentExploreuserId: any;
  idsToDelete: any = "";
  deleteRepresentorConfirmation: string = '';

  constructor(public dialog: MatDialog, private scoutService: ClubService, private userService: UserService, public webPages: WebPages, private translateService: TranslateService,) {
    // If you want to load the user data from localStorage during initialization
  }

  ngOnInit(): void {
    this.user = this.userData;
    this.currentExploreuserId = this.user.id;
    this.currentExploreuserId = this.currentUserId;
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
      this.getRepresentators();
    });
    setTimeout(() => {
      this.getRepresentators();
    }, 1500);
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
  }


  getRepresentators() {
    // alert(this.currentExploreuserId)
    // console.log(this.userData)
   
    this.userService.userGetRepresentators(this.currentExploreuserId).subscribe((response) => {
      if (response && response.status && response.data) {
        this.representators = response.data.representators;
        this.baseUrl = response.data.uploads_path
      } else if (response.data == '') {
        this.representators = [];
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
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
      this.scoutService.getProfileData().subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {

          localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));

          this.user = response.data.user_data;

          // Check if user_nationalities exist and parse it
          if (this.user && this.user.user_nationalities) {
            this.userNationalities = JSON.parse(this.user.user_nationalities);
          }

          // this.getMainPosition();
          // this.getOtherPositions();
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  
  getToasterMsg() {
    this.translateService.get([
      'deleteRepresentorConfirmation',
    ]).subscribe((translations) => {
      this.deleteRepresentorConfirmation = translations['deleteRepresentorConfirmation'];
    });
  }

  getMetaValue(stringifyData: any, key: any): any {
    if (stringifyData) {
      stringifyData = JSON.parse(stringifyData);
      if (stringifyData[key]) {
        return stringifyData[key];
      } else {
        return "NA";
      }
    } else {
      return "NA";
    }
  }
}
