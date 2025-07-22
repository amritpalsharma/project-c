import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  Router,
  NavigationStart,
  Event as NavigationEvent,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements OnInit {
  event$: any;
  path: any;
  constructor(
    private router: Router,
  ) {
    // this.event$ = this.router.events.subscribe((event: NavigationEvent) => {
    //   if (event instanceof NavigationStart) {
    //     this.path = event.url;
    //     const targetDiv = document.querySelector('.page-container');
    //     if (targetDiv) {
    //       targetDiv.scrollTo(0, 0);
    //     }
    //   }
    // });
  }
  ngOnInit(): void { }

}
