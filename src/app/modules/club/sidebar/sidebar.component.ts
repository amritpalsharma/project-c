 import { Component } from '@angular/core';

 @Component({
   selector: 'club-sidebar',
   templateUrl: './sidebar.component.html',
   styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarOpen: boolean = false;

  toggleState() {
    this.sidebarOpen = !this.sidebarOpen;

    // Toggle classes on body element
    if (this.sidebarOpen) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
    } else {
      document.body.classList.add('compact-sidebar');
      document.body.classList.remove('mobile-sidebar-active');
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    document.body.classList.remove('mobile-sidebar-active');
    document.body.classList.add('compact-sidebar');
  } }
