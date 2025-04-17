interface FeatureSection {
  title: string;
  desc: string;
  icon: string;
  dark_icon: string;
  image: string;
  dark_image: string;
}

import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss'
})
export class ClubComponent {
  baseUrl: string = '';
  currentFeatureImage: string = '';
  accordinCurrentIndex: number = 0;
  feature_sctn: any = [];
  currentTheme: string = localStorage.getItem('theme') || 'light';
  currentLang: any = localStorage.getItem('lang') || 'en';
  pageData: any = [{
    banner_title: '',
    banner_desc: '',
    banner_btn_txt: '',
    club_nd_scout_section_title: '',
    club_nd_scout_section: [],
    feature_sctn_title: '',
    feature_sctn: [],
    pricing_sctn_title: '',
    pricing_tab: [],
  }];
  // advertisementData:any=null;
  activeIndex: number = 0;

  advertisementList: any = null;
  advertisemnet_base_url: string = '';
  isLoading: boolean = true;
  btnLoading: boolean = true;
  countdown: number = 10;


  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Multi-Country Plan

  activeAccordionIndex = 1;
  Currency: string = '';
  premiumPackageName: string = '';

  premiumPrice: number = 0;
  premiumYearlyPrice: number = 0;

  boostPrice: number = 0;
  boostYearlyPrice: number = 0;


  countryPrice: number = 0;
  countryYearlyPrice: number = 0;

  // 

  constructor(private webPages: WebPages, private globalSettings: GlobalSettingsService) {

  }
  plansPageLink: any = this.globalSettings.getPlansLink();
  setActiveAccordion(index: number): void {
    this.activeAccordionIndex = index;
  }

  isActivePlan: { [key: number]: boolean } = {}; // Keeps track of toggle states for each pricing plan

