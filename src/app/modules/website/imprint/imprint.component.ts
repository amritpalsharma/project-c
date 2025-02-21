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
  advertisemnetData:any;
  page_content:any=null;
  advertisemnet_base_url:string = '';
  banner_img:any=null;
  base_url:any=null;
  adVisible: boolean[] = [true, true, true]; // Array to manage ad visibility
  constructor( private webPages: WebPages, private sanitizer: DomSanitizer){

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
          this.advertisemnetData =  res.data.advertisemnetData;
          this.advertisemnetData = [];
          
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
         
          this.banner_img = res.data.pageData.banner_img;
          this.base_url =  res.data.base_url;
        }
    });
  }
  isEmptyObject(obj:any) {
    if(typeof obj != 'undefined'){
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
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

}
