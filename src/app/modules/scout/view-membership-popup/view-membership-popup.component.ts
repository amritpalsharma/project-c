import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-membership-popup',
  templateUrl: './view-membership-popup.component.html',
  styleUrl: './view-membership-popup.component.scss'
})
export class ViewMembershipPopupComponent {
  
  plan:any;
  constructor(public dialogRef : MatDialogRef<ViewMembershipPopupComponent>, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.plan = { ...this.data };
    console.log(this.plan)
  }

  onCancel(): void {
    console.log("Popup closed");
    this.dialogRef.close();  
  }

  strUpperCase(str: string) {
    let upperStr = str.toUpperCase();
    return upperStr;
  }
  capitalizeFirstLetter(str: string) {
    if (str.length === 0) return str;  // Handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
