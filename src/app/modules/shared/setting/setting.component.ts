
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '../../../title.service';
import { WebPages } from '../../../services/webpages.service';
import { Location } from '@angular/common';

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
  tab: string = "setting";
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private titleService: TitleService,
    public webPages: WebPages,
    private location: Location
  ) { }

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
  pageTitle: string = '';
  currentLoggedInPermission: string = '';

  ngOnInit(): void {
    this.getJsonTranslations();
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, "check the userdata")
    if (userDataString) {
      this.userData = JSON.parse(userDataString);

      // Set properties
      this.firstName = this.userData.first_name || '';
      this.lastName = this.userData.last_name || '';
      this.email = this.userData.username || '';
      // this.getUserProfile(this.userData.id);
      // currentLoggedInPermission: string = '';

      if (this.userData.representator_data && this.userData.representator_data != '') {
        if (this.userData.representator_data.permission == 'admin.view') {
          this.currentLoggedInPermission = 'club_view_only';
        }
      }

    } else {
      console.log('No user data found in local storage.');
    }

    // Listen for hash changes in the route
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.tab = fragment;
      }
    });

    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    })
    // this.fetchProfileData(); 
  }


  switchTab(tab: any) {
    this.tab = tab;
    this.router.navigate([], { fragment: tab });
  }

  getJsonTranslations() {
    this.translateService.get(['settings']).subscribe((translations) => {
      this.pageTitle = translations['settings'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }



}
