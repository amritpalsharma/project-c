import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { PaymentService } from '../../../services/payment.service';
import { environment } from '../../../../environments/environment';
import { loadStripe } from '@stripe/stripe-js';
import { MessagePopupComponent } from '../../shared/message-popup/message-popup.component';
import { ActivatedRoute } from '@angular/router';
import { CouponCodeAlertComponent } from '../../shared/coupon-code-alert/coupon-code-alert.component';
import { ToastrService } from 'ngx-toastr';
import { UpdateConfirmationPlanComponent } from '../update-confirmation-plan/update-confirmation-plan.component';

@Component({
  selector: 'shared-edit-plan',
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.scss']
})
export class EditPlanComponent implements OnInit {
  
  countries: any[] = []; // Array to hold country plans
  selectedCountries: any[] = []; // Holds the selected countries
  selectedPlan: any = {}; // Selected country plan details
  stripePromise = loadStripe(environment.stripePublishableKey); // Your Stripe public key
  stripe: any;
  isYearly = false; // Subscription type
  defaultCard: any = null; // Variable to hold the default card

  @Output() buys: EventEmitter<any> = new EventEmitter();

  constructor(
    public dialogRef: MatDialogRef<EditPlanComponent>,
    public talentService: TalentService,
    private stripeService: PaymentService,
    private paymentService:PaymentService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    // If this.data.plans is an array, assign it directly
    this.selectedPlan =this.data.selectedPlan;
    this.populateCountries();
    this.defaultCard = this.data.defaultCard;
    this.selectedCountries = this.data.country;
    this.stripe = await this.stripeService.getStripe();
    console.log(this.data)

  }

  populateCountries() {
    console.log(this.data)
    // Transform the 'plans' object into an array
    this.countries = Object.keys(this.data.plans).map(key => {
      const plan = this.data.plans[key];
      return {
        id: plan.id,
        package_name: plan.package_name,
        priceMonthly : plan.month_price,
        priceYearly : plan.year_price,
        currency: plan.currency,
        month_package_id : plan.month_package_id,
        year_id : plan.id,
        year_package_id : plan.year_package_id,
        monthly : plan.plans.monthly,
        yearly : plan.plans.yearly,
      };
    });
    this.selectedPlan = this.countries.find(country => country.id === this.selectedPlan.id);
    console.log(this.selectedPlan)
  }


