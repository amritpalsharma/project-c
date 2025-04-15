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
import { provideNetlifyLoader } from '@angular/common';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-talent',
  templateUrl: './talent.component.html',
  styleUrl: './talent.component.scss'
})

export class TalentComponent {

  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Multi-Country Plan
  accordinCurrentIndex = 0;
  dynamicTexts: string[] = []
  feature_sctn: [] = [];
  baseUrl: string = '';
  currentFeatureImage = '';

  pageData: any = [{
    banner_title: '',
    banner_desc: '',
    banner_btn_txt: '',
    talent_section_title: '',
    talent_section: [],
    feature_sctn_title: '',
    feature_sctn: [],
    pricing_sctn_title: '',
    pricing_tab: [],
  }];
  currentTheme: string = 'light';
  activeAccordionIndex = 0;
  // advertisementData:any=null;
  advertisemnet_base_url: string = '';

  isLoading: boolean = true;
  btnLoading: boolean = true;
  countdown: number = 10;

  Currency: string = '';
  premiumPackageName: string = '';

  premiumPrice: number = 0;
  premiumYearlyPrice: number = 0;

  boostPrice: number = 0;
  boostYearlyPrice: number = 0;


  countryPrice: number = 0;
  countryYearlyPrice: number = 0;

  setActiveAccordion(index: number): void {
    this.activeAccordionIndex = index;
  }

  constructor(
    private webPages: WebPages,
    private globalSettings: GlobalSettingsService,
    private authService: AuthService
  ) { }

  isActivePlan: { [key: number]: boolean } = {}; // Keeps track of toggle states for each pricing plan

  selectedLangSlug: string = this.globalSettings.getLanguage();
  isUserLoggedIn: boolean = false;
  LoggedInUserPlansLink: string = '';
  ngOnInit() {
    // Retrieve the states from local storage
    const savedState1 = localStorage.getItem('toggleState1');
    const savedState2 = localStorage.getItem('toggleState2');

    // Set isActive for each toggle based on the saved states or default to false
    this.isActive1 = savedState1 === 'true' ? true : false;
    this.isActive2 = savedState2 === 'true' ? true : false;
    this.isActive3 = savedState2 === 'true' ? true : false;
    this.adVisible = [true, true, true, true, true, true, true];

    this.webPages.languageId$.subscribe((data) => {
      // alert(data);
      this.getPageData(data)
      this.getCurrencyPrice('monthly');
      this.getCurrencyPrice('yearly');

      this.selectedLangSlug = localStorage.getItem('lang') || "en";
    });
    this.ThemeUpdated();
    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.ThemeUpdated(); // Call the function when event is received
    });

    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.LoggedInUserPlansLink = this.authService.getPlansPageLink();

  }

  advertisementList: any = null;

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
    this.webPages.getDynamicContentPage('talent', languageId).subscribe((res) => {
      if (res.status) {
        this.pageData = res.data.pageData;
        this.baseUrl = res.data.base_url;
        this.advertisementData = res.data.advertisementData;
        this.advertisementList = res.data.allAdsList;

        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        // Initialize toggle states for pricing plans with Monthly active (false)
        this.pageData.pricing_tab.forEach((_: any, index: number) => {
          this.isActivePlan[index] = false; // Default to "Monthly"
        });

        this.isLoading = false;
        this.startCountdown()
        // this.advertisementData = null;
        // console.warn(this.pageData.feature_sctn)
        this.feature_sctn = this.pageData.feature_sctn;
        this.isLoading = false;
        if (this.currentTheme == 'dark') {
          this.pageData.banner_bg_img = this.pageData.banner_bg_img;
        } else {
          this.pageData.banner_bg_img = this.pageData.banner_bg_img_dark_mode;
        }
        //  alert('this.currentTheme is '+this.currentTheme)
        if (this.currentTheme == 'dark' || this.currentTheme == 'light' && this.currentTheme) {
        } else {
          this.currentTheme = 'light'; // default value is light for theme
        }



        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        // Initialize toggle states for pricing plans with Monthly active (false)
        this.pageData.pricing_tab.forEach((_: any, index: number) => {
          this.isActivePlan[index] = false; // Default to "Monthly"
        });
        this.getArrayItemByIndex(this.accordinCurrentIndex, 'image');
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

  addText() {
    // Add new text when the + icon is clicked
    this.dynamicTexts.push('New dynamic text added!');
  }

  premiumFeatures = [
    'The complete talent profile with all stages of his career and performance data.',
    'Export data in excel and pdf formats.',
    'Create your favorite list.',
    'Highlight your best photos and videos on your profile.'
  ];

  multiCountryFeatures = [
    'Present your profile to clubs and leagues in other countries.',
    'Higher chances to get hired globally.',
    'Build your global portfolio.'
  ];

  boosterFeatures = [
    'Jump to the top of search results.',
    'HHigher chances to get discovered.',
    'Profile boosts help you grow your network and following faster.',
    'You can boost your profile to reach a specific audience, such as Talents, Clubs or Scouts.'
  ];


  adVisible: boolean[] = [true, true, true, true, true, true, true]; // Array to manage ad visibility

  togglePlan(index: number) {
    this.isActivePlan[index] = !this.isActivePlan[index];
  }

  // isEmptyObject(obj:any) {
  //   return (obj && (Object.keys(obj).length === 0));
  // }

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

  getPlanPrice(planName: string, isMonthly: boolean): number {
    if (!planName) return 0;

    const lowerPlanName = planName.toLowerCase();

    if (lowerPlanName.includes('premium')) {
      return !isMonthly ? this.premiumPrice : this.premiumYearlyPrice;
    }
    if (lowerPlanName.includes('country') || lowerPlanName.includes('multi') || lowerPlanName.includes('flera')) {
      return !isMonthly ? this.countryPrice : this.countryYearlyPrice;
    }
    if (lowerPlanName.includes('boost') || lowerPlanName.includes('perfil')) {
      //
      return !isMonthly ? this.boostPrice : this.boostYearlyPrice;
    }

    console.warn(lowerPlanName);
    return 0; // Default price if no match
  }
  trackByFn(index: number, item: any): number {
    return index; // Tracks items by index to prevent re-rendering
  }

  ThemeUpdated() {
    this.currentTheme = localStorage.getItem('theme') + '';
    this.getArrayItemByIndex(this.accordinCurrentIndex, 'image');
  }

  custIndex: any = 1;

  getArrayItemByIndex(index: number, field: keyof FeatureSection) {
    let theme = localStorage.getItem('theme');
    this.custIndex = index + 1;
    // alert(index);
    if (index >= 0 && index < this.feature_sctn.length) {
      this.accordinCurrentIndex = index;
      if (theme == 'dark') {
        this.currentFeatureImage = this.feature_sctn[index]['dark_image'];
      } else {
        this.currentFeatureImage = this.feature_sctn[index]['image'];
      }
      if (this.currentFeatureImage != '') {
        this.currentFeatureImage = this.baseUrl + this.currentFeatureImage;
      }
      console.warn('Index is ' + index + ' Image is ' + this.currentFeatureImage)
      // console.warn(this.feature_sctn[index]) 
      // alert(this.currentFeatureImage)
      // this.currentFeatureImage = this.feature_sctn[index][field]; // ✅ TypeScript now recognizes 'field' as valid
      //return this.feature_sctn[index][field]; // ✅ TypeScript now recognizes 'field' as valid
    }
    // return null;
  }

}
