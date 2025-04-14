import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-scout-profile',
  templateUrl: './scout-profile.component.html',
  styleUrl: './scout-profile.component.scss'
})
export class ScoutProfileComponent {
  user: any = {}
  userNationalities: any = [];
  positions: any = [];
  position: any;
  mainPosition: any;
  otherPositions: any;
  representators: any = [];
  loggedInUser: any = localStorage.getItem('userData');
  baseUrl: any;
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() logInUser: any;
  userId: any = "";
  idsToDelete: any = "";

  
  getMetaValue(stringifyData:any, key:any):any{
    if(stringifyData){
      stringifyData = JSON.parse(stringifyData);
      if(stringifyData[key]){
        return stringifyData[key];
      }else{
        return "NA";
      }
    }else{
      return "NA";
    }
  }
}
