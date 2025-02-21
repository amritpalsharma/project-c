import { MatDialogRef } from '@angular/material/dialog';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { CouponService } from '../../../services/coupon.service'; 
import { TalentService } from '../../../services/talent.service'; 

@Component({
  selector: 'app-coupon-code-alert',
  templateUrl: './coupon-code-alert.component.html',
  styleUrls: ['./coupon-code-alert.component.scss']
})
export class CouponCodeAlertComponent implements OnInit {
  couponCode: string = '';
  couponError: string = '';
  couponSuccess: string = '';
  couponApplied: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CouponCodeAlertComponent>,
    private talentService: TalentService
  ) {}

  ngOnInit(): void {}

  // Clear error and success messages when user starts typing a new coupon
  onCouponInput(): void {
    this.couponError = ''; // Clear previous error
    this.couponSuccess = ''; // Clear previous success message
    this.couponApplied = false; // Reset coupon applied state
  }

  // Validate coupon when the user clicks "Check Coupon"
  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }

    this.talentService.validateCoupon(this.couponCode).subscribe(
      (response) => {
        if (response.status) {
          this.couponSuccess = 'Coupon code applied successfully!';
          this.couponError = '';
          this.couponApplied = true;
        } else {
          this.couponError = 'Invalid Coupon Code. Please try again.';
          this.couponSuccess = '';
          this.couponApplied = false;
        }
      },
      (error) => {
        if (error.status === 0) {
          this.couponError = 'Network error. Please check your connection.';
        } else {
          this.couponError = 'An error occurred. Please try again later.';
        }
        this.couponSuccess = '';
        this.couponApplied = false;
        console.error('Coupon validation error:', error);
      }
    );
  }

  // Proceed to checkout without coupon or after applying it
  proceedToCheckout(): void {
    this.dialogRef.close(this.couponCode); // Pass coupon code (if applied) or null
  }

  // Close dialog without a coupon
  noCoupon(): void {
    this.dialogRef.close(null); // Close without coupon
  }

  // Close the dialog
  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
