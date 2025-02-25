 import { Component } from '@angular/core';

 @Component({
   selector: 'scout-sidebar',
   templateUrl: './sidebar.component.html',
   styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarOpen: boolean = false;
  isNum:Number = 1;

  ngOnInit(): void {
    // Add any initialization logic if needed
    if(this.isNum == 1 && window.innerWidth >= 992){
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
  }

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
}
