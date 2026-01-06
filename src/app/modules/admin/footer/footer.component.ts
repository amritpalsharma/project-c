import { Component } from '@angular/core';
import { DomainSlugService } from '../../../services/domain-slug.service';
import {
  Router,
  NavigationStart,
  Event as NavigationEvent,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  event$: any;
  currentYear: number = new Date().getFullYear();
  constructor(public domainSlugService: DomainSlugService, public router: Router) {
    this.event$ = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        // this.path = event.url;
        const targetDiv = document.querySelector('.page-container');
        if (targetDiv) {
          targetDiv.scrollTo(0, 0);
        }
      }
    });
  }
}
