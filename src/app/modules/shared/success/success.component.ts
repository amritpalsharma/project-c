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
    console.log('authToken : ',localStorage.getItem('authToken'));
  }

  closePopup() {
   // this.router.navigate(['/talent/dashboard']); // Navigate to the specified route
  //  console.log(localStorage);
  console.log('after Close Popup authToken : ',localStorage.getItem('authToken'));
  }

}