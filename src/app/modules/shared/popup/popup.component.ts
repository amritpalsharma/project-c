import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {

  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
  ){}

  theme : any = localStorage.getItem('theme');

  ngOnInit(){
    this.theme = localStorage.getItem('theme');
  }

  close(){
    this.dialogRef.close();
  }
}
