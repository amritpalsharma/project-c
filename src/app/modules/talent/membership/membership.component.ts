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
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TitleService } from '../../../title.service';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
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
  pageSize: number = 15; // Number of items per page
  currentPage: number = 1; // Current page index
  country: any = [];
  booster: any = [];
  premium: any = [];
  newPremium: any = [];
  demo: any = [];
  ispremium: any = false;
  isNewpremium: any = false;
  iscountry: any = false;
  isbooster: any = false;
  isdemo: any = false;
  stats: any;
  exportLink: any;
  cancelConfirmationMsg: String = '';
  userPurchasesNotFound: String = '';
  subsciptionCancelSuccess: String = '';
  isLoading: boolean = true;
  pageTitle: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private talentService: TalentService,
    private paymentService: PaymentService,
    public dialog: MatDialog,
    private router: Router,
    private webpages: WebPages,
    private translateService: TranslateService,
    private titleService: TitleService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.getJsonTranslations();
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getUserPurchases();
      this.getUserPlans();
      this.getUserCards();
      this.getBoosterData()
    });
    this.loadTranslations();
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserPurchases();
      // this.getUserPurchases();
      this.getUserPlans();
      this.getUserCards();
      this.getBoosterData();
      this.loadTranslations();
      this.getJsonTranslations();
    });

  }

  // ngAfterViewInit() {
  //   this.paginator.page.subscribe(event => {
  //     console.log('Page Index (0-based):', event.pageIndex); // Log the page index (0-based)
  //     this.currentPage = event.pageIndex; // Store the 0-based page index
  //     this.getUserPurchases(); // Fetch new data based on the current page
  //   });
  // }

  // isLoading: boolean = true;

  // Fetch purchases from API with pagination parameters
  getUserPurchases(): void {
    this.isLoading = true;
    let pageNumber = this.currentPage;

    if (pageNumber == 0) {
      pageNumber = 1;
    }

    const pageSize = this.paginator ? this.paginator.pageSize : 20;
    let lang = localStorage.getItem('lang_id');

    this.talentService.getPurchaseData(pageNumber, pageSize, lang).subscribe(response => {
      console.warn(response.data)
      if (response && response.status && response.data) {
        this.isLoading = false;
        this.userPurchases = response.data.purchaseHistory;
        this.totalItems = response.data.totalCount; // Assuming API returns the total number of purchases
        // console.warn(this.userPurchases)

        let hiddenCount = 0;
        if (this.userPurchases && this.userPurchases.length > 0) {
          // this.userPurchases = this.userPurchases.filter((item: any) => {
          //   const amount = parseFloat(item.amount_paid);
          //   const isValid = !isNaN(amount) && amount > 0;
          //   if (!isValid) hiddenCount++;
          //   return isValid;
          // });

          // this.totalItems = this.totalItems - hiddenCount;
        }

        if (response.data.totalCount && response.data.totalCount == 0) {
          this.userPurchases = [];
        }

        if (response.data.currentPage && response.data.currentPage > 0) {
          this.currentPage = response.data.currentPage;
        }

        // Filter the array to only keep rows with valid amount_paid > 0
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.userPurchases = [];
        // this.userPurchases.length
        console.error('Invalid API response:', response);
      }
    }, error => {
      console.error('Error fetching user purchases:', error);
    });
  }

  exportData(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

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

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getUserPlans(params).subscribe(response => {
      if (response && response.status && response.data) {
        this.userPlans = response.data.packages;
        if (this.userPlans.premium_talent[0] && this.userPlans.premium_talent[0] != undefined) {
          this.newPremium = this.userPlans.premium_talent[0];
          this.isNewpremium = this.newPremium ? true : false;
        }
        if (this.userPlans.premium_talent[1] && this.userPlans.premium_talent[1] != undefined) {
          this.newPremium = this.userPlans.premium_talent[1];
          this.isNewpremium = this.newPremium ? true : false;
        }
        if (this.userPlans.premium[0] && this.userPlans.premium[0] != undefined) {
          this.premium = this.userPlans.premium[0];
          this.ispremium = this.premium ? true : false;
        }
        if (this.userPlans.premium[1] && this.userPlans.premium[1] != undefined) {
          this.premium = this.userPlans.premium[1];
          this.ispremium = this.premium ? true : false;
        }
        if (this.userPlans.booster[0] && this.userPlans.booster[0] != undefined) {
          this.booster = this.userPlans.booster[0];
          this.isbooster = this.booster ? true : false;
        }
        if (this.userPlans.booster[1] && this.userPlans.booster[1] != undefined) {
          this.booster = this.userPlans.booster[1];
          this.isbooster = this.booster ? true : false;
        }
        // this.demo = this.userPlans.demo[0];
        this.country = this.userPlans.country;

        console.log('Country', this.country);


        this.iscountry = this.country ? true : false;

        // this.isdemo = this.demo ? false : false;
        this.country.count = this.userPlans.country.length;
        this.premium.count = this.userPlans.premium.length;
        this.booster.count = this.userPlans.booster.length;
        // this.demo.count = this.userPlans.demo.length;

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
  onPageChangesss(event: any): void {

    this.currentPage = this.paginator ? this.paginator.pageIndex : 0;
    this.pageSize = this.paginator ? this.paginator.pageSize : 10;

    if (event.pageIndex == 1) {
      this.currentPage = 2;
    }
    console.log('Page Index:', event.pageIndex); // Check what pageIndex is when Next is clicked
    this.getUserPurchases(); // Fetch new data when page changes
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
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

  viewMembership(id: any) {
    const userPurchase = this.getSubscriptionById(id);

    console.info('userPurchase', userPurchase);
    const dialogRef = this.dialog.open(ViewMembershipPopupComponent, {
      width: '800px',
      // width: '70vw',
      panelClass: 'view_membership_popup',
      data: {
        invoice_number: userPurchase.invoice_number,
        category: userPurchase.payment_method,
        plan: userPurchase.package_name,
        duration: userPurchase.interval,
        valid_until: userPurchase.plan_period_end,
        price: userPurchase.plan_amount,
        subtotal: userPurchase.subtotal,
        total: userPurchase.total,
        currency: userPurchase.amount_paid_currency,
        download_path: userPurchase.invoice_file_path,
        tax_percentage: userPurchase.tax_percentage,
        tax: userPurchase.tax_amount,
        created_at: userPurchase.created_at,
        package_price: userPurchase.package_price,
        proration_amount: userPurchase.proration_amount,
        coupon_used: userPurchase.coupon_used,
        coupon_discount: userPurchase.coupon_discount,
        discount_amount: userPurchase.discount_amount,
      }
    });
  }

  async getBoosterData() {

    let params: any = {};
    // params.lang = localStorage.getItem('lang_id');

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


  editMembershipDialog(id: any) {

    const dialogRef = this.dialog.open(EditMembershipProfileComponent, {
      width: '1000px',
      data: { stats: this.stats }
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
      this.selectedIds = this.userPurchases.map((fav: any) => fav.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected favorite IDs:', this.selectedIds);
  }

  async downloadInvoice(invoideId: any, invoiceUrl: any) {
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
        anchor.download = 'invoice-' + invoideId + '.pdf'; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
  }

  downloadAll(): any {

    if (this.selectedIds.length == 0) {
      return false;
    }
    this.selectedIds = this.userPurchases.map((fav: any) => fav.id);

    const allLinksToDownload = this.selectedIds.map(id => {
      // Find the user object by matching the id
      const purchase = this.userPurchases.find((purchase: any) => purchase.id === id);

      // Return the image link if the user is found, otherwise return null or undefined
      return purchase ? purchase.invoice_file_path : null;
    });

    this.downloadAllFiles(allLinksToDownload);

  }

  async downloadAllFiles(allLinksToDownload: any) {
    // Loop over each file URL and trigger the download sequentially
    for (const [index, fileUrl] of allLinksToDownload.entries()) {
      // Call downloadFile with each URL and a custom filename
      await this.downloadInvoice(index + 1, fileUrl);
    }
  }


  getSubscriptionById(id: string) {
    return this.userPurchases.find((subscription: any) => subscription.id === id);
  }


  confirmAndCancelSubscription(subscriptionId: string): void {

    const dialogRef = this.dialog.open(MessagePopupComponent, {
      width: '600px',
      data: {
        action: 'delete-confirmation',
        message: this.cancelConfirmationMsg
        // message: 'Are you sure you want to cancel this subscription? This action cannot be undone.'
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
          // this.dialog.open(MessagePopupComponent, {
          //   width: '600px',
          //   data: {
          //     action: 'display',
          //     message: this.subsciptionCancelSuccess
          //   }
          // });
          this.toaster.success(this.subsciptionCancelSuccess + '');
          console.log('Subscription canceled successfully:', response);
          this.newPremium.stripe_cancel_at = 'now'; // disable button after click
          setTimeout(() => {
            this.getUserPlans();
          }, 100);

        } else {
          console.error('Failed to cancel subscription', response);
          setTimeout(() => {
            this.getUserPlans();
          }, 0);

        }
      },
      error => {
        console.error('Error cancelling subscription:', error);
      }
    );
  }

  confirmCountryPlanCancellation(country: any) {
    console.info('country', country)
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
      }

      if (result.role != undefined && result.role != '') {
        if (result.role == 'talent' || result.role == 'scout' || result.role == 'club') {
          if (result.user_id != '' && result.user_id != undefined && result.redirect_path) {
            this.router.navigate([result.redirect_path, result.user_id]);
          }
        }
      }
    });
  }
  capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }


  loadTranslations() {
    this.translateService.get(['cancelConfirmationMsg', 'userPurchasesNotFound', 'subsciptionCancelSuccess']).subscribe((translations) => {
      this.cancelConfirmationMsg = translations['cancelConfirmationMsg'];
      this.userPurchasesNotFound = translations['userPurchasesNotFound'];
      this.subsciptionCancelSuccess = translations['subsciptionCancelSuccess'];
    });
  }
  getJsonTranslations() {
    this.translateService.get(['membership']).subscribe((translations) => {
      this.pageTitle = translations['membership'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

  isopenCustomerPortal: boolean = false;
  // openCustomerPortal(): void {
  //   this.isopenCustomerPortal = true;
  //   this.paymentService.generateLinkAndNavigate().pipe(take(1)).subscribe({
  //     next: (response: any) => {
  //       if (response?.data) {
  //         if (response?.data?.[0]?.url?.trim()) {
  //           this.isopenCustomerPortal = false;
  //           // window.location.href = response?.data?.[0]?.url?.trim(); // ✅ Redirect
  //           window.open(response?.data?.[0]?.url?.trim());
  //         }
  //         this.isopenCustomerPortal = false;
  //       } else {
  //         console.error('URL not found in response');
  //       }
  //       this.isopenCustomerPortal = false;
  //     },
  //     error: (err: any) => {
  //       console.error('Failed to generate customer portal link:', err);
  //       this.isopenCustomerPortal = false;
  //     }
  //   });
  // }

  openCustomerPortal(): void {
    this.isopenCustomerPortal = true;

    this.paymentService.generateLinkAndNavigate().pipe(take(1)).subscribe({
      next: (response: any) => {
        this.isopenCustomerPortal = false;

        const url = response?.data?.[0]?.url?.trim();
        if (!url) {
          console.error('URL not found in response');
          return;
        }

        // this.forceDownload(url, 'Open Member Ship');
        window.location.href = url;
        // window.open(response?.data?.[0]?.url?.trim());
        // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        // const isSafariIOS = isIOS || isSafari;

        // if (isSafariIOS) {
        //   // 🧠 SAFARI FIX: Use anchor element (not window.open)
        //   const link = document.createElement('a');
        //   link.href = url;
        //   link.target = '_blank';
        //   link.rel = 'noopener noreferrer';
        //   document.body.appendChild(link);
        //   link.click();
        //   document.body.removeChild(link);
        // } else {
        //   // ✅ For Chrome, Firefox, Edge etc.
        //   window.open(url, '_blank');
        // }
      },
      error: (err: any) => {
        console.error('Failed to generate customer portal link:', err);
        this.isopenCustomerPortal = false;
      }
    });
  }


  async forceDownload(src: string, filename: string) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob(); // Convert the response to a Blob object
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename; // Use the filename passed to the function
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }

}