  async redirectToCheckout(planId: string, coupon: any = '') {
    this.toastr.info('Redirecting to checkout, please wait...', 'Processing', { timeOut: 2000 });

    try {
      const response = await this.stripeService.createCheckoutSession(planId, '', coupon).toPromise();

      if (response && response.data.payment_intent.id) {
        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });
        this.toastr.success('Redirecting to Stripe Checkout', 'Success');
      } else {
        this.toastr.error('Failed to create checkout session. Please try again.', 'Error');
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      this.toastr.error('Error creating Stripe Checkout session. Please try again later.', 'Error');
      console.error('Error creating Stripe Checkout session:', error);
    }
  }

  openCouponDialog(planId: any): void {
    const dialogRef = this.dialog.open(CouponCodeAlertComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const coupon = result;
        this.toastr.info('Applying coupon, please wait...', 'Processing');
        this.redirectToCheckout(planId, coupon);
      } else if (result === null) {
        this.redirectToCheckout(planId);
      }
    });
  }

  buyNow() {

    if (this.isPlanAlreadySelected()) {
      this.toastr.warning('You already have a subscription for this plan with a different interval.', 'Warning');
      this.dialog.open(MessagePopupComponent, {
        width: '600px',
        data: {
          action: 'display',
          message: 'You already have a subscription for this plan with a different interval. Please cancel it before selecting a new interval.'
        }
      });
      return;
    }

    const oldPlan = this.selectedCountries.find(c => c.package_name === this.selectedPlan.package_name) || null;
    
    if (this.selectedPlan) {
      const planId = this.isYearly ? this.selectedPlan.yearly : this.selectedPlan.monthly;

      if (this.isYearly) {
        if (this.selectedPlan?.monthly?.is_package_active === 'active') {
          this.updatePlan(planId, this.isYearly, oldPlan);
        } else {
          this.openCouponDialog(planId.id);
        }
      } else {
        if (this.selectedPlan?.yearly?.is_package_active === 'active') {
          this.updatePlan(planId, this.isYearly, oldPlan);
        } else {
          this.openCouponDialog(planId.id);
        }
      }
    } else {
      this.toastr.error('No country plan selected', 'Error');
      console.error('No country plan selected');
    }
  }
  
  updatePlan(plan: any, isYearly: boolean, subscribeId: any): void {
    if (plan?.is_package_active === 'active') {
      this.toastr.warning('This plan has already been subscribed.', 'Warning');
      return;
    }

    if (plan.isYearly === isYearly) {
      this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`, 'Info');
      return;
    }

    const dialogRef = this.dialog.open(UpdateConfirmationPlanComponent, {
      data: { plan, isYearly }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSubscription(subscribeId.id, plan.id);
        console.log(plan);
        console.log(`Plan toggled to ${isYearly ? 'yearly' : 'monthly'}`);
      }
    });
  }

  updateSubscription(oldSubscriptionId: any, newPlanId: any): void {
    this.toastr.info('Updating subscription, please wait...', 'Updating');

    // Call the backend service to update the subscription
    this.paymentService.upgradeSubscription(oldSubscriptionId, newPlanId).subscribe(
      response => {
        if (response && response.status) {
          this.toastr.success('Your subscription has been updated successfully.', 'Success');
          this.dialog.open(MessagePopupComponent, {
            width: '600px',
            data: {
              action: 'display',
              message: 'Your subscription has been updated successfully.'
            }
          });

          console.log('Subscription updated successfully:', response);
        } else {
          this.toastr.error('Failed to update subscription. Please try again.', 'Error');
          console.error('Failed to update subscription', response);
        }
      },
      error => {
        this.toastr.error('Error updating subscription. Please try again later.', 'Error');
        console.error('Error updating subscription:', error);
      }
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }
  
  toggleBillingPlan(isYearly: boolean) {
    this.isYearly = isYearly; // Toggle between monthly and yearly
  }

  cancelPlan(item:any):void{}

  isPlanAlreadySelected(): boolean {
    return this.selectedCountries.some(country => 
      country.package_name === this.selectedPlan?.package_name &&
      (
        (this.isYearly && country.interval === 'yearly') || 
        (!this.isYearly && country.interval === 'monthly')
      )
    );
  }
  
  confirmAndCancelSubscription(subscriptionId: string, canceled = false): void {
    if (canceled) {
      this.toastr.warning('Subscription is already canceled.', 'Warning');
      return;
    }

    const dialogRef = this.dialog.open(MessagePopupComponent, {
      width: '600px',
      data: {
        action: 'delete-confirmation',
        message: 'Are you sure you want to cancel this subscription? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'delete-confirmed') {
        this.toastr.info('Cancelling subscription, please wait...', 'Processing');
        this.cancelSubscription(subscriptionId);
      }
    });
  }

  private cancelSubscription(subscriptionId: string): void {
    this.paymentService.cancelSubscription(subscriptionId).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.toastr.success('Subscription canceled successfully.', 'Success');
          this.dialog.open(MessagePopupComponent, {
            width: '600px',
            data: {
              action: 'display',
              message: 'Subscription canceled successfully.'
            }
          });
          console.log('Subscription canceled successfully:', response);
        } else {
          this.toastr.error('Failed to cancel subscription. Please try again.', 'Error');
          console.error('Failed to cancel subscription', response);
        }
      },
      error => {
        this.toastr.error('Error cancelling subscription. Please try again later.', 'Error');
        console.error('Error cancelling subscription:', error);
      }
    );
  }

  // Fetch purchases from API with pagination parameters
  getUserPlans(): void {
    this.talentService.getUserPlans().subscribe(
      response => {
        if (response?.status && response?.data) {
          const userPlans = response.data.packages;
          this.selectedCountries = userPlans?.country || ''; // Default to empty string if country is undefined
          console.log('userPlans', userPlans);
        } else {
          console.error('Invalid API response:', response);
        }
      },
      error => {
        console.error('Error fetching user purchases:', error);
      }
    );
  }

  onCountrySelect(event: any) {
    const selectedCountryId = event.target.value;
    console.log(selectedCountryId)
    this.selectedPlan = this.countries.find(country => country.id === selectedCountryId);
  }

  removeCountry(country: any) {
    this.selectedCountries = this.selectedCountries.filter(c => c.id !== country.id);
  }
  

}
