
import { Component, OnInit, inject, Renderer2, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';

import { TeamMemberDetailComponent } from './teamMember/teamMember.detail.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import {
  MatDialogRef,
} from '@angular/material/dialog';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  tab: string = "profile";
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private el: ElementRef
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

  previousUrl: string | null = null;
  currentUrl: string | null = null;

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
    // this.fetchProfileData();
    let getActiveTab = localStorage.getItem('makeActiveTab');
    if (getActiveTab) {
      this.switchTab(getActiveTab);
      setTimeout(() => {
        localStorage.removeItem('makeActiveTab');
      }, 1000);
    } else {
      this.switchTab(this.tab);
    }


    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'profile') {
        this.tab = 'profile'; // Switch to the App Settings tab
      } else if (fragment === 'activity') {
        this.tab = 'activity'; // Switch to Activity Log tab
      }
      else if (fragment === 'team') {
        this.tab = 'team'; // Switch to Activity Log tab
      }
      else if(fragment === 'notifications'){
        this.tab = 'notifications';
      }
    });

  }

  editTeamMember() {
    console.log('Edit user button clicked!');
    const dialogRef = this.dialog.open(TeamMemberDetailComponent,
      {
        height: '380px',
        width: '500px',
      });
  }
  switchTab(tab: any) {
    this.tab = tab;
    this.activateTab(tab);
  }



  // fetchProfileData(): void {
  //   this.userService.getProfileData().subscribe(
  //     (response) => {
  //       console.log('Profile Data:', response);
  //       this.profileData = response.data.user_data;
  //     },
  //     (error) => {
  //       this.error = 'Failed to fetch profile data.';
  //       console.error('Error fetching profile data:', error);
  //     }
  //   );
  // }

  // selectAllActivity() {
  //   this.allSelectedActivity = !this.allSelectedActivity;
  //   if (this.allSelectedActivity) {
  //     this.selectedUserIds = this.users.map(user => user.id);
  //   } else {
  //     this.selectedUserIds = [];
  //   }
  //   console.log('Selected user IDs:', this.selectedUserIds);



  private activateTab(tabName: string): void {
    const tabMapping: { [key: string]: string } = {
      profile: '#home-tab-pane',
      activity: '#profile-tab-pane',
      team: '#contact-tab-pane',
    };

    const targetPane = tabMapping[tabName];
    if (!targetPane) return;

    // Remove active class from all tabs and tab panes
    const tabs = this.el.nativeElement.querySelectorAll('.nav-link');
    const panes = this.el.nativeElement.querySelectorAll('.tab-pane');

    tabs.forEach((tab: HTMLElement) => {
      this.renderer.removeClass(tab, 'active');
      this.renderer.setAttribute(tab, 'aria-selected', 'false');
    });

    panes.forEach((pane: HTMLElement) => {
      this.renderer.removeClass(pane, 'show');
      this.renderer.removeClass(pane, 'active');
    });

    // Add active class to the selected tab and pane
    const activeTab = this.el.nativeElement.querySelector(
      `[data-bs-target="${targetPane}"]`
    );
    const activePane = this.el.nativeElement.querySelector(targetPane);

    if (activeTab) {
      this.renderer.addClass(activeTab, 'active');
      this.renderer.setAttribute(activeTab, 'aria-selected', 'true');
    }

    if (activePane) {
      this.renderer.addClass(activePane, 'show');
      this.renderer.addClass(activePane, 'active');
    }
  }
}
