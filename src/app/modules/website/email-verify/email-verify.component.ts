import { Component } from '@angular/core';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrl: './email-verify.component.scss'
})
export class EmailVerifyComponent {

  ngOnInit() {
    document.body.classList.add('static-common-banner');
  }
  
  ngOnDestroy() {
    document.body.classList.remove('static-common-banner');
  }
}
