// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment?.apiUrl;
  languages:any = environment.langs;
  public lang:any;

  constructor(private http: HttpClient, private router: Router) {

      // Retrieve the selected language code from localStorage
      const selectedLanguageSlug = localStorage.getItem('lang_id') || '';

      // Default to a specific language ID if none is found (e.g., English)
      this.lang = selectedLanguageSlug ? selectedLanguageSlug : 1;
     // this.getDashboardLink();
  }

  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }

  resetPassword(newPassword: string, confirmPassword: string): Observable<any> {
    let token = localStorage.getItem('authToken');
    const data = {
      new_password: newPassword,
      new_con_password: confirmPassword,
    };
    return this.http.post(this.apiUrl+'/reset-password', data, {
      headers: {
        Authorization: `Bearer ${token}`, // Replace with actual token or fetch dynamically
      },
    });
  }

  register(registrationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register`, registrationData, {
      headers: {
        'Lang': localStorage.getItem('lang_id') || '1'
      }
    });
  }

  verifyEmail(token: any, time: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify-email/${token}/${time}`);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('notificationSeen');
    
    // localStorage.setItem('logoutMessage', 'true');
    this.router.navigate(['/']); // Redirect to the login or home page
  }

  isLoggedIn(): boolean {
    // Implement your logic to check if the user is logged in
    // For example, check if a token exists in local storage
    return !!localStorage.getItem('authToken');
  }

  forgotPassword(email: string): Observable<any> {
    let confirmation_link = window.location.origin+'/home?confirm-token=';
    return this.http.post(`${this.apiUrl}/forgot-password`, { email , confirmation_link});
  }

  loginWithMagic(magic_link_url: string): Observable<any> {
    console.log('Magic link URL received:', magic_link_url);
    return this.http.get(`${magic_link_url}`);
  }

  magicLogin(token: string): Observable<any> {
    const endpointUrl = `${this.apiUrl}/validate-forgot-password-token/${token}`;

    return this.http.get<any>(endpointUrl);
  }

  showToken(token: string): Observable<any> {
    console.log('Showing token:', token);
    return this.magicLogin(token);
  }

  googleLogin(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google-signin`, loginData);
  }
  

  getProfileData(): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { userData: any } }>(
      `${this.apiUrl}/profile`
    );
  }

  getPlacePredictions(input: string) {
    const apiKey = 'AIzaSyDTYy_yjGzg_FN54cp9KiqRH2w60fc0PUs';
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${apiKey}`;
    return this.http.get(url);
  }

  getDashboardLink(): string {
    // const role = this.getUserRole();
    const role =  localStorage.getItem('userRole');
    // console.log('current role is : '+role);
    switch (role) {
      case '1':
        return '/admin/dashboard';
      case '2':
        return '/club/dashboard';
      case '3':
        return '/scout/dashboard';
      case '4':
        return '/talent/dashboard';
      default:
        return '/home';  // Default page if no role found
    }
  }
}
