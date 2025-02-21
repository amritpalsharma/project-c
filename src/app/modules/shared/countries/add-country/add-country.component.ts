import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditPlanComponent } from '../../edit-plan/edit-plan.component';
import { TalentService } from '../../../../services/talent.service';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-add-country',
  templateUrl: './add-country.component.html',
  styleUrl: './add-country.component.scss'
})
export class AddCountryComponent {

  constructor(
    private talentService: TalentService, 
    public dialogRef: MatDialogRef<AddCountryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private router: Router  // <-- Inject Router
  ) {}
  otherPlans:any;
  selectedPlan:any;
  country:any;
  
  async ngOnInit() {
    // If this.data.plans is an array, assign it directly
    this.country = this.data.country;
    console.log(this.country)
  }

  editPlanPopup() {
    const dialogRef = this.dialog.open(EditPlanComponent, {
      width: '800px',
      data: { 
        plans: this.otherPlans ,
        selectedPlan :this.selectedPlan,
        country : this.country ,
      }
    });
  }

  // Method to handle the confirm button click
  onConfirm() {
    // Assuming you need to navigate to '/packages' and pass the selected country info
    this.router.navigate(['/talent/plans'], { queryParams: { countryId: this.country.id } });
    this.dialogRef.close(); // Close the dialog after confirming
  }
}
