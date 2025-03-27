import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';
import { WebPages } from '../../../services/webpages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  password: string = '';
  confirm_password: string = '';
  formAllFieldsRequired: string = '';
  errorTxt: string = '';
  successTxt: string = '';

  // Variables to control password visibility
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    public talentService: TalentService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public webPages: WebPages,
    private translateService: TranslateService
  ) { }

  theme : any = localStorage.getItem('theme');

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
    // Initialize user object if needed
  }

  onCancel(): void {
    this.dialogRef.close(); // Close the dialog without saving
  }

  onSave(form: NgForm): void {
    // Check if the form is invalid
    if (form.invalid) {
      this.toastr.error(this.formAllFieldsRequired, this.errorTxt);
      return;
    }

    // Validate if passwords match
    // if (this.password !== this.confirm_password) {
    //   this.toastr.error('The passwords you entered do not match. Please try again.', 'Password Mismatch');
    //   return;
    // }

    // Show a submission progress message
    // this.toastr.info('Submitting your request...', 'Please wait', { disableTimeOut: true });

    const langId = localStorage.getItem('lang_id');

    // Call the service to change the password
    this.talentService.changePassword(this.password, this.confirm_password, langId).subscribe(
      (response) => {
        // Clear any persistent loading messages
        this.toastr.clear();

        // Show success message
        if (response.status) {
          this.toastr.success(response.message, this.successTxt);
          this.dialogRef.close({ password: this.password });
        }
        else {
          this.toastr.error(response.error.new_con_password);
        }

        // Pass the updated password back to the parent component and close the dialog
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
  getToasterMsg() {
    this.translateService.get([
      'formAllFieldsRequired',
      'error!',
      'success!'
    ]).subscribe((translations) => {
      this.errorTxt = translations['error!'];
      this.successTxt = translations['success!'];
      this.formAllFieldsRequired = translations['formAllFieldsRequired'];
    });
  }
}
