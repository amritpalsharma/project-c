import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { PaymentService } from '../../../services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { CommonDataService } from '../../../services/common-data.service';

@Component({
  selector: 'app-edit-membership-profile',
  templateUrl: './edit-membership-profile.component.html',
  styleUrls: ['./edit-membership-profile.component.scss']
})
export class EditMembershipProfileComponent {

  isLoadingCheckout: boolean = false;
  isValidBirthDate: boolean = false;
  stripe: any;
  // @Input() audiences = [
  //   { role_name: "Clubs", id: 2 },
  //   { role_name: "Scouts", id: 3 },
  //   { role_name: "Talent", id: 4 },
  // ];     // List of all audiences

  audiences: any[] = [];

  selectedAudienceIds: number[] = []; // Store only audience IDs
  id: any;
  loggedInUser: any = localStorage.getItem('userInfo');
  stats: any;
  selectedAudiences: any;
  isLoading: boolean = false;
  date_of_birth: any = '';

  profileImgUrl: any = "../../../../assets/images/default/talent-profile-default.png";
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  current_club_logo: string = '';
  constructor(
    public dialogRef: MatDialogRef<EditMembershipProfileComponent>,
    public talentService: TalentService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private userServices: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private commonDataService: CommonDataService,
  ) { }

  theme: any = localStorage.getItem('theme');
  userNationality: string = '';

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.stats = this.data.stats;

    // this.selectedAudiences = this.stats?.booster_audience;

    this.loggedInUser = JSON.parse(this.loggedInUser);


    this.profileImgUrl = this.commonDataService.getCurrentProfileImage();
    console.info('this.profileImgUrl', this.profileImgUrl)

    console.info('Details ', this.loggedInUser)
    // this.getUserProfile();
    if (this.loggedInUser.meta && this.loggedInUser.meta.date_of_birth != '') {
      //  console.warn(this.loggedInUser)

      this.date_of_birth = this.calculateAge(this.loggedInUser.meta.date_of_birth);
      // alert(this.date_of_birth)
      if (this.date_of_birth != undefined && this.date_of_birth != 'invalid date' && this.date_of_birth > 0) {
        this.isValidBirthDate = true;
      }
    }
    // 
    let userNationalities = JSON.parse(this.loggedInUser?.user_nationalities);
    this.userNationality = userNationalities[0]?.flag_path ? userNationalities[0]?.flag_path : '';

    this.id = this.data.id || [];

    this.getRoles();
    // Populate pre-selected audiences from input data
    if (this.stats?.booster_audience?.length > 0) {
      this.selectedAudiences = this.data.stats.booster_audience;
      this.selectedAudienceIds = this.selectedAudiences.map(
        (audience: any) => Number(audience.target_role)
      );
    }
    // console.log('Pre-selected Audience IDs:', this.selectedAudienceIds,'this_stats_booster_audience',this.stats?.booster_audience);

    // console.log('audiences:', this.audiences);




    if (this.loggedInUser?.custom_club_info && this.loggedInUser?.custom_club_info != '') {
      let custom_club_info = JSON.parse(this.loggedInUser?.custom_club_info);
      console.info("custom_club_info", custom_club_info)
      this.current_club_logo = 'no-logo';
    }

    if (this.loggedInUser?.registered_club_info && this.loggedInUser?.registered_club_info != '') {
      let registered_club_info = JSON.parse(this.loggedInUser?.registered_club_info);
      console.info("registered_club_info", registered_club_info)
      this.current_club_logo = registered_club_info.club_logo;
    }

