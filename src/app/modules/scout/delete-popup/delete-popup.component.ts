import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent {
  theme : any = localStorage.getItem('theme');

  constructor(public dialogRef: MatDialogRef<DeletePopupComponent>) {}

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
  }

  confirmDelete(): void {
    // Close the dialog and return true (confirm deletion)
    this.dialogRef.close(true);
  }

  cancel(): void {
    // Close the dialog without any action (cancel deletion)
    this.dialogRef.close(false);
  }
}
