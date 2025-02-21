import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrl: './learn-more.component.scss'
})
export class LearnMoreComponent {
  id!: string;
  adVisible: boolean[] = [true, true, true,true, true, true]; // Array to manage ad visibility
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Initially, all ads are visible
    // this.adVisible = [true, true, true,true, true, true];
    this.adVisible = [false, false, false,false, false, false];
    this.route.params.subscribe((params) => {
      this.id = params['slug'];
      this.getContent(this.id);
    });

  }
  getContent(id: string): void {
     console.log('this id ',id);
  }
  closeAd(index: number) {
    this.adVisible[index] = false; // Set the specific ad to not visible based on index
  }

}
