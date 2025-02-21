import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditGeneralDetailsComponent } from '../../edit-general-details/edit-general-details.component';
import { TalentService } from '../../../../services/talent.service';
import { ResetPasswordComponent } from '../../../shared/reset-password/reset-password.component';

@Component({
  selector: 'talent-profile-tab',
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss'
})
export class ProfileTabComponent {
  user:any = {}
  userNationalities:any = [];
  positions:any = [];
  position:any;
  mainPosition : any;
  otherPositions : any;

  @Input() userData: any;
  @Input() isPremium: any;

  constructor( public dialog: MatDialog,private talentService: TalentService) { 
    // If you want to load the user data from localStorage during initialization    
  }

  ngOnInit(): void {
    this.user = this.userData;
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
        this.getUserProfile()
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
            // Find the main position object with main_position set to 1
            this.mainPosition = this.positions?.find((pos: any) => pos.main_position == 1)?.position_name;
        } catch (error) {
            console.error("Error parsing positions JSON:", error);
            this.positions = []; // Set to an empty array if parsing fails
            this.mainPosition = undefined; // Reset main position if parsing fails
        }
    } else {
        // Handle case when positions is undefined or empty
        this.positions = [];
        this.mainPosition = undefined;
    }
  }


  // Function to get other positions from the array
  getOtherPositions() {
    this.otherPositions = this.positions
      .filter((pos : any) => pos.main_position == null)
      .map((pos : any) => pos.position_name)
      .join('/');
  }
}
