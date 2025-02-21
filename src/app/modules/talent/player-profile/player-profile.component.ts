import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewMembershipPopupComponent } from '../view-membership-popup/view-membership-popup.component';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.scss'
})
export class PlayerProfileComponent {
    
  user:any;
  userData:any
  userNationalities: any = [];
  positions: any = [];

  constructor(public dialogRef : MatDialogRef<ViewMembershipPopupComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.user = { ...this.data };
    this.user = this.user.user;
    if(this.user.meta){
      this.userData = JSON.parse(this.user.meta);  
      this.userNationalities = JSON.parse(this.user.user_nationalities);
      console.log(this.userData)
    }
    if(this.user.positions){
      this.positions = JSON.parse(this.user.positions);
    }
    console.log(this.user)
  }

  onCancel(): void {
    console.log("Popup closed");
    this.dialogRef.close();  
  }

}
