import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditPlanComponent } from '../../edit-plan/edit-plan.component';
import { TalentService } from '../../../../services/talent.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../../../services/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { ScoutService } from '../../../../services/scout.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../services/webpages.service';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { CouponCodeAlertComponent } from '../../coupon-code-alert/coupon-code-alert.component';

@Component({
  selector: 'shared-add-country',
  templateUrl: './add-country.component.html',
  styleUrl: './add-country.component.scss'
})
export class AddCountryComponent {

  constructor(
    private talentService: TalentService,
    public dialogRef: MatDialogRef<AddCountryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private router: Router,  // <-- Inject Router
    private toastr: ToastrService,
    private stripeService: PaymentService,
    private paymentService: PaymentService,
    private ScoutService: ScoutService,
    private translateService: TranslateService,
    public webPages: WebPages,
    public global: GlobalSettingsService
  ) { }
  couponCode: string = '';
  otherPlans: any;
  selectedPlan: any;
  country: any;
  stripe: any;
  countryPlans: any;
  theme: any = localStorage.getItem('theme');
  isYearly: boolean = false;

  Processing: string = '';
  pleaseWait: string = '';
  errorTxt: string = '';
  generalError: string = '';
  countryPlanPrice: string = '';

  stripePromise = loadStripe(environment.stripePublishableKey);
  currency: string = '';

  async ngOnInit() {
    this.theme = localStorage.getItem('theme');
    // If this.data.plans is an array, assign it directly
    this.country = this.data.country;
    // console.log(this.country)
    this.stripe = await this.stripeService.getStripe();
    this.loadCountries();
    this.getJsonTranslations();
    this.webPages.languageId$.subscribe((data) => {
      this.loadCountries();
      this.getJsonTranslations();
    });
    this.currency = this.global.getDomainCurrency();
  }

  editPlanPopup() {
    const dialogRef = this.dialog.open(CouponCodeAlertComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe(result => {
      // console.info('After coupoun', result);
      if (result) {
        let coupon = result;
        if (result == 'proceed_to_checkout_without_coupon') {
          coupon = '';
        }
        this.couponCode = coupon;
        if (this.couponCode) {

          let interval;
          if (this.isYearly === true) {
            interval = 'yearly';
          } else {
            interval = 'monthly';
          }
          console.info('this.country', this.country);
          const selected = this.countryPlans.find(
            (plan: any) => plan.package_name === this.country.package_name && plan.interval === interval
          );
          console.log('selected_selected',selected)
          if (selected.id != '') {
            this.redirectToCheckout(selected.id, coupon);
          }else{
            console.error('something went wrong no package found');
          }
        }
        // this.toastr.info(this.pleaseWait, this.Processing);
      } else if (result === null) {
        // this.redirectToCheckout(planId);
      }
    });
  }

  // Method to handle the confirm button click
  onConfirm() {
    this.dialogRef.close(); // Close the dialog after confirming 

    // const selected = this.countryPlans.find((plan: any) => plan.id === this.country.id);

    let interval;
    if (this.isYearly === true) {
      interval = 'yearly';
    } else {
      interval = 'monthly';
    }
    console.info('this.country', this.country);
    const selected = this.countryPlans.find(
      (plan: any) => plan.package_name === this.country.package_name && plan.interval === interval
    );
    if (selected.id != '') {
      console.warn(selected)
      this.redirectToCheckout(selected.id);
    }
  }

  getPriceFirstTime() {
    let interval;
    if (this.isYearly === true) {
      interval = 'yearly';
    } else {
      interval = 'monthly';
    }

    console.info('countryPlans', this.countryPlans)
    console.info('country', this.country)

    const selected = this.countryPlans.find(
      (plan: any) => plan.package_name === this.country.package_name && plan.interval === interval
    );

    if (selected.price != '' && selected.price != undefined) {
      this.countryPlanPrice = selected.price;
    } else {
      this.countryPlanPrice = '';
    }

    console.log('selectedPlan',selected)
  }
  async redirectToCheckout(planId: string, coupon: any = '') {
    this.toastr.info(this.Processing, this.pleaseWait, { timeOut: 2000 });

    try {
      const response = await this.stripeService.createCheckoutSession(planId, '', this.couponCode).toPromise();

      if (response && response.data.payment_intent.id) {
        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });
        // this.toastr.success('Redirecting to Stripe Checkout', 'Success');
      } else {
        this.toastr.error(this.generalError, this.errorTxt);
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      this.toastr.error(this.generalError, this.errorTxt);
      console.error('Error creating Stripe Checkout session:', error);
    }
  }

  loadCountries(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getUserDomains(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countryPlans = response.data.domains;
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );

    this.ScoutService.getPackages().subscribe({
      next: (response: any) => {
        if (response && response.status) {
          if (response.data.country && response.data.country.plans != undefined) {
            this.countryPlans = response.data.country.plans;
            this.getPriceFirstTime();
          }
        }
        // console.info('All Country Plans');
        // console.info(response);
      }
    })
  }

  toggleBillingPlan(isYearly: boolean) {
    this.isYearly = isYearly; // Toggle between monthly and yearly 
    let interval;
    if (this.isYearly === true) {
      interval = 'yearly';
    } else {
      interval = 'monthly';
    }
    // console.info('this.country', this.country);
    const selected = this.countryPlans.find(
      (plan: any) => plan.package_name === this.country.package_name && plan.interval === interval
    );
    console.info('selected',selected);
    if (selected.price != '' && selected.price != undefined) {
      this.countryPlanPrice = selected.price;
    } else {
      this.countryPlanPrice = '';
    }

  }
  getJsonTranslations() {
    this.translateService.get(['pleaseWait', 'Processing', 'error', 'forgotPassword.generalError']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.Processing = translations['Processing'];
      this.errorTxt = translations['error'];
      this.generalError = translations['generalError'];
    })
  }
}
