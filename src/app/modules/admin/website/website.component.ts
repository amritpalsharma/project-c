import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleService } from '../../../title.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss'
})
export class WebsiteComponent {

  tab: any = "webpages";
  pageTitle: string = '';

  constructor(
    private dialog: MatDialog,
    private titleService: TitleService,
    private translateService: TranslateService,
    private sharedservice: SharedService,
  ) { }

  ngOnInit(): void {
    this.getJsonTranslations();
    this.sharedservice.data$.subscribe((data) => {
      if (data.action == 'lang_updated') {
        this.getJsonTranslations();
      }
    });
  }

  switchTab(tab: any) {
    this.tab = tab;
    this.getJsonTranslations();
  }


  getJsonTranslations() {
    this.translateService.get(['pages', 'blog', 'couponCode', 'adBanners']).subscribe((translations) => {
      if (this.tab == 'webpages') {
        this.pageTitle = translations['pages'];
      } else if (this.tab == 'blog') {
        this.pageTitle = translations['blog'];
      }
      else if (this.tab == 'coupons') {
        this.pageTitle = translations['couponCode'];
      } else if (this.tab == 'advertising') {
        this.pageTitle = translations['adBanners'];
      } else {
        this.pageTitle = translations['pages'];
      }
      this.titleService.setTitle(this.pageTitle);
    })
  }

}
