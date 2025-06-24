import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     // Retrieve the token from localStorage (or another storage method)
     const token = localStorage.getItem('authToken');
    
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
        }else{
          console.log('here show error',error)
        }

        return throwError(() => new Error(error.message));
      })
    );
  }

  private handle403Error() {
    // Remove the token from localStorage
    localStorage.removeItem('authToken');
    localStorage.setItem('logoutMessage', 'true');
    this.router.navigate(['/']);
    // Optionally, redirect to the login page
  }
}
