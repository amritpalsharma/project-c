// non-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // this.router.navigate(['/admin/dashboard']); 

      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString); // Parse the JSON string into an object
        if (userData.role == 4) {
          this.router.navigate(['/talent/dashboard']);
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
      return false;
    }
    return true;
  }
}
