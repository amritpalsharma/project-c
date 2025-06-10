import { Component } from '@angular/core';
import { DomainSlugService } from '../../../services/domain-slug.service';

@Component({
  selector: 'shared-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(public domainSlugService: DomainSlugService) {

  }
}
