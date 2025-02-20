import { Component, AfterViewInit } from '@angular/core';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { TalentService } from '../../../../services/talent.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
})
export class AddCardComponent  {
}
