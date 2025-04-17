import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrl: './message-popup.component.scss'
})
export class MessagePopupComponent {
  constructor(public dialogRef : MatDialogRef<MessagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  theme: any =localStorage.getItem('theme');

  ngOnIt(){
    this.theme = localStorage.getItem('theme');
  }

  deleteConfirmed(){
    this.dialogRef.close({
      action: "delete-confirmed"
    });
  }

  close() {
    this.dialogRef.close();
  }
}
