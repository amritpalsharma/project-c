import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleService } from '../../../title.service';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss'
})
export class WebsiteComponent {

  tab: any = "webpages";

  constructor(private dialog: MatDialog, private titleService: TitleService) { }

  switchTab(tab: any) {
    this.tab = tab;
  }

  setPageTitle() {
    this.titleService.setTitle('Templates Component');
  }

}
