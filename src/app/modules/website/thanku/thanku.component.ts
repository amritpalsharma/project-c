import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-thanku',
  templateUrl: './thanku.component.html',
  styleUrl: './thanku.component.scss'
})
export class ThankuComponent {
  constructor(
    private translateService: TranslateService,
  ){
    this.translateService.setDefaultLang('en'); // Set default language
    this.translateService.use('en'); // Use default language
  }

  

  

}
