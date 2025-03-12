import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-cookie',
  templateUrl: './cookie.component.html',
  styleUrl: './cookie.component.scss',
   encapsulation: ViewEncapsulation.None,
})
export class CookieComponent implements OnInit {
  adVisible: boolean[] = [true, true, true]; // Array to manage ad visibility
  banner_title:any = null;
  page_content:any=null;
  banner_img:any=null;
  base_url:any=null;
  advertisemnet_base_url:string = '';

  isLoading : boolean = true;
  btnLoading : boolean = true;
  countdown: number = 10;


  constructor( private webPages: WebPages, private sanitizer: DomSanitizer){

  }
  ngOnInit() {
    // Initially, all ads are visible
    // this.adVisible = [true, true, true];
    this.adVisible = [false, false, false];
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
    });
  }

  advertisementList: any = null;

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

  getPageData(languageId: any){
    this.webPages.getDynamicContentPage('cookie_policy',languageId).subscribe((res) => {
      if(res.status){
          this.banner_title = res.data.pageData.banner_title;
          this.page_content = this.sanitizer.bypassSecurityTrustHtml(res.data.pageData.page_content);
          this.banner_img = res.data.pageData.banner_img;
          this.base_url =  res.data.base_url;

          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
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

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }

}