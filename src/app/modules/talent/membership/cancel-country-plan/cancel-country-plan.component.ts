import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-country-plan',
  templateUrl: './cancel-country-plan.component.html',
  styleUrl: './cancel-country-plan.component.scss'
})
export class CancelCountryPlanComponent {
  selectedCountryId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<CancelCountryPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmSelection() {
    this.dialogRef.close({
      action: 'delete-confirmed',
      selectedCountryId: this.selectedCountryId
    });
  }

  close() {
    this.dialogRef.close();
  }
}
