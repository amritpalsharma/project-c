import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ImprintComponent implements OnInit {
  banner_title:any = null;
  // advertisementData:any;
  page_content:any=null;
  advertisemnet_base_url:string = '';
  banner_img:any=null;
  base_url:any=null;

  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;

  // advertisemnet_base_url:string= '';
  adVisible: boolean[] = [true, true, true]; // Array to manage ad visibility
  constructor( private webPages: WebPages, private sanitizer: DomSanitizer){

  }

  advertisementList: any = null;

  isActive : any ={
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

  ngOnInit() {
    // Initially, all ads are visible
    this.adVisible = [true, true, true];
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)

    });
   
  }

  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('imprint',languageId).subscribe((res) => {
      if(res.status){
          this.banner_title = res.data.pageData.banner_title;
          this.page_content = res.data.pageData.page_content;
          
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
         
          this.banner_img = res.data.pageData.banner_img;
          this.base_url =  res.data.base_url;

          
          this.advertisementData = res?.data?.advertisementData;
          this.advertisementList = res?.data?.allAdsList;
          
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
  // isEmptyObject(obj:any) {
  //   if(typeof obj != 'undefined'){
  //     return (obj && (Object.keys(obj).length === 0));
  //   }
  //   return true;
  // }
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

  closeAd(object: any) {

    this.isActive[object] = false;

  }
  

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
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  } 

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }

  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