    if (typeof this.loggedInUser?.current_club_info !== undefined && this.loggedInUser?.current_club_info != '' && this.loggedInUser?.current_club_info != null) {
      let registedClubArr = JSON.parse(this.loggedInUser?.current_club_info)
      console.info("registered_club_info", registedClubArr)
      this.current_club_logo = registedClubArr.club_logo;
    }


  }

  getRoles() {
    this.userServices.getRoles().subscribe(
      (response) => {
        if (response?.status) {
          // this.audiences = [];
          response.data.roles.forEach((element: any) => {
            if (element.id == '2' || element.id == '3' || element.id == '4') {
              let obj = { role_name: '', target_role: 0 };
              obj.role_name = element.role_name;
              obj.target_role = Number(element.id);
              this.audiences.push(obj);
            }
          });
        }
      },
      (error) => {
        // Error: Notify user and handle error
        this.toastr.error('An error occurred while saving the boost. Please try again.', 'Error');
        console.error('Error creating Checkout session:', error);
      }
    );
  }

  /**
   * Updates `selectedAudiences` whenever selection changes in `mat-select`
   */
  updateSelectedAudiences(): void {
    this.selectedAudiences = this.audiences.filter((audience) =>
      this.selectedAudienceIds.includes(audience.target_role)
    );
    console.log(this.selectedAudiences);
  }

  /**
   * Removes an audience from the selection when the cross button is clicked
   * @param audienceId - ID of the audience to remove
   */
  removeAudience(audienceId: number): void {
    console.log(this.selectedAudiences, this.selectedAudienceIds, audienceId)
    // Remove ID from selectedAudienceIds
    this.selectedAudienceIds = this.selectedAudienceIds.filter(
      (target_role) => target_role != audienceId
    );

    // Update the displayed selected audiences
    this.updateSelectedAudiences();
  }


  // Apply the selected audiences filter
  applyFilter() {
    console.log("Selected Audiences:", this.selectedAudienceIds);
  }

  pauseBoost() {
    this.dialogRef.close();
  }

  // Handle checkbox selection and store only the IDs
  toggleAudienceSelection(audienceId: number, event: any) {
    if (event.target.checked) {
      // Add the ID if checked
      this.selectedAudienceIds.push(audienceId);
    } else {
      // Remove the ID if unchecked
      this.selectedAudienceIds = this.selectedAudienceIds.filter(id => id !== audienceId);
    }
  }

  // Get selected audience roles by matching the selected IDs
  getSelectedAudienceRoles() {
    return this.selectedAudiences.filter((audience: any) => this.selectedAudienceIds.includes(audience.id));
  }


  saveBoost(): void {
    this.isLoading = true; // Set loading state

    let langId: any = localStorage.getItem('lang_id');

    try {
      // this.selectedAudiences
      // Make API call to save the booster audience
      // this.talentService.updateBoosterAudience(this.selectedAudienceIds, langId).subscribe(
      this.talentService.updateBoosterAudience(this.selectedAudiences, langId).subscribe(
        (response) => {
          if (response?.status) {
            // Success: Notify the user and close the dialog
            this.toastr.success(response.message, 'Success');
            this.dialogRef.close(true);
          } else {
            // Failure: Notify the user about failure
            this.toastr.error('Failed to save boost. Please try again.', 'Error');
            console.error('Failed to save boost', response);
          }
        },
        (error) => {
          // Error: Notify user and handle error
          this.toastr.error('An error occurred while saving the boost. Please try again.', 'Error');
          console.error('Error creating Checkout session:', error);
        },
        () => {
          // Disable loading state after the request is complete
          this.isLoading = false;
        }
      );
    } catch (error) {
      // Catch any unexpected errors and show a message
      this.isLoading = false;
      this.toastr.error('Unexpected error occurred. Please try again later.', 'Error');
      console.error('Unexpected error during save boost:', error);
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

  naviGateToProfile(role_id: any, user_id: any) {
    let role = '';
    if (role_id == '2') {
      role = 'club';
    } else if (role_id == '3') {
      role = 'scout';
    } else if (role_id == '4') {
      role = 'talent';
    }

    if (role != '' && user_id != '') {
      this.dialogRef.close({ action: 'redirect', redirect_path: '/view/' + role, user_id: user_id, role: role });
    }
    // console.warn('ROle is '+role_id+' Id is '+user_id)
  }

  getBirthYear(dateOfBirth: any) {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);

      if (isNaN(birthDate.getTime())) {
        console.log("Invalid date of birth.");
      } else {
        const year = birthDate.getFullYear();
        return year;
        // console.log("Year of Birth:", year);
      }
    }
    return false;
  }
}
