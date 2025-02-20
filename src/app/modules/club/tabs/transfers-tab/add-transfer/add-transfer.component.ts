import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-transfer',
  templateUrl: './add-transfer.component.html',
  styleUrl: './add-transfer.component.scss'
})
export class AddTransferComponent {
  teams: any;  // Assume you get this data from a service
  transfer: any;  // Assume you get this data from a service

  constructor(
    public dialogRef: MatDialogRef<AddTransferComponent>,
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

      this.talentService.addTransfer(myForm.value).subscribe(
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
