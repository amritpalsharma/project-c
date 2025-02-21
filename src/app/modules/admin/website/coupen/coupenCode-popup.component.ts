import { Component, inject,  } from '@angular/core';
import {
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-templates',
  templateUrl: './coupenCode-popup.component.html',
  styleUrl: './coupenCode-popup.component.scss'
})
export class CoupenCodePopupComponent   {

  constructor(
    public dialogRef: MatDialogRef<CoupenCodePopupComponent>
  ) {}

  close(): void {
    console.log('Close button clicked');
    this.dialogRef.close();
  }
  

}
