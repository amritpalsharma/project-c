import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirmPassword.component.html',
  styleUrls: ['./confirmPassword.component.scss'],
})
export class ConfirmPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  userRole: any = localStorage.getItem('userRole');

  constructor(
    private authService: AuthService,
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ConfirmPasswordComponent>
  ) {}

  ngOnInit(): void {}

  savePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('Passwords do not match!');
      return;
    }

    this.authService
      .resetPassword(this.newPassword, this.confirmPassword)
      .subscribe({
        next: (response) => {
          let navigationRoute = '';
          switch (this.userRole) {
            case '2':
              navigationRoute = '/club/dashboard';
              break;
            case '3':
              navigationRoute = '/scout/dashboard';
              break;
            case '4':
              navigationRoute = '/talent/dashboard';
              break;
            case '1':
              navigationRoute = '/admin/dashboard';
              break;
            default:
              navigationRoute = '';
              break;
          }

          this.toastService.success('Password reset successfully!');
          this.dialogRef.close(); // Close the dialog after success
          if (navigationRoute) {
            this.router.navigate([navigationRoute]); // Navigate to the role-specific dashboard
          }
        },
        error: (error) => {
          this.toastService.error('Failed to reset password.');
          console.error(error);
        },
      });
  }
}
