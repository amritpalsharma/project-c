import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('static-common-banner');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {

      document.body.classList.remove('static-common-banner');
    }
  }

}
