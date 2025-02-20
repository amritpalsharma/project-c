import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent implements OnInit {

  showPopup = false; // Flag to control popup visibility

  constructor(private router: Router) {} // Inject Router

  ngOnInit(): void {
    this.showPopup = true; // Show the popup on initialization
  }

  closePopup() {
    this.router.navigate(['/talent/membership']); // Navigate to the specified route
  }

}
