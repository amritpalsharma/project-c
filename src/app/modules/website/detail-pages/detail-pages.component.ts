import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebPages } from '../../../services/webpages.service';
@Component({
  selector: 'app-detail-pages',
  templateUrl: './detail-pages.component.html',
  styleUrl: './detail-pages.component.scss'
})
export class DetailPagesComponent {
  id!: string;
  news:any = [{content:'',title:'',featured_image:'',created_at:''}]
  moreNews:any = [];
  adVisible: boolean[] = [true, true, true,true, true, true]; // Array to manage ad visibility
  constructor(private route: ActivatedRoute,private webPages: WebPages) {}

  ngOnInit() {
    // Initially, all ads are visible
    // this.adVisible = [true, true, true,true, true, true];
    this.adVisible = [false, false, false,false, false, false];
    this.route.params.subscribe((params) => {
      this.id = params['slug'];
      //this.getPageData(1);
    });
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
    });

  }
  getPageData(languageId: any): void {
    this.webPages.getNewsContentPage(this.id,languageId).subscribe((res) => {
      if(res.status){
          this.news = res.data.news;
          this.moreNews = res.data.moreNews;
          this.news.featured_image = res.data.news_img_path + res.data.news.featured_image;
      }
    });
  }
  closeAd(index: number) {
    this.adVisible[index] = false; // Set the specific ad to not visible based on index
  }



}
