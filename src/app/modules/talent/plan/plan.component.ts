import { Component, OnInit, OnDestroy } from '@angular/core';
import { TalentService } from '../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../../services/payment.service';
import { MessagePopupComponent } from '../../shared/message-popup/message-popup.component';
import { ActivatedRoute } from '@angular/router';
import { AddBoosterComponent } from './add-booster-profile/add-booster.component';
import { CouponCodeAlertComponent } from '../../shared/coupon-code-alert/coupon-code-alert.component';
import { ToastrService } from 'ngx-toastr';
import { EditMembershipProfileComponent } from '../edit-membership-profile/edit-membership-profile.component';
import { UpdateConfirmationPlanComponent } from '../../shared/update-confirmation-plan/update-confirmation-plan.component';
import { EditPlanComponent } from '../../shared/edit-plan/edit-plan.component';
import { WebPages } from '../../../services/webpages.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TitleService } from '../../../title.service';
import { Router } from '@angular/router';
import { PremiumPurchaseComponent } from '../../shared/premium-purchase/premium-purchase.component';
// import { LoaderComponent } from '../../shared/loader/loader.component';



interface Plan {
  id: number;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  isYearly: boolean;
  quantity: number;
  includes: string[];
  yearly: any;
  monthly: any;
  is_package_active: any;
}

