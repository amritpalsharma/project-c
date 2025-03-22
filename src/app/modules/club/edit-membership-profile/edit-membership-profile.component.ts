import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ScoutService } from '../../../services/scout.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-edit-membership-profile',
  templateUrl: './edit-membership-profile.component.html',
  styleUrls: ['./edit-membership-profile.component.scss']
})
export class EditMembershipProfileComponent {

  isLoadingCheckout: boolean = false;
  stripe: any;
  // @Input() audiences = [
  //   { role_name: "Clubs", id: 2 },
  //   { role_name: "Scouts", id: 3 },
  //   { role_name: "Player", id: 4 },
  // ];     // List of all audiences

  audiences : any[] = [
    { role_name: "Club", target_role: 2 },
    { role_name: "Scout", target_role: 3 },
    { role_name: "Talent", target_role: 4 },
  ];

  selectedAudienceIds: number[] = []; // Store only audience IDs
  id: any;
  loggedInUser: any = localStorage.getItem('userInfo');
  stats: any;
  selectedAudiences:any;
  isLoading : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditMembershipProfileComponent>,
    public scoutService: ScoutService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private userServices: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.stats = this.data.stats;

    this.selectedAudiences = this.stats?.booster_audience;

    this.loggedInUser = JSON.parse(this.loggedInUser);
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

  }

  getRoles(){
    this.userServices.getRoles().subscribe(
      (response) => {
        if (response?.status) {
          // this.audiences = [];
          response.data.roles.forEach((element : any) => {
            if(element.id == '2' || element.id == '3' || element.id == '4'){
              let obj = {role_name: '', target_role: 0};
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
  }

  /**
   * Removes an audience from the selection when the cross button is clicked
   * @param audienceId - ID of the audience to remove
   */
  removeAudience(audienceId: number): void {
    // Remove ID from selectedAudienceIds
    this.selectedAudienceIds = this.selectedAudienceIds.filter(
      (target_role) => target_role !== audienceId
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
    return this.selectedAudiences.filter((audience:any) => this.selectedAudienceIds.includes(audience.id));
  }


  saveBoost(): void {
    this.isLoading = true; // Set loading state

    let langId: any = localStorage.getItem('lang_id');

    try {
      // Make API call to save the booster audience
      this.scoutService.updateBoosterAudience(this.selectedAudienceIds, langId).subscribe(
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

}
