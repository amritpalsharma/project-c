import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrl: './email-verify.component.scss'
})
export class EmailVerifyComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
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
