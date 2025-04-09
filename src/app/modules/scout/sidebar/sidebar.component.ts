import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';

@Component({
  selector: 'scout-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
  export class SidebarComponent {
    sidebarOpen: boolean = false;
    isUserVerified: boolean = false;
    isNum: Number = 1;
    loggedInUser: any = localStorage.getItem('userInfo');
    constructor(public dialog: MatDialog) {

    }
    ngOnInit(): void {
      // Add any initialization logic if needed
      if (this.isNum == 1 && window.innerWidth >= 992) {
        document.body.classList.remove('compact-sidebar');
        document.body.classList.add('mobile-sidebar-active');
        this.isNum = 0;
      }
      this.loggedInUser = JSON.parse(this.loggedInUser);
      console.warn(this.loggedInUser.status)
      if (this.loggedInUser && this.loggedInUser.status != '' && this.loggedInUser.status != undefined) {
        if (this.loggedInUser.status == 2) {
          this.isUserVerified = true;
        } else {
          this.isUserVerified = false;
        }
      }
    }

    toggleState() {
      this.sidebarOpen = !this.sidebarOpen;

      // Toggle classes on body element
      if (!this.sidebarOpen) {
        document.body.classList.remove('compact-sidebar');
        document.body.classList.add('mobile-sidebar-active');
      } else {
        document.body.classList.add('compact-sidebar');
        document.body.classList.remove('mobile-sidebar-active');
      }
    }

    closeSidebar(isMobile: any): void {
      if (!isMobile) {
        this.sidebarOpen = false;
        document.body.classList.remove('mobile-sidebar-active');
        document.body.classList.add('compact-sidebar');
      }
      else {
        if (window.innerWidth < 992) {
          this.sidebarOpen = false;
          document.body.classList.remove('mobile-sidebar-active');
          document.body.classList.add('compact-sidebar');
        }
      }
    }
    showVerificationPopup() {
      const messageDialog = this.dialog.open(UnverifiedUserComponent, {
        width: '500px',
        position: {
          top: '150px'
        }
      })

      messageDialog.afterClosed().subscribe(result => {
        if (result !== undefined) {
          if (result.action == "delete-confirmed") {
            // this.deleteUser();
          }
        }
      });
    }

  }
