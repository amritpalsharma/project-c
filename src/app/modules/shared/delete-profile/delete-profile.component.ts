import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'delete-profile',
  templateUrl: './delete-profile.component.html',
  styleUrls: ['./delete-profile.component.scss']
})
export class DeleteProfileComponent {
  deleteAccount: string = '';
  isShowErrorMsg: boolean = false;
  errorMsg: string = 'Values do not match. Please confirm your spelling.';
  constructor(
    public dialogRef: MatDialogRef<DeleteProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  deleteProfileConfirmed() {
    if (this.deleteAccount === 'DELETE') {
      this.isShowErrorMsg = false;
      this.dialogRef.close({ action: 'delete-profile-confirmed' });
    } else {
      this.isShowErrorMsg = true;
    }
  }
  newsletterConfirmed() {
    this.dialogRef.close({ action: 'newsletter-confirmed' });
  }
  activityConfirmed() {
    this.dialogRef.close({ action: 'activity-delete-confirmed' });
  }
  close() {
    this.dialogRef.close();
  }
}
