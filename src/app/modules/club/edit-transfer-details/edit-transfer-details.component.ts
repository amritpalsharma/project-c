import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { TalentService } from '../../../services/talent.service';

@Component({
  selector: 'app-edit-transfer-details',
  templateUrl: './edit-transfer-details.component.html',
  styleUrls: ['./edit-transfer-details.component.scss']
})
export class EditTransferDetailsComponent {
  teams: any;  // Assume you get this data from a service
  transfer: any;  // Assume you get this data from a service

  constructor(
    public dialogRef: MatDialogRef<EditTransferDetailsComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // You might want to load your teams from a service here
    this.teams = this.data.teams;
    this.transfer = this.data.transfer;
    console.log(this.teams)
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
  
  onSubmit(myForm: NgForm): void {
    console.log('myForm submitted:', myForm.value);

    if (myForm.valid) {
      // You can prepare myForm data here, but we are directly using the myForm values in this case
      console.log('myForm submitted:', myForm.value);

      this.talentService.updateTransfer(this.transfer.id,myForm.value).subscribe(
        (response: any) => {
          console.log('myForm submitted successfully:', response);
          this.dialogRef.close(response.data);
        },
        (error: any) => {
          console.error('Error submitting the myForm:', error);
        }
      );
    }
  }
}
