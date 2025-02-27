// message-popup.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'shared-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.scss']
})
export class MessagePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<MessagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  deleteConfirmed() {
    this.dialogRef.close({ action: 'delete-confirmed' });
  }
  newsletterConfirmed(){
    this.dialogRef.close({ action: 'newsletter-confirmed' });
  }
  activityConfirmed(){
    this.dialogRef.close({ action: 'activity-delete-confirmed' });
  }
  close() {
    this.dialogRef.close();
  }
}
