import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-unverified-user',
  templateUrl: './unverified-user.component.html',
  styleUrl: './unverified-user.component.scss'
})
export class UnverifiedUserComponent implements OnInit {
  isLoading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<UnverifiedUserComponent>,
    public socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      // console.info('result',result)
      if (result == 2) {
        this.isLoading = false;
        this.close();
      }
    });
  }


  showPopup: boolean = false;

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization


  }
  close() {
    this.dialogRef.close();
  }
}
