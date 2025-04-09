import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-unverified-user',
  templateUrl: './unverified-user.component.html',
  styleUrl: './unverified-user.component.scss'
})
export class UnverifiedUserComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UnverifiedUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  showPopup: boolean = false;

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization
  }
  close() {
    this.dialogRef.close();
  }
}
