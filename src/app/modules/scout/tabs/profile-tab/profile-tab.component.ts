import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditGeneralDetailsComponent } from '../../edit-general-details/edit-general-details.component';
import { TalentService } from '../../../../services/talent.service';
import { ScoutService } from '../../../../services/scout.service';
import { UserService } from '../../../../services/user.service';
import { AddRepresentatorPopupComponent } from '../../add-representator-popup/add-representator-popup.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { ResetPasswordComponent } from '../../../shared/reset-password/reset-password.component';

@Component({
  selector: 'scout-profile-tab',
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
  representators:any = [];
  baseUrl : any;
  @Input() userData: any;
  @Input() isPremium: any;
  userId:any = "";
  idsToDelete:any = "";

  constructor( public dialog: MatDialog,private scoutService: ScoutService, private userService : UserService) {
    // If you want to load the user data from localStorage during initialization
  }

  ngOnInit(): void {
    this.user = this.userData;

    this.getRepresentators();
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

    this.getMainPosition();
    this.getOtherPositions();
  }


  getRepresentators(){
    this.scoutService.getRepresentators().subscribe((response)=>{
      if (response && response.status && response.data) {
        this.representators = response.data.representators;
        this.baseUrl = response.data.uploads_path
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


  addRepresentator(){
    const dialog = this.dialog.open(AddRepresentatorPopupComponent,{
      height: '400',
      width: '400px',
      data : {
        action: 'add',
        userId: this.userId
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "added"){
          this.getRepresentators();
          this.showMatDialog(result.message,'display');
          // this.showMatDialog("Invite sent successfully.",'display');
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  updateRepresentatorRole(event: Event, id:any) {
    const target = event.target as HTMLSelectElement;
    let newRole = target.value;

    this.userService.updateRepresentatorRole(id, {site_role:newRole}).subscribe((response)=>{
      if (response && response.status) {
        this.showMatDialog("Role updated successfully.",'display');
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  editRepresentator(representator:any){
    const editDialog = this.dialog.open(AddRepresentatorPopupComponent,{
      height: '400',
      width: '400px',
      data : {
        action: 'edit',
        userId: "",
        representator: representator
      }
    });

    editDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "updated"){
          this.getRepresentators();
          this.showMatDialog("Representator updated successfully.",'display');
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  confirmSingleDeletion(id:any){
    this.idsToDelete = id;
    this.showMatDialog("", "delete-representator-confirmation");
  }

  deleteRepresentator():any {

    this.userService.deleteRepresentator(this.idsToDelete).subscribe(
      response => {
        if(response.status){
          this.getRepresentators();
          this.showMatDialog('Representator removed successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing Representator. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting user:', error);

      }
    );
  }

  showMatDialog(message:string, action:string){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deleteRepresentator();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }


  getMetaValue(stringifyData:any, key:any):any{
    if(stringifyData){
      stringifyData = JSON.parse(stringifyData);
      if(stringifyData[key]){
        return stringifyData[key];
      }else{
        return "NA";
      }
    }else{
      return "NA";
    }
  }

}
