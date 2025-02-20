import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent {

  constructor(public dialogRef: MatDialogRef<DeletePopupComponent>) {}

  confirmDelete(): void {
    // Close the dialog and return true (confirm deletion)
    this.dialogRef.close(true);
  }

  cancel(): void {
    // Close the dialog without any action (cancel deletion)
    this.dialogRef.close(false);
  }
}
