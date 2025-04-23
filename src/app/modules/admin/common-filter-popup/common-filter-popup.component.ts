import { Component, inject, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Component({
  selector: 'app-common-filter-popup',
  templateUrl: './common-filter-popup.component.html',
  styleUrl: './common-filter-popup.component.scss'
})
export class CommonFilterPopupComponent {
  readonly dialogRef = inject(MatDialogRef<CommonFilterPopupComponent>);
  userFilters: any = [];
  condition: any = 1;


  page: any = "";

  roles: any = [];
  languages: any = [];
  frequencies: any = [];
  locations: any = [];
  pages: any = [];
  types: any = [];

  selectedRoleId: any = "";
  selectedLanguageId: any = "";
  selectedLanguage: any = "";
  selectedFrequency: any = "";
  selectedLocation: any = "";
  selectedPage: any = "";
  selectedtype: any = "";

  filterCount: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

    this.filterCount = data.count;
    this.page = data.page;
    this.userFilters = data.appliedfilters;
    console.log(data);
    console.log(this.userFilters);
    if (this.page == "marketing") {
      this.roles = data.roles;

      this.languages = data.languages;
      this.frequencies = data.frequency;
      this.locations = data.locations;

      if (this.userFilters['role']) {
        this.selectedRoleId = this.userFilters['role'];
      }
      if (this.userFilters['language']) {
        this.selectedLanguageId = this.userFilters['language'];
      }
      if (this.userFilters['frequency']) {
        this.selectedFrequency = this.userFilters['frequency'];
      }
      if (this.userFilters['location']) {
        this.selectedLocation = this.userFilters['location'];
      }
    }

    if (this.page == "template") {
      this.roles = data.roles;
      let lang_id = localStorage.getItem('lang_id');
      if (lang_id == '2') {
        this.roles = [
          { role: "All", name: "All", slug: "all", id: 0 },
          { role: "Admin", name: "Admin", slug: "admin", id: 1 },
          { role: "Club", name: "Club", slug: "club", id: 2 },
          { role: "Scout", name: "Scout", slug: "scout", id: 3 },
          { role: "Talente", name: "Talente", slug: "talent", id: 4 }
        ];
      }
      this.languages = data.languages;

      if (this.userFilters['role']) {
        this.selectedRoleId = this.userFilters['role'];
      }
      if (this.userFilters['language']) {
        this.selectedLanguageId = this.userFilters['language'];
      }

    }


    if (this.page == "advertisement") {
      this.pages = data.pages;
      this.types = data.types;

      if (this.userFilters['page_name']) {
        this.selectedPage = this.userFilters['page_name'];
      }
      if (this.userFilters['type']) {
        this.selectedtype = this.userFilters['type'];
      }
    }

    if (this.page == "webpages" || this.page == "blog") {
      this.languages = data.languages;
      this.types = data.types;

      if (this.userFilters['language']) {
        this.selectedLanguage = this.userFilters['language'];
      }
    }
    // this.userFilters = data.filters;
    // this.locations = data.locations;

    // if(this.userFilters['location']){
    //   this.selectedLocation = this.userFilters['location'];
    // }
  }

  close() {
    this.dialogRef.close({userFilters: this.userFilters, filterCount: this.filterCount});
  }

  setFilter(type: any, value: any) {
    if (!(type in this.userFilters)) {
      this.filterCount++; // Increment only if the type is not already in userFilters
    }
    this.userFilters[type] = value;
    // if(type == "activity"){
    //   delete this.userFilters['alphabetically'];
    // }else if(type == "alphabetically"){
    //   delete this.userFilters['activity'];
    // }

    console.log(this.userFilters)
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
    } else {
      this.setFilter('location', this.selectedLocation)
    }
  }

  onChange(event: any, key: any) {
    let value = (event.target as HTMLSelectElement).value;
    console.log(value, key);
    if (value == "") {
      delete this.userFilters[key];
      if(this.filterCount > 0){
        this.filterCount = this.filterCount - 1;
      }
    } else {
      this.setFilter(key, value)
    }
  }

  translateFrequency(frequency: any) {
    let selectedLang = localStorage.getItem('lang');
    if (selectedLang == 'de') {
      if (frequency == 'Once a day') {
        frequency = 'Einmal am Tag';
      } else if (frequency == 'Once a week') {
        frequency = 'Einmal pro Woche';
      } else if (frequency == 'Once 2 Hrs') {
        frequency = 'Einmal alle 2 Stunden';
      } else if (frequency == 'Twice a day') {
        frequency = 'Zweimal am Tag';
      } else if (frequency == 'Once a month') {
        frequency = 'Einmal im Monat';
      } else if (frequency == 'One time only') {
        frequency = 'Nur einmal';
      }
      return frequency;
    } else {
      return frequency;
    }
  }

  removeTextAfterDash(str: string) {
    return str.split(" - ")[0]; // Splits at " - " and returns only the first part
  }
}
