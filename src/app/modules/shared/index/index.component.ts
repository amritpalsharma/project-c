import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  Router,
  NavigationStart,
  Event as NavigationEvent,
} from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements OnInit{

  event$: any;
  path: any;
  constructor(
    private router: Router,
  ){
    this.event$ = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        this.path = event.url;
        console.log('shared-index',this.path);
      }
    });
  }

  ngOnInit(): void {}

}
