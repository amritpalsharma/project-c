import { Component, inject, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';


@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrl: './filter-popup.component.scss'
})
export class FilterPopupComponrnt {

  readonly dialogRef = inject(MatDialogRef<FilterPopupComponrnt>);
  userFilters: any = [];
  condition: any = 1;
  locations: any = []
  selectedLocation: any = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.userFilters = data.filters;
    this.locations = data.locations;

    if (this.userFilters['location']) {
      this.selectedLocation = this.userFilters['location'];
    }
  }

  close() {
    this.dialogRef.close(this.userFilters);
  }

  setFilter(type: any, value: any) {
    this.userFilters[type] = value;
    if (type == "activity") {
      delete this.userFilters['alphabetically'];
    } else if (type == "alphabetically") {
      delete this.userFilters['activity'];
    }
  }

  applyUserFilter() {
    this.close();
  }

  resetUserFilter() {
    this.userFilters = [];
    this.close();
  }

  onLocationChange(event: any) {
    this.selectedLocation = (event.target as HTMLSelectElement).value;
    if (this.selectedLocation == "") {
      delete this.userFilters['location'];
    } else {
      this.setFilter('location', this.selectedLocation)
    }
  }
}
