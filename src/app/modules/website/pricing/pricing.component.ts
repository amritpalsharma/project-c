import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Boost Profile Plan
  pageData: any; // To hold the API response data
  advertisemnet_base_url:string= '';
  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;
  // advertisemnet_base_url: string = '';
  base_url: string = '';
  // isLoading: boolean = true;

  premiumMonthlyPrice: string = '';
  Currency: string = '';
  premiumPackageName: string = '';

  premiumPrice: string = '';
  premiumYearlyPrice: string = '';

  boostPrice: string = '';
  boostYearlyPrice: string = '';


  countryPrice: string = '';
  countryYearlyPrice: string = '';
  pricing_banner_img: string = '../../../../assets/images/Pricing-banner.png';

  // adVisible: boolean[] = [true, true, true, true, true, true, true]; // Array to manage ad visibility
  adVisible: boolean[] = [false, false, false, false, false, false, false];

  constructor(private webPages: WebPages) { }

  ngOnInit() {
    // Retrieve the states from local storage
    const savedState1 = localStorage.getItem('toggleState1');
    const savedState2 = localStorage.getItem('toggleState2');
    const savedState3 = localStorage.getItem('toggleState3');

    // Set isActive for each toggle based on the saved states or default to false
    this.isActive1 = savedState1 === 'true' ? true : false;
    this.isActive2 = savedState2 === 'true' ? true : false;
    this.isActive3 = savedState3 === 'true' ? true : false;

    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data);
      // this.getCurrencyandMonthlyPrice('monthly');
      // this.getCurrencyandYearlyPrice('yearly');
      this.getCurrencyPrice('monthly');
      this.getCurrencyPrice('yearly');
    });
  }

  
  advertisementList: any =null;


  isActive: any = {
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard: true,
    banner: true,
    square: true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }

  advertisementData: any = {
    skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    wide_skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    banner: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    small_square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    inline_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
  }

  toggle1() {

    this.isActive1 = !this.isActive1;
    localStorage.setItem('toggleState1', this.isActive1.toString());
  }

  toggle2() {
    this.isActive2 = !this.isActive2;
    localStorage.setItem('toggleState2', this.isActive2.toString());
  }

  toggle3() {
    this.isActive3 = !this.isActive3;
    localStorage.setItem('toggleState3', this.isActive3.toString());
  }

  // closeAd(index: number) {
  //   this.adVisible[index] = false;
  // }

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('pricing', languageId).subscribe((res) => {
      if (res.status) {
        this.pageData = res.data.pageData; // Store the page data in the component
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisementData = res?.data?.advertisementData;
        this.advertisementList = res?.data?.allAdsList;

        this.pricing_banner_img = this.pageData.pricing_banner_img;
        this.base_url = res.data.base_url;
        if (this.pricing_banner_img != '') {
          this.pricing_banner_img = this.base_url + this.pricing_banner_img;
          
        }
        
        this.isLoading = false;
        this.startCountdown();
      }
    });
  }

  startCountdown() {
    this.countdown = 5; // Reset countdown
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.btnLoading = false; // Stop loading when countdown reaches 0
      }
    }, 1000);
  }

  closeAd(object: any) {

    this.isActive[object] = false;

  }


  isEmptyObject(obj: any) {
    if (typeof obj != 'undefined') {
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
  }

  openModal(modalId: string) {
    console.log(`Open modal: ${modalId}`);
    // Implement modal opening logic here
  }
  checkActive(obj: any) {
    if (this.isExists(obj) && this.isFeaturedImageExists(obj) && this.isActive[obj]) {
      return true;
    }
    return false;
  }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }

  getCurrencyandMonthlyPrice(tab_and_interval: string) {
    let interval = 'monthly';
    this.webPages.getPriceAndCurrency(interval).subscribe((res) => {
      if (res.status) {
        if (res.status && res.data?.premium?.plans?.length > 0) {
          this.Currency = res.data.premium.plans[0].currency;
          this.premiumPrice = parseInt(res.data.premium.plans[0].price, 10) + '';
          this.boostPrice = parseInt(res.data.booster.plans[0].price, 10) + '';
          this.countryPrice = parseInt(res.data.country.plans[0].price, 10) + '';
        }
      }
    })
  }

  getCurrencyandYearlyPrice(tab_and_interval: string) {
    let interval = 'yearly';
    this.webPages.getPriceAndCurrency(interval).subscribe((res) => {
      if (res.status) {
        if (res.status && res.data?.premium?.plans?.length > 0) {
          this.Currency = res.data.premium.plans[0].currency;
          this.premiumYearlyPrice = parseInt(res.data.premium.plans[0].price, 10) + '';
          this.boostYearlyPrice = parseInt(res.data.booster.plans[0].price, 10) + '';
          this.countryYearlyPrice = parseInt(res.data.country.plans[0].price, 10) + '';
        }
      }
    })
  }


  getCurrencyPrice(interval: string) {
    this.webPages.getPriceAndCurrency(interval).subscribe((res) => {
      if (res.status) {
        if (res.status && res.data?.premium?.plans?.length > 0) {
          this.Currency = res.data.premium.plans[0].currency;
          if (interval == 'yearly') {
            this.premiumYearlyPrice = parseInt(res.data.premium.plans[0].price, 10) + '';
            this.boostYearlyPrice = parseInt(res.data.booster.plans[0].price, 10) + '';
            this.countryYearlyPrice = parseInt(res.data.country.plans[0].price, 10) + '';
          }
          if (interval == 'monthly') {
            this.premiumPrice = parseInt(res.data.premium.plans[0].price, 10) + '';
            this.boostPrice = parseInt(res.data.booster.plans[0].price, 10) + '';
            this.countryPrice = parseInt(res.data.country.plans[0].price, 10) + '';
          }
        }
      }
    })
  }
}
