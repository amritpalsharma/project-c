import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent implements OnInit {

  showPopup = false; // Flag to control popup visibility
  theme: string = 'dark';

  constructor(
    private router: Router,
    private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.theme = localStorage.getItem('theme') || 'dark';
    }
  } // Inject Router

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization
  }


  closePopup() {
    if (isPlatformBrowser(this.platformId)) {
      const path = window.location.pathname;  // Get the current URL path
      const role = path.split('/')[1];         // Split the path by '/' and get the second element
      if (role == 'talent' || role == 'club' || role == 'scout') {
        this.router.navigate(['/' + role + '/membership']).then(() => {
          console.log('After Navigation:', this.router.url); // Check where it actually goes
        });
      }
    }
  }

}
