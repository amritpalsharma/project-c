import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TalentService } from '../../../services/talent.service';
import { EditPersonalDetailsComponent } from '../edit-personal-details/edit-personal-details.component';
import { ViewMembershipPopupComponent } from '../view-membership-popup/view-membership-popup.component';
import { EditMembershipProfileComponent } from '../edit-membership-profile/edit-membership-profile.component';
import { PaymentsPopupComponent } from '../payments-popup/payments-popup.component';
import { PaymentService } from '../../../services/payment.service';
import { MessagePopupComponent } from '../../shared/message-popup/message-popup.component';
import { CancelCountryPlanComponent } from './cancel-country-plan/cancel-country-plan.component';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrl: './membership.component.scss'
})
export class MembershipComponent {
  
  userId: any = '';
  userPurchases: any = [];
  userCards: any = [];
  userPlans: any = [];
  allSelected: boolean = false;
  idsToDownload: any = [];
  selectedIds: number[] = [];  
  totalItems: number = 0; // Total number of items for pagination
  pageSize: number = 10; // Number of items per page
  currentPage: number = 1; // Current page index
  premium : any =[];
  country: any=[];
  booster: any=[];
  demo: any=[];
  ispremium : any = false;
  iscountry: any = false;
  isbooster: any = false;
  isdemo: any = false;
  stats: any;
  exportLink: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private route: ActivatedRoute, private talentService: TalentService, private paymentService:PaymentService, public dialog: MatDialog,private router: Router , private webpages : WebPages) { }

  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      this.getUserPurchases();
      this.getUserPlans();
      this.getUserCards();
      this.getBoosterData()
    });

    this.webpages.languageId$.subscribe((data) => {
      this.getUserPurchases();
      this.getUserPlans();
      this.getUserCards();
      this.getBoosterData()
    });
  }

  // Fetch purchases from API with pagination parameters
  getUserPurchases(): void {
    const pageNumber = this.currentPage != 0 ? this.currentPage : 1;
    const pageSize = this.pageSize;

    let lang  = localStorage.getItem('lang_id');

    this.talentService.getPurchaseData(pageNumber, pageSize, lang).subscribe(response => {
      if (response && response.status && response.data) {
        this.userPurchases = response.data.purchaseHistory;
        this.totalItems = response.data.totalCount; // Assuming API returns the total number of purchases
        console.log(this.userPurchases)
      } else {
        console.error('Invalid API response:', response);
      }
    }, error => {
      console.error('Error fetching user purchases:', error);
    });
  }

  exportData(): void {

    let params:any = {};
    params.lang  = localStorage.getItem('lang_id');

    this.talentService.getExportLinkPurchaseData(params).subscribe(
      (response) => {
        if (response?.status && response?.data?.file_path) {
          const filePath = response.data.file_path;

          // Open the file path in a new tab
          window.open(filePath, '_blank');
        } else {
          console.error('Invalid API response:', response);
        }
      },
      (error) => {
        console.error('Error fetching user purchases:', error);
      }
    );
  }



  // Fetch purchases from API with pagination parameters
  getUserPlans(): void {

    let params:any = {};
    params.lang  = localStorage.getItem('lang_id');

    this.talentService.getUserPlans(params).subscribe(response => {
      if (response && response.status && response.data) {
        this.userPlans = response.data.packages;
        this.premium = this.userPlans.premium[0];
        this.booster = this.userPlans.booster[0];
        this.demo = this.userPlans.demo[0];
        this.country = this.userPlans.country;

        this.ispremium  = this.premium ? true : false;
        this.iscountry = this.country ? true : false;
        this.isbooster = this.booster ? true : false;
        this.isdemo = this.demo ? true : false;
        this.country.count = this.userPlans.country.length;
        this.premium.count = this.userPlans.premium.length;
        this.booster.count = this.userPlans.booster.length;
        this.demo.count = this.userPlans.demo.length;

      } else {
        console.error('Invalid API response:', response);
      }
    }, error => {
      console.error('Error fetching user purchases:', error);
    });

  }

  // Fetch purchases from API with pagination parameters
  getUserCards(): void {
    this.talentService.getCards().subscribe(response => {
      if (response && response.status && response.data) {
        this.userCards = response.data.paymentMethod;
        console.log(this.userCards)
      } else {
        console.error('Invalid API response:', response);
      }
    }, error => {
      console.error('Error fetching user purchases:', error);
    });
  }

  // Event triggered when paginator changes
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getUserPurchases(); // Fetch new data when page changes
  }

  onCheckboxChange(user: any) {
    const index = this.selectedIds.indexOf(user.id);
    if (index === -1) {
      this.selectedIds.push(user.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  viewMembership(id:any) {
    const userPurchase = this.getSubscriptionById(id);
    const dialogRef = this.dialog.open(ViewMembershipPopupComponent, {
      width: '800px',
      data: {
        invoice_number: userPurchase.invoice_number,
        category: userPurchase.payment_method,
        plan: userPurchase.package_name,
        duration: userPurchase.plan_interval,
        valid_until: userPurchase.plan_period_end,
        price: userPurchase.plan_amount,
        subtotal: userPurchase.amount_paid,
        total: userPurchase.amount_paid,
        currency : userPurchase.amount_paid_currency,
        download_path: userPurchase.invoice_file_path,
        tax_percentage:userPurchase.tax_percentage,
        tax:userPurchase.tax_amount
      }
    });
  }

  async getBoosterData(){

    let params:any = {};
    params.lang  = localStorage.getItem('lang_id');

    try {
      const response = await this.talentService.getBoosterData(params).toPromise();
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


  editMembershipDialog(id:any) {

    const dialogRef = this.dialog.open(EditMembershipProfileComponent, {
      width: '1000px',
      data: { stats : this.stats }
    });

  }

  paymentDialog() {
    const dialogRef = this.dialog.open(PaymentsPopupComponent, {
      width: '800px',
      data: {
        cards: this.userCards
      }
    });
  
    // Optionally handle dialog closing events
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
    });
  }
  
  selectAllCheckboxes() {
    console.log('p', this.allSelected)
    this.allSelected = !this.allSelected;
    console.log('a', this.allSelected)
    if (this.allSelected) {
      this.selectedIds = this.userPurchases.map((fav:any) => fav.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected favorite IDs:', this.selectedIds);
  }

  async downloadInvoice(invoideId:any, invoiceUrl:any){
    // use the fetch/blob method because single download isn't working 
    fetch(invoiceUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert the response to a Blob object
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'invoice-'+invoideId+'.pdf'; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
    });
  }

  downloadAll():any{

    if(this.selectedIds.length == 0){
      return false;
    }
    this.selectedIds = this.userPurchases.map((fav:any) => fav.id);

    const allLinksToDownload = this.selectedIds.map(id => {
      // Find the user object by matching the id
      const purchase = this.userPurchases.find((purchase:any) => purchase.id === id);
      
      // Return the image link if the user is found, otherwise return null or undefined
      return purchase ? purchase.invoice_file_path : null;
    });
    
    this.downloadAllFiles(allLinksToDownload);

  }

  async downloadAllFiles(allLinksToDownload:any) {
    // Loop over each file URL and trigger the download sequentially
    for (const [index, fileUrl] of allLinksToDownload.entries()) {
      // Call downloadFile with each URL and a custom filename
      await this.downloadInvoice(index+1, fileUrl);
    }
  }


  getSubscriptionById(id: string) {
    return this.userPurchases.find((subscription:any) => subscription.id === id);
  }


  confirmAndCancelSubscription(subscriptionId: string): void {
    const dialogRef = this.dialog.open(MessagePopupComponent, {
      width: '600px',
      data: {
        action: 'delete-confirmation',
        message: 'Are you sure you want to cancel this subscription? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'delete-confirmed') {
        this.cancelSubscription(subscriptionId);
      }
    });
  }

  private cancelSubscription(subscriptionId: string): void {
    this.paymentService.cancelSubscription(subscriptionId).subscribe(
      (response: any) => {
        if (response && response.status) {
          // Open the MessagePopupComponent with a success message
          this.dialog.open(MessagePopupComponent, {
            width: '600px',
            data: {
              action: 'display',
              message: 'Subscription canceled successfully.'
            }
          });
          console.log('Subscription canceled successfully:', response);
          this.getUserPlans();

        } else {
          console.error('Failed to cancel subscription', response);
          this.getUserPlans();

        }
      },
      error => {
        console.error('Error cancelling subscription:', error);
      }
    );
  }

  confirmCountryPlanCancellation(country:any) {
    const dialogRef = this.dialog.open(CancelCountryPlanComponent, {
      width: '600px',
      data: {
        action: 'select-country-cancellation',
        countries: country // Pass the list of country plans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'delete-confirmed' && result.selectedCountryId) {
        this.cancelSubscription(result.selectedCountryId);
      }
    });
  }

  getActiveMultiCountryPlanCount(): number {
    return this.country.length;
  }

  getActivePremiumCount(): number {
    return this.premium.length;
  }

  getActiveboosterCount(): number {
    return this.booster.length;
  }

  editBooster(data:any){

    const dialogRef = this.dialog.open(EditMembershipProfileComponent, {
      width: '1000px',
      data: { stats : this.stats
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result ) {
        this.getBoosterData()
      }
    });
  }

}
