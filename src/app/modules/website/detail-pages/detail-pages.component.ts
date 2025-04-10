import { Component, ViewEncapsulation } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-pages',
  templateUrl: './detail-pages.component.html',
  styleUrls: ['./detail-pages.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class DetailPagesComponent {
  id!: string;
  news: any = [{ content: '', title: '', featured_image: '', created_at: '' }]
  moreNews: any = [];
  adVisible: boolean[] = [true, true, true, true, true, true]; // Array to manage ad visibility
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  currentLang: any = localStorage.getItem('lang_id');
  constructor(private route: ActivatedRoute, private router: Router, private webPages: WebPages) { }

  ngOnInit() {
    // Initially, all ads are visible
    // this.adVisible = [true, true, true,true, true, true];
    this.adVisible = [false, false, false, false, false, false];
    this.route.params.subscribe((params) => {
      this.id = params['slug'];
      this.getPageData(this.currentLang);
    });
    this.getPageData(this.currentLang);
    this.webPages.languageId$.subscribe((data) => {
      this.currentLang = data;
      this.getPageData(data)
    });

  }
  getPageData(languageId: any): void {
    let str = this.id;
    let noSpace = str.replace(/\s+/g, '');
    this.webPages.getNewsContentPage(noSpace, languageId).subscribe((res) => {
      if (res.status) {
        this.news = res.data.news;
        this.moreNews = res.data.moreNews;
        this.news.featured_image = res.data.news_img_path + res.data.news.featured_image;
      } else {
        this.moreNews = [];
        this.news = [];
      }
    });
  }
  closeAd(index: number) {
    this.adVisible[index] = false; // Set the specific ad to not visible based on index
  }

  navigateNews(slug: any) {
    if (slug != '' && slug != undefined) {
      this.router.navigate(['/news', slug]);
    }
  }

}
