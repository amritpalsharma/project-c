import { Component, inject,  } from '@angular/core';
import {
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-AdvertisingPopupComponent',
  templateUrl: './advertising-popup.component.html',
  styleUrl: './advertising-popup.component.scss'
})
export class AdvertisingPopupComponent   {

  constructor(
    public dialogRef: MatDialogRef<AdvertisingPopupComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

}
