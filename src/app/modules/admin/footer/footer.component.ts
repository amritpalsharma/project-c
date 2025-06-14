import { Component } from '@angular/core';
import { DomainSlugService } from '../../../services/domain-slug.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(public domainSlugService: DomainSlugService) {

  }
}
