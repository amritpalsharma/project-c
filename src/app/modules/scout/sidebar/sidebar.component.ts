import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';
import { SocketService } from '../../../services/socket.service';

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
  locksideBar: boolean = true;
  constructor(public dialog: MatDialog, private socketService: SocketService) {

  }
  ngOnInit(): void {
    // Add any initialization logic if needed
    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
    // if(this.loggedInUser && this.loggedInUser != ''){
    //   this.loggedInUser = JSON.parse(this.loggedInUser);
    //   console.warn(this.loggedInUser.status)
    // }
    if (typeof this.loggedInUser !== 'undefined' && this.loggedInUser !== null && this.loggedInUser !== '') {
      // Do something
      this.loggedInUser = JSON.parse(this.loggedInUser);
    } else {
      // window.location.reload();
    }
    this.getUserStatus();
  }

  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      if (result == 2) {
        this.isUserVerified = true;
        // alert('User is verified');
      } else {
        this.isUserVerified = false;
      }
      this.locksideBar = false;
    });
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
