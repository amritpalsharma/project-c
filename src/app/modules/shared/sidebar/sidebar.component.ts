 import { Component } from '@angular/core';

 @Component({
   selector: 'shared-sidebar',
   templateUrl: './sidebar.component.html',
   styleUrl: './sidebar.component.scss'
})

 export class SidebarComponent {
  sidebarOpen: boolean = false;
  loggedInUser: any = localStorage.getItem('userInfo');
  isNum:Number = 1;

  ngOnInit() {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    if(this.isNum == 1 && window.innerWidth >= 992){
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
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

  role(role:any){
    if(role == 'Club') return "club";
    else if(role == 'Scout') return "scout";
    else return "talent";
  }
}