  ngOnInit() {
    // Retrieve the states from local storage
    const savedState1 = localStorage.getItem('toggleState1');
    const savedState2 = localStorage.getItem('toggleState2');
    this.adVisible = [true, true, true, true, true, true, true];

    // Set isActive for each toggle based on the saved states or default to false
    this.isActive1 = savedState1 === 'true' ? true : false;
    this.isActive2 = savedState2 === 'true' ? true : false;
    this.isActive3 = savedState2 === 'true' ? true : false;

    this.getCurrencyPrice('monthly');
    this.getCurrencyPrice('yearly');

    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data);
      this.currentLang = this.getLangslugByID(data);
      this.getCurrencyPrice('monthly');
      this.getCurrencyPrice('yearly');
    });
    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.ThemeUpdated(); // Call the function when event is received
    });
  }


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
      // featured_image: "leaderboard.png"
    },
    leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_leaderboard: {
      id: '1',
      // featured_image: "leaderboard.png"
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

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('clubs_and_scouts', languageId).subscribe((res) => {
      if (res.status) {
        this.pageData = res.data.pageData;
        this.baseUrl = res.data.base_url;


        this.advertisementData = res.data.advertisementData;
        this.advertisementList = res.data.allAdsList;
        // this.advertisementData = [];
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;

        // Initialize toggle states for pricing plans with Monthly active (false)
        this.pageData.pricing_tab.forEach((_: any, index: number) => {
          this.isActivePlan[index] = false; // Default to "Monthly"
        });
        if (this.pageData.feature_sctn && typeof this.pageData.feature_sctn != undefined) {
          this.feature_sctn = this.pageData.feature_sctn;
          this.accordinCurrentIndex = 0;
          setTimeout(() => {
            this.getArrayItemByIndex(this.accordinCurrentIndex, 'image');
          }, 1000);
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

  // closeAd(object: any) {

  //   switch(object){
  //     case 'skyscraper':
  //         this.advertisementData.skyscraper = [];
  //         break;
  //     case 'small_square':
  //         this.advertisementData.small_square = [];
  //         break;
  //     case 'leaderboard':
  //         this.advertisementData.leaderboard = [];
  //         break;
  //     case 'large_leaderboard':
  //         this.advertisementData.large_leaderboard = [];
  //         break;
  //     case 'large_rectangle':
  //         this.advertisementData.large_rectangle = [];
  //         break;

  //     case 'inline_rectangle':
  //         this.advertisementData.inline_rectangle = [];
  //         break;
  //     case 'square':
  //         this.advertisementData.square = [];
  //         break;
  //     default:
  //         //when no case is matched, this block will be executed;
  //         break;  //optional
  //     }

  // }

  togglePlan(index: number) {
    this.isActivePlan[index] = !this.isActivePlan[index];
  }

  toggle1() {
    this.isActive1 = !this.isActive1;
    // Save the new state to local storage
    localStorage.setItem('toggleState1', this.isActive1.toString());
  }

  toggle2() {
    this.isActive2 = !this.isActive2;
    // Save the new state to local storage
    localStorage.setItem('toggleState2', this.isActive2.toString());
  }

  toggle3() {
    this.isActive3 = !this.isActive3;
    // Save the new state to local storage
    localStorage.setItem('toggleState2', this.isActive3.toString());
  }

  premiumFeatures = [
    'The complete talent profile with all stages of his career and performance data.',
    'Export data in excel and pdf formats.',
    'Create your favorite list.',
    'Highlight your best photos and videos on your profile.',

  ];

  multiCountryFeatures = [
    'Present your profile to clubs and leagues in other countries.',
    'Higher chances to get hired globally.',
    'Build your global portfolio.'
  ];

  boosterFeatures = [
    'Present your profile to clubs and leagues in other countries.',
    'Higher chances to get hired globally.',
    'Build your global portfolio.'
  ];

  adVisible: boolean[] = [true, true, true, true, true, true, true]; // Array to manage ad visibility

  // isEmptyObject(obj:any) {
  //   if(typeof obj != 'undefined'){
  //     return (obj && (Object.keys(obj).length === 0));
  //   }
  //   return true;
  // }


  closeAd(object: any) {

    this.isActive[object] = false;

  }

  // checkActive(obj: any){
  //   if(this.isExists(obj) && this.isActive[obj]){
  //     return true;
  //   }
  //   return false;
  // }

  // isExists(key: string): boolean {
  //   return key in this.advertisementData && 'featured_image' in this.advertisementData[key];
  // }


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

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }

  getCurrencyPrice(interval: string) {
    this.webPages.getPriceAndCurrency(interval).subscribe((res) => {
      if (res.status) {
        if (res.status && res.data?.premium?.plans?.length > 0) {
          this.Currency = res.data.premium.plans[0].currency;
          if (interval == 'yearly') {
            this.premiumYearlyPrice = parseInt(res.data.premium.plans[0].price, 10);
            this.boostYearlyPrice = parseInt(res.data.booster.plans[0].price, 10);
            this.countryYearlyPrice = parseInt(res.data.country.plans[0].price, 10);
          }
          if (interval == 'monthly') {
            this.premiumPrice = parseInt(res.data.premium.plans[0].price, 10);
            this.boostPrice = parseInt(res.data.booster.plans[0].price, 10);
            this.countryPrice = parseInt(res.data.country.plans[0].price, 10);
          }
        }
      }
    })
  }

  // getPlanPrice(planName: string, isMonthly: boolean): number {
  //   if (!planName) return 0;

  //   const lowerPlanName = planName.toLowerCase();

  //   if (lowerPlanName.includes('premium')) {
  //     return isMonthly ? this.premiumPrice : this.premiumYearlyPrice;
  //   }
  //   if (lowerPlanName.includes('country') || lowerPlanName.includes('multi') || lowerPlanName.includes('flera')) {
  //     return isMonthly ? this.countryPrice : this.countryYearlyPrice;
  //   }
  //   if (lowerPlanName.includes('boost') || lowerPlanName.includes('perfil')) {
  //     //
  //     return isMonthly ? this.boostPrice : this.boostYearlyPrice;
  //   }

  //   console.warn(lowerPlanName);
  //   return 0; // Default price if no match
  // }
  getPlanPrice(planName: string, isMonthly: boolean): number {
    if (!planName) return 0;

    const lowerPlanName = planName.toLowerCase();

    if (lowerPlanName.includes('premium')) {
      return !isMonthly ? this.premiumPrice : this.premiumYearlyPrice;
    }
    if (lowerPlanName.includes('country') || lowerPlanName.includes('multi') || lowerPlanName.includes('flera')) {
      return !isMonthly ? this.countryPrice : this.countryYearlyPrice;
    }
    if (lowerPlanName.includes('boost')) {
      return !isMonthly ? this.boostPrice : this.boostYearlyPrice;
    }
    return 0; // Default price if no match
  }
  trackByFn(index: number, item: any): number {
    return index; // Tracks items by index to prevent re-rendering
  }

  getArrayItemByIndex12(index: number, field: keyof FeatureSection) {
    // alert('button clicked')
    let theme = localStorage.getItem('theme');
    if (typeof theme === 'undefined' || theme == null) {
      theme = 'light';
    }
    // console.info(this.feature_sctn);
    let lang = localStorage.getItem('lang');
    let image_index = index + 1;
    if (index >= 0 && index < this.feature_sctn.length) {
      this.accordinCurrentIndex = index;
      this.currentFeatureImage = '/assets/images/club_page/features/' + image_index + '_' + lang + '_' + theme + '.png';
      if (this.currentFeatureImage != '') {
        this.currentFeatureImage = this.currentFeatureImage;
      }
    }
  }
  getArrayItemByIndex(index: number, field: keyof FeatureSection) {
    let theme = localStorage.getItem('theme') || 'light';
    let lang = localStorage.getItem('lang');
    let image_index = index + 1;

    // Check if the index is within bounds
    if (index >= 0 && index < this.feature_sctn.length) {
      this.accordinCurrentIndex = index;

      // Construct the image URL
      const newImageSrc = `/assets/images/club_page/features/${image_index}_${lang}_${theme}.png`;

      // Only update if the image source has changed
      if (this.currentFeatureImage !== newImageSrc) {
        this.currentFeatureImage = newImageSrc;

        // Preload the image asynchronously
        const image = new Image();
        image.src = newImageSrc;
        image.onload = () => {
          // Update DOM or trigger necessary changes once the image has loaded
          this.currentFeatureImage = image.src;
        };
      }
    }
  }

  ThemeUpdated() {
    this.getArrayItemByIndex(this.accordinCurrentIndex, 'image');
    this.currentTheme = localStorage.getItem('theme') + '';
  }

  setActiveAccordionNew(index: number): void {
    if (this.activeIndex === index) {
      // If the clicked tab is already active, close it
      this.activeIndex = -1;
    } else {
      // Open the clicked tab
      this.activeIndex = index;
    }
  }
  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getLangslugByID(langID: any) {
    let slug = 'en';
    if (langID == 1) {
      slug = 'en';
    } else if (langID == 2) {
      slug = 'de';
    } else if (langID == 3) {
      slug = 'it';
    } else if (langID == 4) {
      slug = 'fr';
    } else if (langID == 5) {
      slug = 'es';
    } else if (langID == 6) {
      slug = 'pt';
    } else if (langID == 7) {
      slug = 'dk';
    } else if (langID == 8) {
      slug = 'sv';
    }
    return slug;
  }
}
