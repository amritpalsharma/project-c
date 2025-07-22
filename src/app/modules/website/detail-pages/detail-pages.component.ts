import { Component, ViewEncapsulation, Input } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ShareService } from '../../../services/share.service';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-pages',
  templateUrl: './detail-pages.component.html',
  styleUrls: ['./detail-pages.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class DetailPagesComponent {
  htmlContent!: SafeHtml;
  id!: string;
  news: any = [{ content: '', title: '', featured_image: '', created_at: '' }]
  moreNews: any = [];
  adVisible: boolean[] = [true, true, true, true, true, true]; // Array to manage ad visibility
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  currentLang: any = localStorage.getItem('lang_id');

  blogTitle: string = '';
  blogSlug: string = '';

  blogUrl = window.location.href;
  description: string = '';
  constructor(
    private shareService: ShareService,
    private route: ActivatedRoute,
    private router: Router,
    private webPages: WebPages,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.description = 'SoccerYou News';
    // Initially, all ads are visible
    // this.adVisible = [true, true, true,true, true, true];
    this.adVisible = [false, false, false, false, false, false];
    this.route.params.subscribe((params) => {
      this.id = params['slug'];
      this.getPageData(this.currentLang);
    });
    // this.getTranslation(); News
    this.getPageData(this.currentLang);
    this.webPages.languageId$.subscribe((data) => {
      this.currentLang = data;
      this.getPageData(data);
      // this.getTranslation();
    });

  }

  getTranslation() {
  }
  getPageData(languageId: any): void {
    let str = this.id;
    let noSpace = str.replace(/\s+/g, '');
    this.webPages.getNewsContentPage(noSpace, languageId).subscribe((res) => {
      if (res.status) {
        this.news = res.data.news;
        this.moreNews = res.data.moreNews;
        this.news.content = this.sanitizer.bypassSecurityTrustHtml(this.news.content);
        this.news.featured_image = res.data.news_img_path + res.data.news.featured_image;
        // this.news.content = this.sanitizer.bypassSecurityTrustHtml(this.news.content);
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


  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/no_cover_img1.png'; // or wherever your fallback image is
  }

  // SHARE CODE
  get facebookUrl() {
    this.blogTitle = this.news.title;
    return this.shareService.getFacebookShareUrl(this.blogUrl);
  }

  get linkedInUrl() {
    this.blogTitle = this.news.title;
    return this.shareService.getLinkedInShareUrl(this.blogUrl, this.blogTitle);
  }

  get twitterUrl() {
    this.blogTitle = this.news.title;
    // this.blogSlug = this.news.slug;
    return this.shareService.getTwitterShareUrl(this.blogUrl, this.blogTitle, '#soccerYou');
  }

  get emailUrl() {
    this.blogTitle = this.news.title;
    // this.blogSlug = this.news.slug;
    return this.shareService.getEmailShareUrl(this.blogTitle, `${this.description}\n\n${this.blogTitle}\n\n${this.blogUrl}`);
  }

}
