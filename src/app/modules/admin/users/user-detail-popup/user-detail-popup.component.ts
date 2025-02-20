import { Component,Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '../../../../services/socket.service';

@Component({
  selector: 'app-user-detail-popup',
  templateUrl: './user-detail-popup.component.html',
  styleUrl: './user-detail-popup.component.scss'
})
export class UserDetailPopupComponent {
  updatedData: any;
  selectedOption: any = "";
 
  constructor(private router: Router, private socketService: SocketService,
    public dialogRef : MatDialogRef<UserDetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public user: any) {
    console.log('edit user', user); 
 
    }
  close() {
    this.dialogRef.close();
  }

  save() {
    console.log("event is", this.selectedOption, typeof(this.selectedOption));

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
        let userData = JSON.parse(jsonData);
        userId = userData.id;
    }
    else{
      console.log("No data found in localStorage.");
    }

    const receiverIds = [this.user.id];

    if(this.selectedOption==="3"){
      this.socketService.emit("userRejected", {senderId: userId, receiverIds});
    }
    else{
      this.socketService.emit("userVerified", {senderId: userId, receiverIds});
    }

    this.dialogRef.close({user: this.user.id, status: this.selectedOption});
  }

  closePopup(slug:string, id:Number): void {

    let pageRoute = 'admin/'+slug.toLowerCase();
    // Navigate to User-detail with query parameter
    this.dialogRef.close(); 
    this.router.navigate([pageRoute, id]);
  }

  onSelectionChange(event: Event): void {
    this.selectedOption = (event.target as HTMLInputElement).value;
  }

}
