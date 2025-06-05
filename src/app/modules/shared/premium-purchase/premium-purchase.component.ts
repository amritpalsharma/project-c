import { Component, Inject, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PaymentService } from '../../../services/payment.service';
import { Subscription } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { CouponCodeAlertComponent } from '../coupon-code-alert/coupon-code-alert.component';

@Component({
  selector: 'app-premium-purchase',
  templateUrl: './premium-purchase.component.html',
  styleUrl: './premium-purchase.component.scss'
})
export class PremiumPurchaseComponent {

  isYearly: boolean = false;
  theme: string = localStorage.getItem('theme') || 'light';
  selectedPlan: any = [];
  couponCode: string = '';
  stripe: any;

  private plansSubscription: Subscription = new Subscription();
  stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(
    public dialogRef: MatDialogRef<PremiumPurchaseComponent>,
    private paymentService: PaymentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.selectedPlan = this.data.premiumPlans;
    if (this.data?.premiumPlans?.isYearly) {
      this.isYearly = true;
    } else {
      this.isYearly = false;
    }
    // this.stripe = await this.paymentService.getStripe();
  }

  toggleBillingPlan(isYearly: boolean) {
    this.isYearly = isYearly;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  buyPlan(): void {
    if (this.couponCode && typeof this.couponCode != undefined && this.couponCode != '') {
      this.dialogRef.close({ coupon_code: this.couponCode });
    } else {
      this.dialogRef.close({ action: 'buy_plan' });
    }
  }

  openCouponDialog(): void {
    const dialogRef = this.dialog.open(CouponCodeAlertComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      let planID = this.selectedPlan.isYearly ? this.selectedPlan?.yearly?.id : this.selectedPlan?.monthly?.id;
      console.log('result', result)
      if (result) {
        this.couponCode = result;
        this.dialogRef.close({ coupon_code: this.couponCode });
        // this.redirectToCheckout(planID);
      } else if (result === null || result == 'proceed_to_checkout_without_coupon') {
        // this.redirectToCheckout(planID);
        this.dialogRef.close({ action: 'buy_plan' });
      }
    });
  }

  // Redirect to Stripe Checkout with coupon code logic
  async redirectToCheckout(planId: string) {
    this.toastr.info('this.pleaseWait', 'this.Processing', { disableTimeOut: true });

    try {
      const response = await this.paymentService.createCheckoutSession(planId, '', this.couponCode).toPromise();
      console.warn(response);
      if (response?.data?.payment_intent?.id) {
        this.toastr.clear();

        // Show success message after redirection attempt
        // this.toastr.success('Redirected to Stripe Checkout successfully.', 'Success');
        if (response?.data?.error && response?.data?.error != undefined) {
          this.toastr.error(response?.data?.error);
        }
        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });

      } else {

        this.toastr.clear();
        if (response?.data?.error && response?.data?.error != undefined) {
          this.toastr.error(response?.data?.error);
        }
        //this.toastr.error('Failed to create checkout session. Please try again.', 'Error');
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      this.toastr.clear();
      // Show error message if API call fails
      this.toastr.error('Error creating Stripe Checkout session. Please try again later.', 'Error');
      // console.error('Error creating Stripe Checkout session:', error);
    } finally {
      this.toastr.clear();
    }
  }
}
