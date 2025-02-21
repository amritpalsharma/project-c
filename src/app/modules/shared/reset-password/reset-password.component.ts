import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  password: string = '';
  confirm_password: string = '';

  // Variables to control password visibility
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    public talentService : TalentService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialize user object if needed
  }

  onCancel(): void {
    this.dialogRef.close(); // Close the dialog without saving
  }

  onSave(form: NgForm): void {
    // Check if the form is invalid
    if (form.invalid) {
      this.toastr.error('Please complete all required fields before submitting.', 'Form Incomplete');
      return;
    }

    // Validate if passwords match
    if (this.password !== this.confirm_password) {
      this.toastr.error('The passwords you entered do not match. Please try again.', 'Password Mismatch');
      return;
    }

    // Show a submission progress message
    this.toastr.info('Submitting your request...', 'Please wait', { disableTimeOut: true });

    // Call the service to change the password
    this.talentService.changePassword(this.password, this.confirm_password).subscribe(
      (response) => {
        // Clear any persistent loading messages
        this.toastr.clear();

        // Show success message
        this.toastr.success('Your password has been successfully updated!', 'Success');

        // Pass the updated password back to the parent component and close the dialog
        this.dialogRef.close({ password: this.password });
      },
      (error) => {
        // Clear the persistent loading message
        this.toastr.clear();

        // Display error message based on the type of error
        if (error.status === 400) {
          this.toastr.error('Invalid password format. Please check the requirements and try again.', 'Submission Failed');
        } else if (error.status === 500) {
          this.toastr.error('There was a problem with the server. Please try again later.', 'Server Error');
        } else {
          this.toastr.error('An unexpected error occurred. Please try again.', 'Submission Failed');
        }

        console.error('Error changing password:', error);
      }
    );
  }

  // Toggle the visibility of the password field
  togglePasswordVisibility(inputId: string): void {
    if (inputId === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else if (inputId === 'confirm-password') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }
}
