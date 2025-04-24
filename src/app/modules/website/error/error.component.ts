import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {

  ngOnInit() {
    document.body.classList.add('static-common-banner');
  }
  
  ngOnDestroy() {
    document.body.classList.remove('static-common-banner');
  }
  
}
