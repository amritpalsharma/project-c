import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-password-reset-link',
  templateUrl: './password-reset-link.component.html',
  styleUrl: './password-reset-link.component.scss'
})
export class PasswordResetLinkComponent {
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
