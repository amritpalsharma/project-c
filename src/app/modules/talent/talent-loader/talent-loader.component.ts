import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-talent-loader',
  templateUrl: './talent-loader.component.html',
  styleUrl: './talent-loader.component.scss'
})
export class TalentLoaderComponent {
  @Input() width: string = '80px'; // Default width is 100%
  @Input() height: string = '80px'; // Default width is 100%
  @Input() border: string = '8px'; // Default width is 100%
}
