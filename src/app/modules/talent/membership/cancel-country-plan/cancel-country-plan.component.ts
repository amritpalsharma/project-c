import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-country-plan',
  templateUrl: './cancel-country-plan.component.html',
  styleUrl: './cancel-country-plan.component.scss'
})

export class CancelCountryPlanComponent {
  selectedCountryId: string | null = null;
  theme: any = localStorage.getItem('theme') || 'light';
  uniqueCountries:any=[];
  constructor(
    public dialogRef: MatDialogRef<CancelCountryPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if(this.data.countries != '' && typeof this.data.countries !== undefined){
      this.uniqueCountries = this.getUniquePackages(this.data.countries);
    }
  }

  confirmSelection() {
    this.dialogRef.close({
      action: 'delete-confirmed',
      selectedCountryId: this.selectedCountryId
    });
  }

  close() {
    this.dialogRef.close();
  }

  getUniquePackages(data: any[]) {
    return Array.from(
      data.reduce((map, item) => {
        const key = `${item.package_name}-${item.interval}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
        return map;
      }, new Map()).values()
    );
  }

  // Get the unique countries
  
}
