import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'delete-profile',
  templateUrl: './delete-profile.component.html',
  styleUrls: ['./delete-profile.component.scss']
})
export class DeleteProfileComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  deleteConfirmed() {
    this.dialogRef.close({ action: 'delete-confirmed' });
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
