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
  condition:any = 1;
  
  
  page:any = "";

  roles:any = [];
  languages:any = [];
  frequencies:any = [];
  locations: any = [];
  pages:any = [];
  types:any = [];

  selectedRoleId:any = "";
  selectedLanguageId:any = "";
  selectedLanguage:any = "";
  selectedFrequency:any = "";
  selectedLocation: any = "";
  selectedPage:any = "";
  selectedtype:any = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

    this.page = data.page;
    this.userFilters = data.appliedfilters;
    console.log(data);
    console.log(this.userFilters);
    if(this.page == "marketing"){

      
      this.roles = data.roles;
      this.languages = data.languages;
      this.frequencies = data.frequency;
      this.locations = data.locations;

      if(this.userFilters['role']){
        this.selectedRoleId = this.userFilters['role'];
      }
      if(this.userFilters['language']){
        this.selectedLanguageId = this.userFilters['language'];
      }
      if(this.userFilters['frequency']){
        this.selectedFrequency = this.userFilters['frequency'];
      }
      if(this.userFilters['location']){
        this.selectedLocation = this.userFilters['location'];
      }
    }

    if(this.page == "template"){
      this.roles = data.roles;
      this.languages = data.languages;

      if(this.userFilters['role']){
        this.selectedRoleId = this.userFilters['role'];
      }
      if(this.userFilters['language']){
        this.selectedLanguageId = this.userFilters['language'];
      }

    }


    if(this.page == "advertisement"){
      this.pages = data.pages;
      this.types = data.types;

      if(this.userFilters['page_name']){
        this.selectedPage = this.userFilters['page_name'];
      }
      if(this.userFilters['type']){
        this.selectedtype = this.userFilters['type'];
      }
    }

    if(this.page == "webpages" || this.page == "blog"){
      this.languages = data.languages;
      this.types = data.types;

      if(this.userFilters['language']){
        this.selectedLanguage = this.userFilters['language'];
      }
    }
    // this.userFilters = data.filters;
    // this.locations = data.locations;

    // if(this.userFilters['location']){
    //   this.selectedLocation = this.userFilters['location'];
    // }
  }
  
  close(){
    this.dialogRef.close(this.userFilters);
  }

  setFilter(type:any, value:any){
    this.userFilters[type] = value;
    // if(type == "activity"){
    //   delete this.userFilters['alphabetically'];
    // }else if(type == "alphabetically"){
    //   delete this.userFilters['activity'];
    // }

    console.log(this.userFilters)
  }

  applyUserFilter(){
    this.close();
  }
  
  resetUserFilter(){
    this.userFilters = [];
    this.close();
  }

  onLocationChange(event:any){
    this.selectedLocation = (event.target as HTMLSelectElement).value;
    if(this.selectedLocation == ""){
      delete this.userFilters['location'];
    }else{
      this.setFilter('location', this.selectedLocation)
    }
  }

  onChange(event:any, key:any){
    let value = (event.target as HTMLSelectElement).value;
    console.log(value, key);
    if(value == ""){
      delete this.userFilters[key];
    }else{
      this.setFilter(key, value)
    }
  }
}
