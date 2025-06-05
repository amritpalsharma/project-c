import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, ChangeDetectorRef, OnInit, Inject } from '@angular/core';
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
  isupgradePlan: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CouponCodeAlertComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data && typeof this.data.action != undefined && this.data.action == 'upgrade_plan') {
      if (typeof this.data.from_plan_id != undefined && typeof this.data.to_plan_id != undefined) {
        this.isupgradePlan = true;
      }
    }

    if (this.data && typeof this.data.action != undefined && this.data.action == 'premiumPlan') {

    }
  }

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
          // this.couponError = 'Invalid Coupon Code. Please try again.';
          if (response.message != '' && response.message != undefined) {
            this.couponError = response.message;
          } else {
            this.couponError = 'Invalid Coupon Code. Please try again.';
          }
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
    console.warn(this.couponCode + ' ...Is applied ' + this.couponApplied)
    // alert('Here')
    if (this.couponCode != '' && this.couponApplied) {
      this.dialogRef.close(this.couponCode); // Pass coupon code (if applied) or null
    } else {
      this.dialogRef.close('proceed_to_checkout_without_coupon'); // Pass coupon code (if applied) or null
    }
  }

  proceedToUpgrade(): void {
    if (this.couponCode != '' && this.couponApplied) {
      this.dialogRef.close({ action: 'upgrade', coupon_code: this.couponCode, from_plan_id: this.data.from_plan_id, to_plan_id: this.data.to_plan_id });
    }
  }

  // Close dialog without a coupon
  noCoupon(): void {
    if (this.couponCode != '' && this.couponApplied) {
      this.dialogRef.close(this.couponCode); // Pass coupon code (if applied) or null
    } else {
      this.dialogRef.close('proceed_to_checkout_without_coupon'); // Pass coupon code (if applied) or null
    }
    // this.dialogRef.close('proceed_to_checkout_without_coupon'); // Close without coupon
  }

  // Close the dialog
  closeDialog(): void {
    if (this.couponCode != '' && this.couponApplied) {
      this.dialogRef.close(this.couponCode); // Pass coupon code (if applied) or null
    } else {
      //  this.dialogRef.close('proceed_to_checkout_without_coupon'); // Pass coupon code (if applied) or null
      this.dialogRef.close(false);
    }
  }
}
