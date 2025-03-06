import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrl: './club.component.scss'
})
export class ClubComponent {
  baseUrl:string='';
  pageData:any = [{
    banner_title:'',
    banner_desc:'',
    banner_btn_txt:'',
    club_nd_scout_section_title:'',
    club_nd_scout_section:[],
    feature_sctn_title:'',
    feature_sctn:[],
    pricing_sctn_title:'',
    pricing_tab:[],
  }];
  // advertisementData:any=null;
  advertisemnet_base_url:string= '';
  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;


  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Multi-Country Plan

  activeAccordionIndex = 1;

  constructor( private webPages: WebPages){ 

  }

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

    this.webPages.languageId$.subscribe((data) => {
    this.getPageData(data)
  });

  }

  
  isActive : any = {
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard:true,
    banner: true,
    square:true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }

  advertisementData:any = {
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

  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('clubs_and_scouts',languageId).subscribe((res) => {
      if(res.status){
          this.pageData = res.data.pageData;
          this.baseUrl = res.data.base_url;

          
          this.advertisementData = res.data.advertisementData;
          // this.advertisementData = [];
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
          
          // Initialize toggle states for pricing plans with Monthly active (false)
          this.pageData.pricing_tab.forEach((_: any, index: number) => {
            this.isActivePlan[index] = false; // Default to "Monthly"
          });
          
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
  

  isEmptyObject(obj:any) {
    if(typeof obj != 'undefined'){
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
    return key in this.advertisementData;
  }

  isFeaturedImageExists(key: any): boolean {
    return 'featured_image' in this.advertisementData[key];
  }

}
