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

  constructor(private router: Router) {} // Inject Router

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization
  }

  closePopup() {
    // this.router.navigate(['/talent/membership']); // Navigate to the specified route
    // setTimeout(() => {
      this.router.navigate(['/talent/membership']).then(() => {
        console.log('After Navigation:', this.router.url); // Check where it actually goes
      });
    // }, 2500);
  }

}