import { Component } from '@angular/core';

@Component({
  selector: 'app-password-reset-link',
  templateUrl: './password-reset-link.component.html',
  styleUrl: './password-reset-link.component.scss'
})
export class PasswordResetLinkComponent {
  
  ngOnInit() {
    document.body.classList.add('static-common-banner');
  }
  
  ngOnDestroy() {
    document.body.classList.remove('static-common-banner');
  }
}
