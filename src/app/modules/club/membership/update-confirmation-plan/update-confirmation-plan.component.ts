import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-confirmation-plan',
  templateUrl: './update-confirmation-plan.component.html',
  styleUrl: './update-confirmation-plan.component.scss'
})
export class UpdateConfirmationPlanComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateConfirmationPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}