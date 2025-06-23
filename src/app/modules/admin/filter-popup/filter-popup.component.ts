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
  filterCount : any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.userFilters = data.filters;
    this.locations = data.locations;
    this.filterCount = data.count;

    if (this.userFilters['location']) {
      this.selectedLocation = this.userFilters['location'];
    }
  }

  close() {
    this.dialogRef.close({userFilters: this.userFilters, filterCount : this.filterCount});
  }

  setFilter(type: any, value: any) {
    if (!(type in this.userFilters)) {
      this.filterCount++; // Increment only if the type is not already in userFilters
      if(type === 'activity' && 'alphabetically' in this.userFilters){
        this.filterCount--;
      }
      if(type === 'alphabetically' && 'activity' in this.userFilters){
        this.filterCount--;
      }
    }
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
    this.filterCount = 0;
    this.close();
  }

  onLocationChange(event: any) {
    this.selectedLocation = (event.target as HTMLSelectElement).value;
    if (this.selectedLocation == "") {
      delete this.userFilters['location'];
      this.filterCount = this.filterCount--;
    } else {
      this.setFilter('location', this.selectedLocation)
    }
  }
}
