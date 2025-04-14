import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to add the new header
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        // Handle the error as needed
        console.error('HTTP Error:', error);
        throw error;
      })
    );
  }

  private getToken(): string {
    // Logic to retrieve the token from local storage or a service
    return localStorage.getItem('token') || '';
  }
}