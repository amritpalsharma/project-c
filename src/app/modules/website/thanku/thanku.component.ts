import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { ssrDebug } from '../../../services/ssr-debug';

@Component({
  selector: 'app-thanku',
  templateUrl: './thanku.component.html',
  styleUrl: './thanku.component.scss'
})
export class ThankuComponent {
  constructor(
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    ssrDebug(this.platformId, 'ThankyouComponent');
    //this.translateService.setDefaultLang('en'); // Set default language
    //this.translateService.use('en'); // Use default language
  }


  ngOnInit() {
    if (typeof document === 'undefined') {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('static-common-banner');
    }
  }

  ngOnDestroy() {
    if (typeof document === 'undefined') {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('static-common-banner');
    }
  }

}
