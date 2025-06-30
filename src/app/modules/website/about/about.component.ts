import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'] // Note the plural 'styleUrls'
})
export class AboutComponent {
  adVisible = [true, true, true, true, true, true, true]; // Array to control ad visibility
  about_banner_title: string = '';
  about_banner_desc: string = '';
  currentTheme: string = localStorage.getItem('theme') + '';
  countries = [
    { name: 'Switzerland', url: 'https://www.socceryou.ch' },
    { name: 'Germany', url: 'https://www.socceryou.de' },
    { name: 'France', url: 'https://www.socceryou.fr' },
    { name: 'Italy', url: 'https://www.socceryou.it' },
    { name: 'Portugal', url: 'https://www.socceryou.pt' },
    { name: 'England', url: 'https://www.socceryou.co.uk' },
    { name: 'Spain', url: 'https://www.socceryou.es' },
    { name: 'Belgium', url: 'https://www.socceryou.be' },
    { name: 'Sweden', url: 'https://www.socceryou.se' },
    { name: 'Denmark', url: 'https://www.socceryou.dk' }
  ];

  countriesUrl = [
    { name: 'Switzerland', url: 'https://www.socceryou.ch' },
    { name: 'Germany', url: 'https://www.socceryou.de' },
    { name: 'France', url: 'https://www.socceryou.fr' },
    { name: 'Italy', url: 'https://www.socceryou.it' },
    { name: 'Portugal', url: 'https://www.socceryou.pt' },
    { name: 'England', url: 'https://www.socceryou.co.uk' },
    { name: 'Spain', url: 'https://www.socceryou.es' },
    { name: 'Belgium', url: 'https://www.socceryou.be' },
    { name: 'Sweden', url: 'https://www.socceryou.se' },
    { name: 'Denmark', url: 'https://www.socceryou.dk' }
  ];
  about_hero_heading_txt: string = '';
  about_hero_heading:string='';
  country_section_title: string = '';
  about_hero_btn_txt: string = '';
  about_hero_btn_link: string = '';
  about_banner_bg_img: string = '/assets/images/about_page/banner_bg_img.png'; 
  about_banner_img: string = '';
  country_section_banner_img: string = '';
  country_section_banner_img_dark_mode: string = '';
  // advertisementData:any=null;
  advertisementList: any = null;
  advertisemnet_base_url:string= '';
  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;

  // isLoading : boolean = true;
  
  isActive : any ={
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

  // advertisementData

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


  constructor(
    private webPages: WebPages,
    private globalSettings: GlobalSettingsService
    ) { }
    ngOnInit(): void {
      // Initialize form with validation rules
      this.webPages.languageId$.subscribe((data) => {
        this.getPageData(data)
      });
      this.globalSettings.indexFunctionCall$.subscribe(() => {
        this.ThemeUpdated(); // Call the function when event is received
      });
    }

    
  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('about_us',languageId).subscribe((res) => {
      if(res.status){
          this.about_banner_title = res.data.pageData.about_banner_title;
          this.about_banner_desc = res.data.pageData.about_banner_desc;
          this.countries = res.data.pageData.about_country_names;
          this.country_section_title = res.data.pageData.country_section_title;
          this.about_hero_heading_txt = res.data.pageData.about_hero_heading_txt;
          this.about_hero_heading = res.data.pageData.about_hero_heading;
          this.about_hero_btn_txt = res.data.pageData.about_hero_btn_txt;
          this.about_hero_btn_link = res.data.pageData.about_hero_btn_link;
          // this.about_banner_bg_img = res.data.base_url+res.data.pageData.about_banner_bg_img;
          this.about_banner_img =  res.data.base_url+res.data.pageData.about_banner_img;
          this.country_section_banner_img=  res.data.base_url+res.data.pageData.country_section_banner_img;
         
          this.advertisementData = res.data.advertisementData;
          this.advertisementList = res.data.allAdsList;
          // this.advertisementData = [];
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;

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

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }
  ThemeUpdated() {
    // this.getArrayItemByIndex(this.accordinCurrentIndex, 'image');
    this.currentTheme = localStorage.getItem('theme') + '';
  }
  
  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
