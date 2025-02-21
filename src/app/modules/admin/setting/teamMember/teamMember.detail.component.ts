import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-teamMember',
  templateUrl: './teamMember.detail.component.html',
  styleUrl: './teamMember.detail.component.scss'
})
export class TeamMemberDetailComponent {
  constructor(
    public dialogRef: MatDialogRef<TeamMemberDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    console.log('Close button clicked');
    this.dialogRef.close();
  }
}


