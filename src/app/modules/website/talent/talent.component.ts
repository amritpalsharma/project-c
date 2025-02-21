import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
@Component({
  selector: 'app-talent',
  templateUrl: './talent.component.html',
  styleUrl: './talent.component.scss'
})
export class TalentComponent {
  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Multi-Country Plan
  dynamicTexts: string[] = []
  baseUrl:string='';
  pageData:any = [{
    banner_title:'',
    banner_desc:'',
    banner_btn_txt:'',
    talent_section_title:'',
    talent_section:[],
    feature_sctn_title:'',
    feature_sctn:[],
    pricing_sctn_title:'',
    pricing_tab:[],
  }];
  activeAccordionIndex = 1;
  advertisemnetData:any=null;
  advertisemnet_base_url:string= '';

  setActiveAccordion(index: number): void {
    this.activeAccordionIndex = index;
  }
  
  constructor( private webPages: WebPages){  }

  isActivePlan: { [key: number]: boolean } = {}; // Keeps track of toggle states for each pricing plan

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
      this.getPageData(data)
    });
  }

  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('talent',languageId).subscribe((res) => {
      if(res.status){
          this.pageData = res.data.pageData;
          this.baseUrl = res.data.base_url;
          this.advertisemnetData = res.data.advertisemnetData;
          this.advertisemnetData = null;
          
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
          // Initialize toggle states for pricing plans with Monthly active (false)
          this.pageData.pricing_tab.forEach((_: any, index: number) => {
            this.isActivePlan[index] = false; // Default to "Monthly"
          });
        }
    });
  }

  closeAd(object: any) {

    switch(object){
      case 'skyscraper':
          this.advertisemnetData.skyscraper = [];
          break;
      case 'small_square':
          this.advertisemnetData.small_square = [];
          break;
      case 'leaderboard':
          this.advertisemnetData.leaderboard = [];
          break;
      case 'large_leaderboard':
          this.advertisemnetData.large_leaderboard = [];
          break;
      case 'large_rectangle':
          this.advertisemnetData.large_rectangle = [];
          break;

      case 'inline_rectangle':
          this.advertisemnetData.inline_rectangle = [];
          break;
      case 'square':
          this.advertisemnetData.square = [];
          break;
      default:
          //when no case is matched, this block will be executed;
          break;  //optional
      }

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

  isEmptyObject(obj:any) {
    return (obj && (Object.keys(obj).length === 0));
  }

}
