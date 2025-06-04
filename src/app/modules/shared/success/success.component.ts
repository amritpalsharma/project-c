import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  showPopup = false; // Flag to control popup visibility
  theme: string = localStorage.getItem('theme') || 'light';

  constructor(private router: Router) { } // Inject Router

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization
  }

  closePopup() {
    const path = window.location.pathname;  // Get the current URL path
    const role = path.split('/')[1];         // Split the path by '/' and get the second element
    if (role == 'talent' || role == 'club' || role == 'scout') {
      this.router.navigate(['/' + role + '/membership']).then(() => {
        console.log('After Navigation:', this.router.url); // Check where it actually goes
      });
    }
  }

}