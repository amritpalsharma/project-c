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
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-edit-plan',
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.scss']
})
export class EditPlanComponent implements OnInit {
  action: string = 'buy';
  countries: any[] = []; // Array to hold country plans
  selectedCountries: any[] = []; // Holds the selected countries
  selectedPlan: any = {}; // Selected country plan details
  stripePromise = loadStripe(environment.stripePublishableKey); // Your Stripe public key
  stripe: any;
  isYearly = false; // Subscription type
  defaultCard: any = null; // Variable to hold the default card
  selectedCountryIds: string[] = [];
  activePlans: any[] = [];
  allPlans: any[] = [];
  countryAllPlans: any[] = [];
  selectedInterval: any;

  theme: any = localStorage.getItem('theme');
  subscriptionCanceledSuccessfully: string = '';
  successTxt: string = '';
  pleaseWait: string = '';
  Processing: string = '';
  isCountrySelected: boolean = false;
  selectedPlanID: number = 0;
  oldCountryPlanId: any = 0;
  newCountryPlanID: any = 0;
  // selectedCountries: any[] = []; // Stores full country objects


  @Output() buys: EventEmitter<any> = new EventEmitter();
  langSubscription!: Subscription;
  isShowBuyButton: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<EditPlanComponent>,
    public talentService: TalentService,
    private stripeService: PaymentService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.theme = localStorage.getItem('theme') || "light";
    // If this.data.plans is an array, assign it directly
    this.selectedPlan = this.data.selectedPlan;
    this.activePlans = this.data.activePlans;
    // console.info('this.activePlans', this.activePlans)
    // checkPlanExistance
    if (this.data.allPlans && typeof this.data.allPlans != undefined) {
      this.allPlans = this.data.allPlans.filter((plan: any) => plan.interval === 'monthly');
    }
    if (this.data.allPlans && typeof this.data.allPlans != undefined) {
      this.countryAllPlans = this.data.allPlans;
    }
    this.populateCountries();
    this.defaultCard = this.data.defaultCard;
    this.selectedCountries = this.data.country;
    this.stripe = await this.stripeService.getStripe();
    this.selectedInterval = this.data.selectedInterval;
    console.log("data here", this.data)
    console.info('activePlans', this.data.activePlans);
    this.toggleBillingPlan(this.selectedInterval);

