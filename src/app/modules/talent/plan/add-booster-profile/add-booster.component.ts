import { Component, Inject, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../services/talent.service';
import { PaymentService } from '../../../../services/payment.service';
import { CouponCodeAlertComponent } from '../../../shared/coupon-code-alert/coupon-code-alert.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../services/webpages.service';
import { UpdateConfirmationPlanComponent } from '../../../shared/update-confirmation-plan/update-confirmation-plan.component';
import { Router } from '@angular/router';

@Component({
  selector: 'add-booster',
  templateUrl: './add-booster.component.html',
  styleUrls: ['./add-booster.component.scss']
})
export class AddBoosterComponent {
  isLoadingCheckout: boolean = false;
  stripe: any;
  talent: string = '';
  scout: string = '';
  club: string = '';


  youHaveAlreadyThisPlan: string = '';
  youHaveAlreadyThisPlanTitle: string = '';
  subscriptionCanceledSuccessfully: string = '';
  successTxt: string = '';
  // @Input() 
  audiences = [
    { role: this.club, id: 2 },
    { role: this.scout, id: 3 },
    { role: this.talent, id: 4 },
  ];     // List of all audiences
  selectedAudienceIds: number[] = []; // Store only audience IDs
  id: any;
  loggedInUser: any = localStorage.getItem('userInfo');

  theme: any = localStorage.getItem('theme');
  userNationality: string = '';

  pleaseWait: string = '';
  Processing: string = '';

  plan: any;
  boostedPlans: any;

  constructor(
    public dialogRef: MatDialogRef<AddBoosterComponent>,
    public talentService: TalentService,
    private toastr: ToastrService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private webPages: WebPages,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {
    this.theme = localStorage.getItem('theme');

    this.loggedInUser = JSON.parse(this.loggedInUser);
    let userNationalities = JSON.parse(this.loggedInUser?.user_nationalities);
    if (userNationalities && typeof userNationalities != undefined) {
      this.userNationality = userNationalities[0]?.flag_path ? userNationalities[0]?.flag_path : '';
    }
    console.warn('this.data', this.data);
    this.id = this.data.id || [];
    this.plan = this.data.plan;
    this.boostedPlans = this.data.boostedPlans;
    this.stripe = await this.paymentService.getStripe();

    this.getToasterMsg();
    this.updateTranslation();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
      this.audiences = [
        { role: this.club, id: 2 },
        { role: this.scout, id: 3 },
        { role: this.talent, id: 4 },
      ]
    });
  }

  // Apply the selected audiences filter
  applyFilter() {
    console.log("Selected Audiences:", this.selectedAudienceIds);
  }

  pauseBoost() {
    this.dialogRef.close();
  }

  // Handle checkbox selection and store only the IDs
  toggleAudienceSelection(audienceId: number, event: any) {
    if (event.target.checked) {
      // Add the ID if checked
      this.selectedAudienceIds.push(audienceId);
    } else {
      // Remove the ID if unchecked
      this.selectedAudienceIds = this.selectedAudienceIds.filter(id => id !== audienceId);
    }
  }

  // Get selected audience roles by matching the selected IDs
  getSelectedAudienceRoles() {
    return this.audiences.filter(audience => this.selectedAudienceIds.includes(audience.id));
  }

  saveBoost() {

    if (this.boostedPlans?.active_interval == 'monthly' && !this.boostedPlans?.isYearly) {
      this.toastr.error(this.youHaveAlreadyThisPlan, this.youHaveAlreadyThisPlanTitle);
    } else if (this.boostedPlans?.active_interval == 'monthly' && this.boostedPlans?.isYearly) {
      // this.toastr.error(this.youHaveAlreadyThisPlan, this.youHaveAlreadyThisPlanTitle);
      // this.selectedPlan?.monthly?.stripe_plan_id
      this.updatePlan(this.boostedPlans, true, this.plan);
      // this.updatePlanByIDS(this.boostedPlans?.monthly?.stripe_plan_id, this.boostedPlans?.yearly?.package_id);
    }
    else if (this.boostedPlans?.active_interval == 'yearly') {
      console.log('You Have Yearly Plan You cannot buy monthly plan');
      this.toastr.error(this.youHaveAlreadyThisPlan, this.youHaveAlreadyThisPlanTitle);
    } else {
      this.redirectToCheckout(this.id, this.selectedAudienceIds);
    }
    // return;

    // if (this.plan && this.plan.interval == 'monthly' && this.boostedPlans.isYearly) {
    //   // console.info('user need to upgrade plan from montly to yearly');
    //   this.updatePlan(this.boostedPlans, true, this.plan);
    //   return;
    // } else if (this.plan && this.plan.interval == 'yearly' && !this.boostedPlans.isYearly) {
    //   // console.info('user need to downgraded plan from yearly to monthly');
    //   this.updatePlan(this.boostedPlans, false, this.plan);
    //   return;
    // }


  }

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

  updatePlanByIDS(fromPlan: any, toPlan: any) {


    const dialogRef = this.dialog.open(UpdateConfirmationPlanComponent, {
      // data: { plan, isYearly }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSubscription(fromPlan, toPlan);
      }
    });
  }


  updateSubscription(oldId: any, newId: any) {

    this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });

    // this.getUserPlans();

    this.paymentService.upgradeSubscription(oldId, newId).subscribe(
      response => {
        if (response && response.status) {

          this.toastr.clear();
          if (response.message != '' && response.message != undefined) {
            this.toastr.success(response.message);
          } else {
            this.toastr.success('Plan has been updated successfully.');
          }
          // this.getUserPlans();

          const url = this.router.url;
          const role = url.split('/')[1];
          this.router.navigate([`${role}/success`]);

          this.dialogRef.close();

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
  // Open coupon dialog
  openCouponDialog(): void {
    const dialogRef = this.dialog.open(CouponCodeAlertComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let coupon = result;
        this.redirectToCheckout(this.id, this.selectedAudienceIds, coupon);
      } else if (result === null) {
        this.redirectToCheckout(this.id, this.selectedAudienceIds);
      }
    });
  }

  async redirectToCheckout(planId: string, booster_audience: number[] = [], coupon: any = '') {
    if (coupon == 'proceed_to_checkout_without_coupon') {
      coupon = null;
    }
    this.isLoadingCheckout = true;
    this.toastr.info(this.pleaseWait, this.Processing);

    try {
      const response = await this.paymentService.createCheckoutSession(planId, booster_audience.join(','), coupon).toPromise();

      if (response?.data?.payment_intent?.id) {
        const stripe = await this.stripe;
        await stripe?.redirectToCheckout({ sessionId: response.data.payment_intent.id });
        // this.toastr.success('Redirecting to Stripe checkout.', 'Success');
      } else {
        this.toastr.error('Failed to create checkout session.', 'Error');
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      this.toastr.error('Error creating Stripe Checkout session. Please try again.', 'Error');
      console.error('Error creating Stripe Checkout session:', error);
    } finally {
      this.isLoadingCheckout = false;
    }
  }

  calculateAge(dob: string | Date): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }


  getToasterMsg() {
    this.translateService.get(['talent', 'scout', 'club', 'pleaseWait', 'Processing']).subscribe((translations) => {
      this.talent = translations['talent'];
      this.scout = translations['scout'];
      this.club = translations['club'];
      this.pleaseWait = translations['pleaseWait'];
      this.Processing = translations['Processing'];
    });
  }

  toggleBillingPlan(isYearly: boolean) {
    this.boostedPlans.isYearly = isYearly;
    // this.boostedPlans
    if (isYearly) {
      this.id = this.boostedPlans?.yearly?.id;
    } else {
      this.id = this.boostedPlans?.monthly?.id;
    }
  }

  updateTranslation() {
    this.translateService.get(['subscriptionCanceledSuccessfully', 'success!', 'pleaseWait', 'Processing', 'youHaveAlreadyThisPlan', 'youHaveAlreadyThisPlanTitle']).subscribe((res: any) => {
      this.subscriptionCanceledSuccessfully = res['subscriptionCanceledSuccessfully'];
      this.successTxt = res['success!'].toUpperCase();
      this.pleaseWait = res['pleaseWait'];
      this.Processing = res['Processing'];
      this.youHaveAlreadyThisPlan = res['youHaveAlreadyThisPlan'];
      this.youHaveAlreadyThisPlanTitle = res['youHaveAlreadyThisPlanTitle'];
    });
  }
}
