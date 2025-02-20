import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';

import { UserService } from '../../../../services/user.service';
@Component({
  selector: 'app-scout-player-view-popup',
  templateUrl: './scout-player-view-popup.component.html',
  styleUrl: './scout-player-view-popup.component.scss'
})
export class ScoutPlayerViewPopupComponent {

  userId:any = "";
  player:any = {};
  isLoading: boolean = false;
  userNationalities:any = [];
  constructor(public dialogRef : MatDialogRef<ScoutPlayerViewPopupComponent>, private userService:UserService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.userId = data.playerId
  }

  ngOnInit(): void {
    this.getUserProfile(this.userId);
  }

  getUserProfile(userId:any){
    this.isLoading = true;
    try {
      this.userService.getProfileData(userId).subscribe((response)=>{
        if (response && response.status && response.data && response.data.user_data) {
          this.player = response.data.user_data; 
          this.userNationalities = JSON.parse(this.player.user_nationalities);
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  close() {
    this.dialogRef.close();
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
}