    this.updateTranslation();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateTranslation();
    });
  }

  populateCountries() {
    console.info(this.data)
    // if(!this.data){

    // }
    if (!this.data || !this.data.plans) {
      console.error("Error: this.data or this.data.plans is undefined");
      return;
    }

    // console.warn('Data Recived in EditPlanCOmponent ', this.data.plans);

    // Transform the 'plans' object into an array
    this.countries = Object.keys(this.data.plans).map(key => {
      const plan = this.data.plans[key];
      // console.info('Single Plan ', plan)
      return {
        id: plan.id,
        package_name: plan.package_name,
        priceMonthly: plan.month_price,
        priceYearly: plan.year_price,
        currency: plan.currency,
        month_package_id: plan.month_package_id,
        year_id: plan.id,
        year_package_id: plan.year_package_id,
        monthly: plan.plans.monthly,
        // monthly: plan.month_price,
        yearly: plan.plans.yearly,
        // yearly: plan.year_price,
      };
    });
    // this.selectedPlan = this.countries.find(country => country.id === this.selectedPlan.id);
    console.log('this.countries', this.countries)
  }


  async redirectToCheckout(planId: string, coupon: any = '') {
    this.toastr.info(this.pleaseWait, this.Processing, { timeOut: 2000 });

    try {
      const response = await this.stripeService.createCheckoutSession(planId, '', coupon).toPromise();

      if (response && response.data.payment_intent.id) {
        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });
        this.toastr.success(this.Processing, this.successTxt);
      } else {
        // this.toastr.error('Failed to create checkout session. Please try again.', 'Error');
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      // this.toastr.error('Error creating Stripe Checkout session. Please try again later.', 'Error');
      console.error('Error creating Stripe Checkout session:', error);
    }
  }

  openCouponDialog(planId: any): void {
    const dialogRef = this.dialog.open(CouponCodeAlertComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe(result => {
      console.info('After coupoun', result);
      if (result) {
        let coupon = result;
        if (result == 'proceed_to_checkout_without_coupon') {
          coupon = '';
        }

        this.toastr.info(this.pleaseWait, this.Processing);
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
    // console.warn(this.selectedPlan)
    if (this.selectedPlan) {
      const planId = this.isYearly ? this.selectedPlan.yearly : this.selectedPlan.monthly;
      console.info('planId', planId);
      if (this.isYearly) {
        if (this.selectedPlan?.monthly?.is_package_active === 'active') {
          this.updatePlan(planId, this.isYearly, oldPlan);
        } else {
          if (this.selectedCountryIds != undefined && this.selectedCountryIds.length > 0) {
            this.isCountrySelected = true;
            this.openCouponDialog(planId.id);
          } else {
            this.isCountrySelected = false;
          }
        }
      } else {
        if (this.selectedPlan?.yearly?.is_package_active === 'active') {
          this.updatePlan(planId, this.isYearly, oldPlan);
        } else {
          //  this.openCouponDialog(planId.id);
          if (this.selectedCountryIds != undefined && this.selectedCountryIds.length > 0) {
            this.openCouponDialog(planId.id);
            this.isCountrySelected = true;
          } else {
            this.isCountrySelected = false;
          }
        }
      }
      console.info('isCountrySelected', this.isCountrySelected)
    } else {
      this.toastr.error('No country plan selected', 'Error');
      console.error('No country plan selected');
    }
  }

  updatePlan(plan: any, isYearly: boolean, subscribeId: any): void {
    if (plan?.is_package_active === 'active') {
      // this.toastr.warning('This plan has already been subscribed.', 'Warning');
      return;
    }

    if (plan.isYearly === isYearly) {
      // this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`, 'Info');
      return;
    }

    const dialogRef = this.dialog.open(UpdateConfirmationPlanComponent, {
      data: { plan, isYearly }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSubscription(subscribeId.id, plan.id);
        console.log(plan);
        // console.log(`Plan toggled to ${isYearly ? 'yearly' : 'monthly'}`);
      }
    });
  }

  updateSubscription(oldSubscriptionId: any, newPlanId: any): void {
    // this.toastr.info('Updating subscription, '+this.pleaseWait, 'Updating');

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
    if (this.selectedCountryIds.length > 0) {
      // console.log(this.selectedCountryIds);
      this.checkPlanExistance(this.selectedPlanID);
    }
  }

  cancelPlan(item: any): void { }

  isPlanAlreadySelected(): boolean {
    return this.selectedCountries.some(country =>
      country.package_name === this.selectedPlan?.package_name &&
      (
        (this.isYearly && country.interval === 'yearly') ||
        (!this.isYearly && country.interval === 'monthly')
      )
    );
  }

  deletePlan(id: any) {
    console.log("check", id);
    this.activePlans = this.activePlans.filter(plan => plan.id !== id);
    console.log(this.activePlans);
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
        this.toastr.info('Cancelling subscription, please wait...', this.pleaseWait);
        this.cancelSubscription(subscriptionId);
      }
    });
  }

  private cancelSubscription(subscriptionId: string): void {
    this.paymentService.cancelSubscription(subscriptionId).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.toastr.success(this.subscriptionCanceledSuccessfully, this.successTxt);
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

  // onCountrySelect(event: any) {
  //   console.log(event.value);
  //   const selectedCountryIds = event.value;
  //   console.log(selectedCountryIds)

  //   const selectedCountries = this.countries.filter(country => selectedCountryIds.includes(country.id));

  //   const selectedLocations = selectedCountries.map(country => country.monthly.location);

  //   console.log('Selected Countries:', selectedCountries ); // Full objects
  //   console.log('Selected Locations:', selectedLocations); // Only locations
  //   console.log('Selected this.selectedCountries:', this.selectedCountries); // Only locations

  //   // this.selectedPlan = this.countries.find(country => country.id === selectedCountryId);
  //   // console.log(this.selectedCountries);
  // }

  alreadySelected: boolean = false;

  onCountrySelect(event: any) {
    // console.log(event.value);
    // this.selectedPlan = event.value; // Update selected IDs
    this.selectedCountryIds = event.value.id;
    let currentPlanID = event.value;
    this.selectedPlanID = currentPlanID;
    if (this.selectedCountryIds.length > 0 && this.selectedCountryIds != null) {
      this.isCountrySelected = true;
    }
    this.selectedPlan = this.countries.find(country => country.id === this.selectedCountryIds);
    this.checkPlanExistance(currentPlanID);

    // If a matching plan is found, return true, otherwise return false
    // return plan !== undefined;
    // console.log(plan);

    // else{
    //   this.isCountrySelected = true;
    // }
  }

  // Function to return custom selected display text (showing locations)
  getSelectedDisplayText(): any {
    console.log(this.selectedCountries);
    return this.selectedCountries.map(country => country.monthly.location).join(', ');
  }


  removeCountry(country: any) {
    this.selectedCountries = this.selectedCountries.filter(c => c.id !== country.id);
  }

  extractTextAfterDash(countryName: any) {
    if (countryName == undefined || countryName == '' || countryName == 'undefined') {
      // return countryName;
    } else {
      let parts = countryName.split(' - ');
      return parts.length > 1 ? parts[1].trim() : '';
    }
  }

  updateTranslation() {
    this.translate.get(['subscriptionCanceledSuccessfully', 'success!', 'pleaseWait', 'Processing']).subscribe((res: any) => {
      this.subscriptionCanceledSuccessfully = res['subscriptionCanceledSuccessfully'];
      this.successTxt = res['success!'].toUpperCase();
      this.pleaseWait = res['pleaseWait'];
      this.Processing = res['Processing'];
    });
  }

  checkPlanExistance(currentPlanID: number) {
    let planInterval;
    if (this.isYearly) {
      planInterval = 'yearly';
    } else {
      planInterval = 'monthly';
    }
    const plan = this.activePlans.find(plan => plan.id === currentPlanID && plan.interval === planInterval);
    // console.log('planplanplanplanplanplan', plan)
    // console.log('CurrentActivePlan',plan);
    if (plan && typeof plan !== undefined) {

      this.isCountrySelected = true;
      this.action = 'upgrade';
      const Newplan = this.countryAllPlans.find(newPlan => newPlan.package_id === plan.package_id && newPlan.interval != plan.interval);
      this.oldCountryPlanId = plan.stripe_plan_id;
      this.newCountryPlanID = Newplan.package_id;
      // console.info('this.countries', this.countryAllPlans);
      console.log('you need to upgrade a plan you have already ' + plan.package_name + ' and interval is ' + plan.interval + ' please upgrade with ' + Newplan.package_name + ' ' + Newplan.interval);
      this.isShowBuyButton = false;
      console.log('upgradeWith', Newplan);
      if (Newplan.interval == 'monthly') {
        console.warn('user has already yearly plan you can noy buy monthly plan');
      }
    } else {
      this.action = 'buy';
      console.log('you need to buy a plan');
    }

  }

  handlePayment() {
    if (this.action == 'buy') {
      this.buyNow();
    } else if (this.action == 'upgrade') {
      let isBothIDCorrect = false;
      if (this.oldCountryPlanId != '' && this.oldCountryPlanId != undefined) {
        isBothIDCorrect = true;
      } else {
        isBothIDCorrect = false;
        console.log('old country plan id is not found');
      }
      if (this.newCountryPlanID != '' && this.newCountryPlanID != undefined) {
        isBothIDCorrect = true;
      } else {
        isBothIDCorrect = false;
        console.log('new country plan id is not found');
      }
      if (isBothIDCorrect === true) {
        console.log('both ids found you need to upgrade ' + this.oldCountryPlanId + ' From ' + this.newCountryPlanID);
        this.updateSubscription(this.oldCountryPlanId, this.newCountryPlanID)
      }
    }
  }
}