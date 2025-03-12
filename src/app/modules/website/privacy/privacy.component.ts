import { Component, OnInit, ViewEncapsulation  } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebPages } from '../../../services/webpages.service';
@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PrivacyComponent implements OnInit {
  adVisible: boolean[] = [true, true, true]; // Array to manage ad visibility
  banner_title:any = null;
  page_content:any=null;
  banner_img:any=null;
  base_url:any=null;
  advertisemnet_base_url:string = '';

  isLoading : boolean = true;


  constructor( private webPages: WebPages,private sanitizer: DomSanitizer){

  }
  ngOnInit() {
    // Initially, all ads are visible
    this.adVisible = [true, true, true];
    this.adVisible = [false, false, false];
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
    });
  }

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

  getPageData(languageId: any){ 
    // languageId = 1;
    this.webPages.getDynamicContentPage('privacy_policy',languageId).subscribe((res) => {
      if(res.status){
          this.banner_title = res.data.pageData.banner_title;
          this.page_content = this.sanitizer.bypassSecurityTrustHtml(res.data.pageData.page_content);
          this.banner_img = res.data.pageData.banner_img;
          this.base_url =  res.data.base_url;

          
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
          this.advertisementData = res?.data?.advertisementData;

          
          this.isLoading = false;

        }
    });
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

  isExists(key: any): boolean {
    return key in this.advertisementData;
  }

  isFeaturedImageExists(key: any): boolean {
    return 'featured_image' in this.advertisementData[key];
  }


}
