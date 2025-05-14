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
import { ScoutService } from '../../../services/scout.service';
import { UpdateConfirmationPlanComponent } from '../../shared/update-confirmation-plan/update-confirmation-plan.component';
import { EditPlanComponent } from '../../shared/edit-plan/edit-plan.component';
import { TitleService } from '../../../title.service';
import { WebPages } from '../../../services/webpages.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


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
  boostedPlans: any;
  countryPlans: any;
  demoPlans: any;
  selectedPlan: any | null = null;
  activePlans: any[] = [];
  allCountryPlans: any[] = [];
  userCards: any[] = [];
  defaultCard: any = null;
  stripe: any;
  loggedInUser: any = localStorage.getItem('userData');
  premium: any = null;
  country: any = '';
  booster: any = null;
  demo: any = null;
  stats: any;
  couponCode: string = '';
  isCouponApplied: boolean = false;

  pleaseWait: string = '';
  Processing: string = '';

  premiumFeatures: string[] = []; // Store the fetched feature list
  multiCountryPlanDesc: string[] = []; // Store the fetched feature list
  bostProfileDesc: string[] = [];

  isLoadingPlans: boolean = false;
  isLoadingCheckout: boolean = false;
  isLoadingCards: boolean = false;

  private plansSubscription: Subscription = new Subscription();
  stripePromise = loadStripe(environment.stripePublishableKey);
  pageTitle: string = '';

  countryMonthlyArr: PackageObject | null = null;  // Store a single object, not an array
  countryYearlyArr: PackageObject | null = null;
  countryPlanPrice: any;

  langSubscription!: Subscription;

  constructor(
    private ScoutService: ScoutService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private titleService: TitleService,
    private webpages: WebPages,
  ) { }

  async ngOnInit() {
    this.isLoadingPlans = true;
    this.getUserPlans();
    this.getBoosterData()
    this.stripe = await this.paymentService.getStripe();
    this.loggedInUser = JSON.parse(this.loggedInUser || '{}');
    this.getBoosterData()
    
    this.getBoosterData();

    this.loadFeatures();
    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadFeatures(); // Reload features when the language changes
      this.fetchPlans(); // Reload features when the language changes
      this.getJsonTranslations();
    });

    this.getJsonTranslations();
    this.getToasterMsg();
    this.webpages.languageId$.subscribe((data) => {
      this.getToasterMsg();
      this.getJsonTranslations();
    })
  }

  // Open coupon dialog
  openCouponDialog(planId: any): void {

    // if (this.isPremiumPurchased == 'monthly' || this.isPremiumPurchased == 'yearly') {
    //   console.info('Already Premium ' + this.isPremiumPurchased + ' Plan is Purchased');
    //   if (this.isPremiumPurchased == 'monthly' && this.premiumPlans.isYearly) {
    //     // console.info('user need to upgrade plan from montly to yearly');
    //     this.updatePlan(this.premiumPlans, true, this.premiumPurchased);
    //     return;
    //   } else if (this.isPremiumPurchased == 'yearly' && !this.premiumPlans.isYearly) {
    //     // console.info('user need to downgraded plan from yearly to monthly');
    //     this.updatePlan(this.premiumPlans, false, this.premiumPurchased);
    //     return;
    //   }
    // }

    const dialogRef = this.dialog.open(CouponCodeAlertComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.warn(result);
      if (result == 'proceed_to_checkout_without_coupon') {
        this.redirectToCheckout(planId);
      } else if (result && result != null) {
        this.isCouponApplied = true; // Show that the coupon has been applied
        this.couponCode = result; // Store the coupon code entered by the user
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

        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });

      } else {
        this.toastr.clear();

        this.toastr.error('Failed to create checkout session. Please try again.', 'Error');
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

  setCountryPlans(plansArr: any) {
    this.countryMonthlyArr = plansArr.find((obj: any) => obj.interval === "monthly");
    this.countryYearlyArr = plansArr.find((obj: any) => obj.interval === "yearly");

    console.warn('Monthly', this.countryMonthlyArr);
    console.warn('Yearly', this.countryYearlyArr);
  }

  fetchPlans() {
    this.plansSubscription = this.ScoutService.getPackages().subscribe({
      next: (response) => {
        if (response?.status) {
          // Initialize plan arrays

          const res = response.data;

          let country_plans: any = [];
          // Iterate over the keys in the response object (e.g., premium, booster, country, demo)
          Object.keys(res).forEach((key) => {

            // Group plans by category
            if (key.toLowerCase().includes('premium')) {
              this.premiumPlans = res[key];
              this.premiumPlans.isYearly = res[key].active_interval == 'yearly';

              Object.keys(this.premiumPlans?.plans).forEach((key) => {
                this.premiumPlans[this.premiumPlans.plans[key].interval] = this.premiumPlans.plans[key];
              })

              this.premiumPlans.priceMonthly = this.premiumPlans['monthly'].price;
              this.premiumPlans.priceYearly = this.premiumPlans['yearly'].price;
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
            } else if (key.toLowerCase().includes('demo')) {
              this.demoPlans = res[key];
              this.demoPlans.isYearly = res[key].active_interval == 'weekly';

              Object.keys(this.demoPlans?.plans).forEach((key) => {
                this.demoPlans[this.demoPlans.plans[key].interval] = this.demoPlans.plans[key];
              })
              this.demoPlans.priceMonthly = this.demoPlans['daily'].price;
              this.demoPlans.priceYearly = this.demoPlans['weekly'].price;
              this.demoPlans.currency = this.demoPlans['weekly'].currency;
              this.demoPlans.id = this.demoPlans['daily'].package_id;
              this.demoPlans.month_package_id = this.demoPlans['daily'].id;
              this.demoPlans.month_price = this.demoPlans['daily'].price;
              this.demoPlans.year_package_id = this.demoPlans['weekly'].id;
              this.demoPlans.year_price = this.demoPlans['weekly'].price;
              this.demoPlans.includes = ["The complete talent profile with all stages of his career and performance data.", "Export data in excel and pdf formats.", "Create your favorite list.", "Highlight your best photos and videos on your profile."];;
            }
          });
          // console.log('jgfdkhg', this.countryPlans)

          if (this.countryPlans.plans != '') {
            this.setCountryPlans(this.countryPlans.plans);
          }

          if (this.countryPlans.plans != '' && this.countryPlans.plans.length > 0) {
            this.filterActivePlans();
          }

          // Set the default selected plan (first country plan or null if none exist)
          this.selectedPlan = this.countryPlans.plans[0] || null;
          this.selectedPlan.isYearly = this.selectedPlan.active_interval == 'yearly';

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

  loadFeatures() {
    this.translateService.get('scoutPremiumPlanDesc.features').subscribe((data: string[]) => {
      this.premiumFeatures = data;
      // this.premiumFeatures = [];
    });
    this.translateService.get('scoutMultiCountryPlanDesc.features').subscribe((data: string[]) => {
      this.multiCountryPlanDesc = data;
      // this.premiumFeatures = [];
    });
    this.translateService.get('scoutBostProfileDesc.features').subscribe((data: string[]) => {
      this.bostProfileDesc = data;
      // this.premiumFeatures = [];
    });
  }

  getUserCards(): void {
    this.isLoadingCards = true;
    this.ScoutService.getCards().subscribe(response => {
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
      const response = await this.ScoutService.subscribeToPlan(subscriptionData).toPromise();

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
    this.ScoutService.getUserPlans().subscribe({
      next: (response) => {
        if (response?.status && response?.data?.packages) {
          const userPlans = response.data.packages;
          this.premium = userPlans?.premium?.[0] || null;
          this.demo = userPlans?.demo?.[0] || null;
          this.booster = userPlans?.booster?.[0] || null;
          this.country = userPlans?.country || '';
          console.log('userPlans', userPlans);
          this.fetchPlans();

        } else {
          console.error('Invalid API response:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching user plans:', error);
      }
    });
  }


  toggleBillingPlan(plan: any, isYearly: boolean, subscribeId: any): void {

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

    console.log(plan, isYearly)


    if (plan.type === "multi") {
      // console.log(isYearly)
      if (isYearly === true) {
        this.selectedPlan.isYearly = false;
      } else if (isYearly === false) {
        this.selectedPlan.isYearly = true;
      }
    }

    plan.isYearly = originalIsYearly;

    // this.onSelectPlan()
    return;
  }


  // toggleBillingPlan(plan: any, isYearly: boolean, subscribeId: any): void {
  //   const originalIsYearly = plan.isYearly;

  //   if (plan.isYearly != isYearly) {
  //     this.toastr.info(`You're already subscribed to the ${isYearly ? 'yearly' : 'monthly'} plan.`);
  //     return;
  //   }

  //   plan.isYearly = originalIsYearly;
  //   return;
  // }

  updatePlan(plan: any, isYearly: boolean, subscribeId: any) {
    const originalIsYearly = plan.isYearly;

    const newPlanId = isYearly ? plan.yearly : plan.monthly;

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

    // this.toastr.info('Updating Plan, Please wait...', 'Loading', { disableTimeOut: true });
    this.toastr.info(this.pleaseWait, this.Processing, { disableTimeOut: true });

    this.getUserPlans();

    this.paymentService.upgradeSubscription(oldId, newId).subscribe(
      response => {
        if (response && response.status) {

          this.toastr.clear();
          // this.toastr.success('Plan has been updated successfully.');
          this.getUserPlans();
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

    const dialogRef = this.dialog.open(EditPlanComponent, {
      width: '800px',
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
    const dialogRef = this.dialog.open(AddBoosterComponent, {
      width: '850px',
      data: {
        id: planId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected Audience IDs received:', result);
      }
    });
  }

  filterActivePlans() {
    this.countryPlans.plans.forEach((plan: any) => {
      if (plan.is_package_active) {
        this.activePlans.push(plan); // Push only if is_package_active is true
      }
    })
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
        this.getBoosterData()
        // alert('Booster profile updated')
      }
    });
  }


  async getBoosterData() {
    try {
      const response = await this.ScoutService.getBoosterData().toPromise();
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

  getToasterMsg() {
    this.translateService.get(['pleaseWait', 'Processing']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.Processing = translations['Processing'];
    });
  }

  getJsonTranslations() {
    this.translateService.get(['plans']).subscribe((translations) => {
      this.pageTitle = translations['plans'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

}
