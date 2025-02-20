import { Component } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  isActive1 = true; // Premium Plan
  isActive2 = true; // Multi-Country Plan
  isActive3 = true; // Boost Profile Plan
  pageData: any; // To hold the API response data

  // adVisible: boolean[] = [true, true, true, true, true, true, true]; // Array to manage ad visibility
  adVisible: boolean[] = [false, false, false, false, false, false, false];
  
  constructor(private webPages: WebPages) {}

  ngOnInit() {
    // Retrieve the states from local storage
    const savedState1 = localStorage.getItem('toggleState1');
    const savedState2 = localStorage.getItem('toggleState2');
    const savedState3 = localStorage.getItem('toggleState3');

    // Set isActive for each toggle based on the saved states or default to false
    this.isActive1 = savedState1 === 'true' ? true : false;
    this.isActive2 = savedState2 === 'true' ? true : false;
    this.isActive3 = savedState3 === 'true' ? true : false;

    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data);
    });
  }

  toggle1() {
    this.isActive1 = !this.isActive1;
    localStorage.setItem('toggleState1', this.isActive1.toString());
  }

  toggle2() {
    this.isActive2 = !this.isActive2;
    localStorage.setItem('toggleState2', this.isActive2.toString());
  }

  toggle3() {
    this.isActive3 = !this.isActive3;
    localStorage.setItem('toggleState3', this.isActive3.toString());
  }

  closeAd(index: number) {
    this.adVisible[index] = false;
  }

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('pricing', languageId).subscribe((res) => {
      if (res.status) {
        this.pageData = res.data.pageData; // Store the page data in the component
      }
    });
  }
}
