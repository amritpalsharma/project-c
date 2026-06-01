// non-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }
  private platformId = inject(PLATFORM_ID);
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // this.router.navigate(['/admin/dashboard']); 

      let userDataString = '';
      if (isPlatformBrowser(this.platformId)) {
        userDataString = String(localStorage.getItem('userData'));
      }
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