interface PackageObject {
  id: string;
  package_id: string;
  interval: string;
  created_at: string;
  currency: string;
  domain_id: string;
  package_description: string;
  package_interval: string;
  package_name: string;
  price: any;
  status: string;
  stripe_plan_id: string;
  updated_at: string;
}

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements OnInit, OnDestroy {

  plans: any;
  maxQuantity: number = 10;
  premiumPlans: any;
  premiumPlanTxt: string = '';
  boostedPlans: any;
  countryPlans: any;
  newPremium: any;
  selectedPlan: any | null = null;
  activePlans: any[] = [];
  allCountryPlans: any[] = [];
  userCards: any[] = [];
  defaultCard: any = null;
  stripe: any;
  loggedInUser: any = localStorage.getItem('userData');
  premium: any = null;
  premium_talent: any = null;
  country: any = '';
  booster: any = null;
  demo: any = null;
  stats: any;
  couponCode: string = '';
  isCouponApplied: boolean = false;

  isPremiumPurchased: string = '';
  newPremiumPurchased: string = '';
  premiumSubscribeId: any = [];

  premiumPurchased: any = 0;

  pleaseWait: string = '';
  Processing: string = '';

  isLoadingPlans: boolean = false;
  isLoadingCheckout: boolean = false;
  isLoadingCards: boolean = false;

  private plansSubscription: Subscription = new Subscription();
  // stripePromise = loadStripe(environment.stripePublishableKey);
  // payment_mode = localStorage.getItem('payment_mode');
  stripePromise = localStorage.getItem('payment_mode') == 'live' ? loadStripe(environment.stripePublishableKey) : loadStripe(environment.stripePublishableTestKey);
  premiumFeatures: string[] = []; // Store the fetched feature list
  multiCountryPlanDesc: string[] = []; // Store the fetched feature list
  bostProfileDesc: string[] = []; // Store the fetched feature list
  langSubscription!: Subscription;
  boostProfileTxt: string = '';

  // countryMonthlyArr : PackageObject[] = [];
  // countryYearlyArr : PackageObject[] = [];

  countryMonthlyArr: PackageObject | null = null;  // Store a single object, not an array
  countryYearlyArr: PackageObject | null = null;
  countryPlanPrice: any;
  pageTitle: string = '';

  countryHasYearlyPlan: boolean = false;
  constructor(
    private talentService: TalentService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public webPages: WebPages,
    private translate: TranslateService,
    private titleService: TitleService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.getJsonTranslations();
    this.isLoadingPlans = true;
    this.getUserPlans();
    this.getBoosterData()
    this.stripe = await this.paymentService.getStripe();
    this.loggedInUser = JSON.parse(this.loggedInUser || '{}');
    // this.getBoosterData();
    this.loadFeatures();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadFeatures(); // Reload features when the language changes
      this.fetchPlans(); // Reload features when the language changes
      this.getJsonTranslations();
    });

    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
  }

  // Open coupon dialog
  openCouponDialog(planId: any): void {
    // alert('Dailog Open');

    if (this.isPremiumPurchased == 'monthly' || this.isPremiumPurchased == 'yearly') {
      console.info('Already Premium ' + this.isPremiumPurchased + ' Plan is Purchased');
      if (this.isPremiumPurchased == 'monthly' && this.premiumPlans.isYearly) {
        this.updatePlan(this.premiumPlans, true, this.premiumPurchased);
        return;
      } else if (this.isPremiumPurchased == 'yearly' && !this.premiumPlans.isYearly) {
        this.updatePlan(this.premiumPlans, false, this.premiumPurchased);
        return;
      }
    }

    const dialogRef = this.dialog.open(PremiumPurchaseComponent, {
      width: '600px',
      panelClass: 'all_plan_popups',
      data: {
        action: 'premiumPlan',
        planName: this.premiumPlanTxt,
        isYearly: this.premiumPlans.isYearly,
        premiumPlans: this.premiumPlans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.warn(result)
      if (result && typeof result.coupon_code != undefined && result.coupon_code != '') {
        this.isCouponApplied = true;
        this.couponCode = result.coupon_code;
        this.redirectToCheckout(planId);
      } else if (result == 'buy_plan') {
        this.isCouponApplied = false;
        this.couponCode = '';
        this.redirectToCheckout(planId);
      }
    });
  }


  // Open coupon dialog
  openCouponDialog2(planId: any): void {
    // alert('Dailog Open');
    // newPremiumPurchased: string = '';


    if (this.newPremiumPurchased == 'monthly' || this.newPremiumPurchased == 'yearly') {
      console.info('Already Premium ' + this.newPremiumPurchased + ' Plan is Purchased');
      if (this.newPremiumPurchased == 'monthly' && this.newPremium.isYearly) {
        this.updatePlan(this.newPremium, true, this.premiumSubscribeId);
        return;
      } else if (this.newPremiumPurchased == 'yearly' && !this.premiumPlans.isYearly) {
        this.updatePlan(this.newPremium, false, this.premiumSubscribeId);
        return;
      }
    }

    const dialogRef = this.dialog.open(PremiumPurchaseComponent, {
      width: '600px',
      panelClass: 'all_plan_popups',
      data: {
        action: 'premiumPlan',
        planName: this.premiumPlanTxt,
        isYearly: this.newPremium.isYearly,
        premiumPlans: this.newPremium
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.warn(result)
      if (result && typeof result.coupon_code != undefined && result.coupon_code != '') {
        this.isCouponApplied = true;
        this.couponCode = result.coupon_code;
        this.redirectToCheckout(planId);
      } else if (result == 'buy_plan') {
        this.isCouponApplied = false;
        this.couponCode = '';
        this.redirectToCheckout(planId);
      }
    });
  }

  // Redirect to Stripe Checkout with coupon code logic
  async redirectToCheckout(planId: string) {
    this.isLoadingCheckout = true;
    // this.toastr.info('Redirecting to payment...', 'Loading', { disableTimeOut: true });
    this.toastr.info(this.pleaseWait, this.Processing, { disableTimeOut: true });

    try {
      const response = await this.paymentService.createCheckoutSession(planId, '', this.couponCode).toPromise();

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
      console.error('Error creating Stripe Checkout session:', error);
    } finally {
      this.toastr.clear();

      this.isLoadingCheckout = false;
    }
  }

  // Apply coupon logic (e.g., send to backend for validation)
  applyCoupon(): void {
    // You can call a service to validate the coupon and apply discounts
    console.log('Coupon code applied:', this.couponCode);
  }

  ngOnDestroy() {
    this.plansSubscription.unsubscribe();
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  fetchPlans() {
    this.plansSubscription = this.talentService.getPackages().subscribe({
      next: (response) => {
        if (response?.status) {
          // Initialize plan arrays

          const res = response.data;

          let country_plans: any = [];
          console.info('Object.keys(res)', res)
          // Iterate over the keys in the response object (e.g., premium, booster, country, demo)
          Object.keys(res).forEach((key) => {
            // console.info('key----->>>>>>', key.toLowerCase())
            if (key.toLowerCase().includes('premium_talent')) {
              console.log('Premium Talent2 Found')
              console.log('res[key]', res[key])
              this.newPremium = res[key];
              this.newPremium.isYearly = res[key].active_interval == 'weekly';

              Object.keys(this.newPremium?.plans).forEach((key) => {
                this.newPremium[this.newPremium.plans[key].interval] = this.newPremium.plans[key];
              })

              this.newPremium.priceMonthly = this.newPremium['monthly'].price.trim();
              this.newPremium.priceYearly = this.newPremium['yearly'].price.trim();
              this.newPremium.currency = this.newPremium['yearly'].currency;
              this.newPremium.includes = ["The complete talent profile with all stages of his career and performance data.", "Export data in excel and pdf formats.", "Create your favorite list.", "Highlight your best photos and videos on your profile."];

              this.newPremium.id = this.newPremium['monthly'].package_id;
              this.newPremium.month_package_id = this.newPremium['monthly'].id;
              this.newPremium.month_price = this.newPremium['monthly'].price;
              this.newPremium.year_package_id = this.newPremium['yearly'].id;
              this.newPremium.year_price = this.newPremium['yearly'].price;
            } else if (key.toLowerCase().includes('premium')) {
              this.premiumPlans = res[key];
              this.premiumPlans.isYearly = res[key].active_interval == 'yearly';

              Object.keys(this.premiumPlans?.plans).forEach((key) => {
                this.premiumPlans[this.premiumPlans.plans[key].interval] = this.premiumPlans.plans[key];
              })

              this.premiumPlans.priceMonthly = this.premiumPlans['monthly'].price.trim();
              this.premiumPlans.priceYearly = this.premiumPlans['yearly'].price.trim();
              this.premiumPlans.currency = this.premiumPlans['yearly'].currency;
              this.premiumPlans.includes = ["The complete talent profile with all stages of his career and performance data.", "Export data in excel and pdf formats.", "Create your favorite list.", "Highlight your best photos and videos on your profile."];

              this.premiumPlans.id = this.premiumPlans['monthly'].package_id;
              this.premiumPlans.month_package_id = this.premiumPlans['monthly'].id;
              this.premiumPlans.month_price = this.premiumPlans['monthly'].price;
              this.premiumPlans.year_package_id = this.premiumPlans['yearly'].id;
              this.premiumPlans.year_price = this.premiumPlans['yearly'].price;

            } else if (key.toLowerCase().includes('booster')) {
              this.boostedPlans = res[key];
              this.boostedPlans.isYearly = res[key].active_interval == 'yearly';

              Object.keys(this.boostedPlans?.plans).forEach((key) => {
                this.boostedPlans[this.boostedPlans.plans[key].interval] = this.boostedPlans.plans[key];
              })
              this.boostedPlans.includes = ["Jump to the top of search results.", "Higher chances to get discovered.", "Profile boosts help you grow your network and following faster.", "You can boost your profile to reach a specific audience, such as Talents, Clubs or Scouts."];
              this.boostedPlans.priceMonthly = this.boostedPlans['monthly'].price;
              this.boostedPlans.priceYearly = this.boostedPlans['yearly'].price;
              this.boostedPlans.currency = this.boostedPlans['yearly'].currency;

              this.boostedPlans.id = this.boostedPlans['monthly'].package_id;
              this.boostedPlans.month_package_id = this.boostedPlans['monthly'].id;
              this.boostedPlans.month_price = this.boostedPlans['monthly'].price;
              this.boostedPlans.year_package_id = this.boostedPlans['yearly'].id;
              this.boostedPlans.year_price = this.boostedPlans['yearly'].price;


            } else if (key.toLowerCase().includes('country')) {
              console.log('Country Found')
              this.countryPlans = res[key] || {};
              this.countryPlans.data = this.countryPlans.data || {};

              const plans = res[key]?.plans || {};

              this.allCountryPlans = plans;

              Object.keys(plans).forEach((planKey) => {
                const plan = plans[planKey];

                if (plan.location) {
                  const locationData = this.countryPlans.data[plan.location] = this.countryPlans.data[plan.location] || {};

                  locationData.plans = locationData.plans || {};
                  locationData.plans[plan.interval] = plan;

                  locationData.package_name = plan.package_name;
                  locationData.currency = plan.currency;

                  if (plan.interval === 'monthly') {
                    locationData.id = plan.id;
                    locationData.month_package_id = plan.package_id;
                    locationData.month_price = plan.price;
                  } else if (plan.interval === 'yearly') {
                    locationData.year_id = plan.id;
                    locationData.year_package_id = plan.package_id;
                    locationData.year_price = plan.price;
                  }

                  country_plans[plan.location] = plan;
                }
              });

              this.countryPlans.includes = [
                "Present your profile to clubs and leagues in other countries.",
                "Higher chances to get hired globally.",
                "Build your global portfolio."
              ];

              // Uncomment if `country_plans` assignment is needed elsewhere
              this.countryPlans.country_plans = country_plans;
            } else if (key.toLowerCase().includes('premium_talent')) {

            }
          });
          console.warn('countryPlans', this.countryPlans);
          if (this.countryPlans.plans != '') {
            this.setCountryPlans(this.countryPlans.plans);
          }

          // Set the default selected plan (first country plan or null if none exist)
          this.selectedPlan = this.countryPlans.plans[0] || null;
          this.selectedPlan.isYearly = this.selectedPlan.active_interval == 'yearly';
          let activePlan = [];
          console.log('CountryPlans', this.countryPlans.plans)
          console.log('newPremium', this.newPremium)
          // is_package_active
          // activePlan.push(this.countryPlans.plans[0]);
          // activePlan.push(this.countryPlans.plans[7]);
          if (this.countryPlans.plans != '' && this.countryPlans.plans.length > 0) {
            this.filterActivePlans();
          }

          // this.activePlans = activePlan;

          // Fetch user cards
          // this.getUserCards();

          // Handle query parameters for country ID
          this.route.queryParams.subscribe((params) => {
            const selectedCountryId = params['countryId'];
            if (selectedCountryId) {
              this.onSelectPlan(selectedCountryId);
              this.editPlanPopup(this.countryPlans.plans, this.country);
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to fetch plans', err);
      },
      complete: () => {
        this.isLoadingPlans = false;
      },
    });
  }

  mergePlan(planArray: Plan[], newPlanData: Plan) {
    const existingPlanIndex = planArray.findIndex(p => p.name === newPlanData.name);
    if (existingPlanIndex !== -1) {
      const existingPlan = planArray[existingPlanIndex];
      existingPlan.priceMonthly = existingPlan.priceMonthly || newPlanData.priceMonthly;
      existingPlan.priceYearly = existingPlan.priceYearly || newPlanData.priceYearly;
      existingPlan.yearly = existingPlan.yearly || newPlanData.yearly;
      existingPlan.monthly = existingPlan.monthly || newPlanData.monthly;
    } else {
      planArray.push(newPlanData);
    }
  }

  getUserCards(): void {
    this.isLoadingCards = true;
    this.talentService.getCards().subscribe(response => {
      if (response?.status && response?.data?.paymentMethod) {
        this.userCards = response.data.paymentMethod;
        this.defaultCard = this.userCards.find((card: any) => card.is_default === "1") || null;
      } else {
        console.error('Invalid API response:', response);
      }
      this.isLoadingCards = false;
    }, error => {
      console.error('Error fetching user cards:', error);
      this.isLoadingCards = false;
    });
  }

  getIncludes(packageName: string): string[] {
    switch (packageName) {
      case 'Premium': return ["Talent profile data", "Export data", "Favorites", "Highlights"];
      case 'Booster': return ["Top search results", "Higher visibility", "Faster network growth", "Boost options"];
      default: return ["Global portfolio visibility", "Higher hiring chances", "Profile for international leagues"];
    }
  }

  handleQuantityChange(event: any, plan: Plan): void {
    const inputValue = Number(event.target.value);
    if (inputValue >= 1 && inputValue <= this.maxQuantity) {
      plan.quantity = inputValue;
    } else if (inputValue > this.maxQuantity) {
      plan.quantity = this.maxQuantity;
    } else {
      plan.quantity = 1;
    }
  }

  async payForPlan(plan: Plan) {
    if (!this.defaultCard) {
      console.error('No default card found for payment');
      return;
    }

    try {
      const subscriptionData = {
        paymentMethodId: this.defaultCard.stripe_payment_method_id,
        planId: plan.id,
      };
      const response = await this.talentService.subscribeToPlan(subscriptionData).toPromise();

      if (response?.status === 'success') {
        console.log('Subscription successful!', response.subscription);
      } else {
        console.error('Subscription failed:', response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during subscription:', error);
    }
  }

  getUserPlans(): void {
    this.talentService.getUserPlans().subscribe({
      next: (response) => {
        if (response?.status && response?.data?.packages) {
          const userPlans = response.data.packages;
          this.premium = userPlans?.premium?.[0] || null;
          this.premium_talent = userPlans?.premium_talent?.[0] || null;
          this.demo = userPlans?.demo?.[0] || null;
          this.booster = userPlans?.booster?.[0] || null;
          this.country = userPlans?.country || '';
          console.log('userPlans', userPlans);
          this.fetchPlans();
          if (this.country && this.country != undefined) {
            this.checkCountryYearlyPlan(this.country);
          }

          if (userPlans.premium[0] != undefined && userPlans.premium[0] != '' && userPlans.premium[0].status == 'active') {
            this.isPremiumPurchased = 'monthly';
            // this.premiumMonthlyPackageId = userPlans.premium[0].package_id;
            this.premiumPurchased = userPlans.premium[0];
          } else if (userPlans.premium[1] != undefined && userPlans.premium[1] != '' && userPlans.premium[1].status == 'active') {
            this.isPremiumPurchased = 'yearly';
            this.premiumPurchased = userPlans.premium[1];
            // this.premiumYearlyPackageId = userPlans.premium[1].package_id;
          } else {
            this.isPremiumPurchased = 'noPlan';
          }


          if (userPlans.premium_talent[0] != undefined && userPlans.premium_talent[0] != '' && userPlans.premium_talent[0].status == 'active') {
            this.newPremiumPurchased = 'monthly';
            this.premium_talent = userPlans?.premium_talent?.[0] || null;
            // this.premiumMonthlyPackageId = userPlans.premium[0].package_id;
            this.premiumSubscribeId = userPlans.premium_talent[0];
          } else if (userPlans.premium_talent[1] != undefined && userPlans.premium_talent[1] != '' && userPlans.premium_talent[1].status == 'active') {
            this.newPremiumPurchased = 'yearly';
            this.premiumSubscribeId = userPlans.premium_talent[1];
            this.premium_talent = userPlans?.premium_talent?.[1] || null;
            // this.premiumYearlyPackageId = userPlans.premium[1].package_id;
          } else {
            this.newPremiumPurchased = 'noPlan';
          }

        } else {
          console.error('Invalid API response:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching user plans:', error);
      }
    });
  }

  // animate : boolean = false;

  toggleBillingPlan(plan: any, isYearly: boolean, subscribeId: any): void {

    // this.animate = (!this.animate);

    console.log('toggleBillingPlan', plan, isYearly, subscribeId, this.selectedPlan);
    const originalIsYearly = plan.isYearly;

    if (isYearly && plan.active_interval == 'yearly') {
      // this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`);
      // return;
    }

    if (!isYearly && plan.active_interval == 'monthly') {
      // this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`);
      // return;
    }

    if (plan.package_name && plan.package_name.includes('prem')) {
      if (this.premiumPlans.isYearly === true) {
        this.premiumPlans.isYearly = false;
      } else {
        this.premiumPlans.isYearly = true;
      }
    }

    if (plan.type === "multi") {
      // console.log(isYearly)
      if (isYearly === true) {
        this.selectedPlan.isYearly = false;
      } else if (isYearly === false) {
        this.selectedPlan.isYearly = true;
      }
    }
    //  Boost Profile Array
    if (this.boostProfileTxt == plan.package_name) {
      if (isYearly === true) {
        this.boostedPlans.isYearly = false;
      } else if (isYearly === false) {
        this.boostedPlans.isYearly = true;
      }
    }

    plan.isYearly = originalIsYearly;

    // this.onSelectPlan()
    return;
  }

  toggleBillingPlan2(plan: any, isYearly: boolean, subscribeId: any): void {

    // this.animate = (!this.animate);

    // console.log('toggleBillingPlan', plan, isYearly, subscribeId, this.selectedPlan);
    const originalIsYearly = plan.isYearly;

    if (isYearly && plan.active_interval == 'yearly') {
      // this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`);
      // return;
    }

    if (!isYearly && plan.active_interval == 'monthly') {
      // this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`);
      // return;
    }

    if (plan.package_name && plan.package_name.includes('prem')) {
      if (this.newPremium.isYearly === true) {
        this.newPremium.isYearly = false;
      } else {
        this.newPremium.isYearly = true;
      }
    }

    plan.isYearly = originalIsYearly;

    // this.onSelectPlan()
    return;
  }

  updatePlan(plan: any, isYearly: boolean, subscribeId: any) {
    const originalIsYearly = plan.isYearly;

    const newPlanId = isYearly ? plan.yearly : plan.monthly;

    console.info('subscribeId', subscribeId)
    console.info('NewPlan', newPlanId)

    const dialogRef = this.dialog.open(UpdateConfirmationPlanComponent, {
      data: { plan, isYearly }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSubscription(subscribeId.id, newPlanId.id);
      } else {
        plan.isYearly = originalIsYearly;
      }
    });
  }

  updateSubscription(oldId: any, newId: any) {

    this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });

    this.getUserPlans();

    this.paymentService.upgradeSubscription(oldId, newId).subscribe(
      response => {
        if (response && response.status) {

          this.toastr.clear();
          if (response.message != '' && response.message != undefined) {
            this.toastr.success(response.message);
          } else {
            this.toastr.success('Plan has been updated successfully.');
          }
          this.getUserPlans();

          const url = this.router.url;
          const role = url.split('/')[1];
          this.router.navigate([`${role}/success`]);
        } else {
          this.toastr.clear();
          this.toastr.error('Failed to update subscription. Please try again.');
          console.error('Failed to update subscription', response);
        }
      },
      error => {
        this.toastr.clear();
        this.toastr.error('Error updating subscription. Please try again later.');
        console.error('Error updating subscription:', error);
      }
    );
  }


  async subscribeToPlan(customerId: string) {
    if (!this.stripe) return;

    try {
      const { error, setupIntent } = await this.stripe.confirmSetup({
        clientSecret: 'setup_intent_client_secret', // Use your SetupIntent client secret from backend
        payment_method: customerId,
      });

      if (error) {
        console.error('Subscription failed:', error.message);
      } else {
        console.log('Subscription successful:', setupIntent);
        // Inform your backend to listen for webhook events regarding this subscription
      }
    } catch (err) {
      console.error('Error subscribing:', err);
    }
  }

  decreaseValue(plan: Plan) {
    if (plan.quantity > 1) plan.quantity--;
  }

  increaseValue(plan: Plan) {
    if (plan.quantity < this.maxQuantity) plan.quantity++;
  }

  editPlanPopup(plans: any, country: any) {
    console.info('Country', country);
    // this.fetchPlans();

    // console.warn(plans)
    // if (!plans.data && typeof plans.data !== undefined) {
    //   console.info('Plans Data is Undifined');
    // }
    if (!plans.data || !plans.data && plans.length > 0) {
      console.error("Error: this.data or this.data.plans is undefined Plan Component");
      plans.data = plans;
      // return;
    }

    console.info(plans);
    const dialogRef = this.dialog.open(EditPlanComponent, {
      width: 'unset',
      data: {
        plans: plans.data,
        selectedPlan: this.selectedPlan,
        activePlans: this.activePlans,
        allPlans: this.allCountryPlans,
        defaultCard: this.defaultCard,
        country: country,
        selectedInterval: this.selectedPlan.isYearly
      }
    });
  }

  addBoostPopup(planId: any) {
    // alert(planId);
    // console.log(this.boostedPlans)
    // return;
    const dialogRef = this.dialog.open(AddBoosterComponent, {
      width: '850px',
      panelClass: 'all_plan_memersbhip_popup',
      data: {
        id: planId,
        plan: this.booster,
        boostedPlans: this.boostedPlans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected Audience IDs received:', result);
      }
    });
  }

  onPlanSelect(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    const selected = this.countryPlans.find((plan: any) => plan.id === selectedId);

    if (selected) {
      this.selectedPlan = selected;
    }
  }


  onSelectPlan(selectedId: any) {

    const selected = this.countryPlans.find((plan: any) => plan.id === selectedId);

    if (selected) {
      this.selectedPlan = selected;
    }
  }

  getActiveMultiCountryPlanCount(): number {
    return this.country.length;
  }

  editBooster(data: any) {

    const dialogRef = this.dialog.open(EditMembershipProfileComponent, {
      width: '1000px',
      data: {
        stats: this.stats
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action == 'redirect' && result.redirect_path != '' && result.user_id != '') {
          this.router.navigate([result.redirect_path + '/', result.user_id]);
        }
        this.getBoosterData()
        // alert('Booster profile updated')
      }
    });
  }


  async getBoosterData() {
    try {
      const response = await this.talentService.getBoosterData().toPromise();
      if (response?.data) {
        this.stats = response.data;
        console.log(this.stats)
        // Ensure the selectedAudienceIds array is cleared and populated with the correct data
      } else {
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
    }
  }
  loadFeatures() {
    this.translate.get('premiumPlanDesc.features').subscribe((data: string[]) => {
      this.premiumFeatures = data;
      // this.premiumFeatures = [];
    });
    this.translate.get('multiCountryPlanDesc.features').subscribe((data: string[]) => {
      this.multiCountryPlanDesc = data;
      // this.premiumFeatures = [];
    });
    this.translate.get('bostProfileDesc.features').subscribe((data: string[]) => {
      this.bostProfileDesc = data;
      // this.premiumFeatures = [];
    });
  }

  removeSpace(str: string) {
    let Price = str;
    Price = Price.trim();
    Price = Price.replaceAll(' ', '');
    // alert(Price)
    return Price;
  }

  setCountryPlans(plansArr: any) {
    this.countryMonthlyArr = plansArr.find((obj: any) => obj.interval === "monthly");
    this.countryYearlyArr = plansArr.find((obj: any) => obj.interval === "yearly");

    console.warn('Monthly', this.countryMonthlyArr);
    console.warn('Yearly', this.countryYearlyArr);
  }

  filterActivePlans() {
    console.info('this.countryPlans', this.countryPlans);
    this.activePlans = [];
    this.countryPlans.plans.forEach((plan: any) => {
      if (plan.is_package_active == 'active') {
        this.activePlans.push(plan); // Push only if is_package_active is true
      }
    })
  }

  getToasterMsg() {
    this.translate.get(['pleaseWait', 'Processing']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.Processing = translations['Processing'];
    });
  }

  getJsonTranslations() {
    this.translate.get(['plans', 'boostProfile', 'premium']).subscribe((translations) => {
      this.pageTitle = translations['plans'];
      this.boostProfileTxt = translations['boostProfile'];
      this.premiumPlanTxt = translations['premium'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

  checkCountryYearlyPlan(countryPlanPurchasedArr: any) {
    let subscriptions = countryPlanPurchasedArr;
    const hasYearlyPlan = subscriptions.some((subscription: any) => subscription.interval === 'yearly');
    if (hasYearlyPlan) {
      this.countryHasYearlyPlan = true;
    } else {
      this.countryHasYearlyPlan = false;
    }
  }
}