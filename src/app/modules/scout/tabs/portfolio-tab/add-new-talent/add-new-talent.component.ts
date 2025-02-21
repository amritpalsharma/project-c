import { Component, inject, model, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PortfolioTabComponent } from '../portfolio-tab.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'scout-add-new-talent',
  templateUrl: './add-new-talent.component.html',
  styleUrl: './add-new-talent.component.scss'
})
export class AddNewTalentComponent {
  readonly dialogRef = inject(MatDialogRef<PortfolioTabComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly animal = model(this.data.animal);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
