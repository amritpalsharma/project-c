import { Component, inject } from '@angular/core';
import {  MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss'
})
export class WebsiteComponent {

  tab:any = "webpages";

  constructor(private dialog: MatDialog) {}

  switchTab(tab:any){
    this.tab = tab;
  }

}
