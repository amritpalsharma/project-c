
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { UserService } from '../../../services/user.service';
import {  MatDialog } from '@angular/material/dialog';

import {
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  tab:string = "activity";
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
     ) {}

    userData: any;
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    contactNumber: string = '';
    address: string = '';
    city: string = '';
    state: string = '';
    zipcode: string = '';
    password: string = '';
    image: string = '';

  profileData: any;
  error: string | null = null;

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, "check the userdata")
    if (userDataString) {
      this.userData = JSON.parse(userDataString);

      // Set properties
      this.firstName = this.userData.first_name || '';
      this.lastName = this.userData.last_name || '';
      this.email = this.userData.username || '';
    } else {
      console.log('No user data found in local storage.');
    }

    // Listen for hash changes in the route
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'app-settings') {
        this.tab = 'setting'; // Switch to the App Settings tab
      } else if (fragment === 'activity') {
        this.tab = 'activity'; // Switch to Activity Log tab
      }
    });
    // this.fetchProfileData();
  }

  
  switchTab(tab:any){
    this.tab = tab;
  }

}
