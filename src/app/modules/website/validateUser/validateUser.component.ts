
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthGoogleService } from  '../../../services/auth-google.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-validate-user',
  templateUrl: './validateUser.component.html',
  styleUrls: ['./validateUser.component.scss']
})
export class ValidateUserComponent implements OnInit {
  private authGoogleService = inject(AuthGoogleService);
  token= '';
  tokenVerified = false;
  tokenErrorTemplate: any;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    
  ) {}

  ngOnInit(): void {

    console.log("ng onit")

    let token = this.authGoogleService.getToken();
    let profile:any = this.authGoogleService.getProfile();

    console.log(token, profile);
    let selectedLanguage = localStorage.getItem('lang') || '';
    let domain = environment.targetDomain?.domain || 'ch';

    if(token == null){
      this.router.navigate(['/']);
    }
    const loginData = {
      email: profile.email,
      lang: selectedLanguage,
      domain: domain
    };

    this.authService.googleLogin(loginData).subscribe(
      response => {
        console.log('Login response:', response);
        
        if (response.status === false) {
          console.error('Login failed:', response.message);
          this.router.navigate(['/']);
        } else {
          console.log('Login successful.');
          const token = response.data.token;
          const userData = response.data.user_data;
        
          console.log(userData,"check user data index ")


          localStorage.setItem('authToken', token);
        
          const storedToken = localStorage.getItem('authToken');
          localStorage.setItem('userData', JSON.stringify(userData));
        
          if (storedToken === token) {
            console.log('Token successfully saved to local storage.');
            this.router.navigate(['/admin/dashboard']);
            // window.location.href = `${targetDomain}/Admin/Dashboard`;
          } else {
            console.error('Failed to save token to local storage.');
          }
        }
      },
      error => {
        console.error('An error occurred while logging in:', error);
      }
    ); 
  }
  
  }

 
