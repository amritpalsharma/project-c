import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { WebPages } from '../../../../../services/webpages.service';

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
  currentExploreuserId: any;
  constructor(private userService: UserService,public webPages: WebPages) {

  }
  ngOnInit(): void {
    this.user = this.userData;
    this.currentExploreuserId = this.user.id;
    this.getRepresentators();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getRepresentators();
    })
  }
  getMetaValue(stringifyData: any, key: any): any {
    if (stringifyData) {
      stringifyData = JSON.parse(stringifyData);
      if (stringifyData[key]) {
        return stringifyData[key];
      } else {
        return "NA";
      }
    } else {
      return "NA";
    }
  }

  getRepresentators() {
    // alert(this.currentExploreuserId)
    // console.log(this.userData)

    this.userService.userGetRepresentators(this.currentExploreuserId).subscribe((response) => {
      if (response && response.status && response.data) {
        this.representators = response.data.representators;
        this.baseUrl = response.data.uploads_path
      } else if (response.data == '') {
        this.representators = [];
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }
}
