import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
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
