import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarOpen: boolean = true;
  isNum : Number = 1;
  ngOnInit() {
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
    // alert('sidebar_state');
    console.log(this.isNum)
  }

  closeSidebar() {
    this.sidebarOpen = false;
    document.body.classList.remove('mobile-sidebar-active');
    document.body.classList.add('compact-sidebar');
  }
}
