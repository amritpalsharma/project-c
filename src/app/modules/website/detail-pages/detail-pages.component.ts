import { Component, ViewEncapsulation, Input } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ShareService } from '../../../services/share.service';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ssrDebug } from '../../../services/ssr-debug';
import { Title, Meta } from '@angular/platform-browser';

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
  currentLang: any = '2';

  blogTitle: string = '';
  blogSlug: string = '';

  blogUrl: string = '';
  description: string = '';
  constructor(
    private shareService: ShareService,
    private route: ActivatedRoute,
    private router: Router,
    private webPages: WebPages,
    private metaService: Meta,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    ssrDebug(this.platformId, 'DetailPageComponent');

  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = localStorage.getItem('lang_id');
      // this.blogUrl = window.location.href;
    }
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
        /*### Meta Tags ###*/
        this.metaService.updateTag({
          name: 'description',
          content: res.data.metaArr.meta_description
        });

        this.metaService.updateTag({
          property: 'og:title',
          content: res.data.metaArr.meta_title
        });

        this.metaService.updateTag({
          property: 'og:description',
          content: res.data.metaArr.meta_description
        });

        this.metaService.updateTag({
          property: 'og:image',
          content: res.data.metaArr.meta_image
        });
        /*### Meta Tags ###*/
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
