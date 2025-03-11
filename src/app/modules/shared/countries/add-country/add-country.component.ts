import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditPlanComponent } from '../../edit-plan/edit-plan.component';
import { TalentService } from '../../../../services/talent.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../../../services/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';

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
  ) { }
  otherPlans: any;
  selectedPlan: any;
  country: any;
  stripe: any;
  countryPlans: any;

  stripePromise = loadStripe(environment.stripePublishableKey);

  async ngOnInit() {
    // If this.data.plans is an array, assign it directly
    this.country = this.data.country;
    console.log(this.country)
    this.stripe = await this.stripeService.getStripe();
    this.loadCountries();
  }

  editPlanPopup() {
    const dialogRef = this.dialog.open(EditPlanComponent, {
      width: '800px',
      data: {
        plans: this.otherPlans,
        selectedPlan: this.selectedPlan,
        country: this.country,
      }
    });
  }

  // Method to handle the confirm button click
  onConfirm() {
    // Assuming you need to navigate to '/packages' and pass the selected country info
    // this.router.navigate(['/talent/plans'], { queryParams: { countryId: this.country.id } });
    this.dialogRef.close(); // Close the dialog after confirming 
    const selected = this.countryPlans.find((plan: any) => plan.id === this.country.id);
    // alert('Current Selected '+selected)
    if (selected.package_id != '') {
      this.redirectToCheckout(selected.package_id);
    }
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

  loadCountries(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getUserDomains(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countryPlans = response.data.domains;
          // this.flag_path = response.data.logo_path;

          // Filter the countries where is_package_active == 'active'
          // this.filteredCountries = this.countries.filter((country:any) => country.is_package_active == 'active');

        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }
}
