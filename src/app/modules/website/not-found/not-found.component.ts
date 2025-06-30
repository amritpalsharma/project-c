import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  
  ngOnInit() {
    document.body.classList.add('static-common-banner');
  }

  ngOnDestroy() {
    document.body.classList.remove('static-common-banner');
  }
}
