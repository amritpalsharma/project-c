import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Retrieve the token from localStorage (or another storage method)
    let token = null;

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('authToken');
    }
    // Clone the request to add the Authorization header
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.handle403Error();
        } else {
          console.log('here show error', error)
        }

        return throwError(() => new Error(error.message));
      })
    );
  }

  private handle403Error() {
    // Remove the token from localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.setItem('logoutMessage', 'true');
      this.router.navigate(['/']);
    }
  }
}
