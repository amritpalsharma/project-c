import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-membership-popup',
  templateUrl: './view-membership-popup.component.html',
  styleUrl: './view-membership-popup.component.scss',
  providers: [DatePipe]  // Add DatePipe as a provider
})

export class ViewMembershipPopupComponent {
  todayDate: any;
  
  plan:any;
  constructor(public dialogRef : MatDialogRef<ViewMembershipPopupComponent>,public dialog: MatDialog,private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit() {
    // Get today's date and format it
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate, 'dd.MM.yyyy'); // 'dd.MM.yyyy' is the format you can adjust as needed
    
    this.plan = { ...this.data };
    console.log(this.plan)
  }

  onCancel(): void {
    console.log("Popup closed");
    this.dialogRef.close();  
  }
}
