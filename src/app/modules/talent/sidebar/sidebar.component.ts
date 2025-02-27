import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'talent-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'] // Fixed 'styleUrl' to 'styleUrls'
})
export class SidebarComponent implements OnInit {
  sidebarOpen: boolean = true; // Initial state of the sidebar
  isNum: Number = 1;
  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    // Add any initialization logic if needed
    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
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

  // openSidebar(): void {
  //   this.sidebarOpen = true;
  //   document.body.classList.remove('compact-sidebar');
  //   document.body.classList.add('mobile-sidebar-active');
  // }
}
