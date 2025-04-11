import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';

@Component({
  selector: 'talent-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'] // Fixed 'styleUrl' to 'styleUrls'
})
export class SidebarComponent implements OnInit {
  sidebarOpen: boolean = true; // Initial state of the sidebar
  isNum: Number = 1;
  isUserVerified: boolean = false;
  loggedInUser: any = localStorage.getItem('userInfo');
  constructor(private socketService: SocketService, public dialog: MatDialog) { }

  ngOnInit(): void {
    // Add any initialization logic if needed
    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
    if (typeof this.loggedInUser !== 'undefined' && this.loggedInUser !== null && this.loggedInUser !== '') {
      // Do something
      this.loggedInUser = JSON.parse(this.loggedInUser);
    }else{
      window.location.reload();
    }
    
    console.warn(this.loggedInUser.status)
    if (this.loggedInUser && this.loggedInUser.status != '' && this.loggedInUser.status != undefined) {
      if (this.loggedInUser.status == 2) {
        this.isUserVerified = true;
      } else {
        this.isUserVerified = false;
      }
    }
  }

  toggleState(): void {
    this.sidebarOpen = !this.sidebarOpen; // Toggles the sidebar state
    console.log("working");

    // Update body classes based on sidebar state
    if (this.sidebarOpen) {
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

  // openSidebar(): void {
  //   this.sidebarOpen = true;
  //   document.body.classList.remove('compact-sidebar');
  //   document.body.classList.add('mobile-sidebar-active');
  // }
}
