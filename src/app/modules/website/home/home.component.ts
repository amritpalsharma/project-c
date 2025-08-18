import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isExplorePage: boolean = false;
  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(() => {
      if (this.router.url === '/explore') {
        this.isExplorePage = true;
      }
    });
  }
}
