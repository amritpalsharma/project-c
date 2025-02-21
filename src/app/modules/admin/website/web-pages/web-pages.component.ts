import { Component, ViewChild } from '@angular/core';
import { WebPages } from '../../../../services/webpages.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { Router } from '@angular/router';
import { AddPageComponent } from './add-page/add-page.component';
import { SharedService } from '../../../../services/shared.service';
import { CommonFilterPopupComponent } from '../../common-filter-popup/common-filter-popup.component';
interface WebPage {
  id: string;
  user_id: string;
  title: string;
  content: string;
  featured_image: string | null;
  language: string;
  status: string;
  updated_at: string;
  created_at: string;
  slug: string;
  ad_types: string;
  featured_image_path: string | null;
}
@Component({
  selector: 'app-web-pages',
  templateUrl: './web-pages.component.html',
  styleUrl: './web-pages.component.scss',
  providers: [DatePipe]
})

export class WebPagesComponent {
  displayedColumns: string[] = ['#','Name', 'Language', 'Published', 'Last Modified','Status', 'Edit'];
  allPages : WebPage[] =  [];
  idsToProceed: any = [];
  filterValue: string = '';
  allSelected: boolean = false;
  selectedIds:any = [];
  getPageDetail:any = [];
  pages:any = [];
  lang_id: any = localStorage.getItem('lang_id');
  isLoading:boolean = false;

  customFilters:any = [];
  languages:any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private sharedservice:SharedService, private webpages: WebPages, private datePipe: DatePipe, public dialog: MatDialog, private router: Router) {}

  ngOnInit(){
    this.getAllPagesData();
    this.getFrontendPages();
    this.sharedservice.data$.subscribe((data) => {
        if(data.action == 'lang_updated'){
            this.isLoading = true;
            this.lang_id = data.id;
            this.getAllPagesData();
        }
    });

    this.getAllLanguages();
    //this.sharedservice.data$
    //lang_updated
  }

  getAllLanguages(){
    this.webpages.getAllLanguage().subscribe((response) => {
      if(response.status){
        console.log(response);
        let languages = response.data.languages;


        this.languages = languages.map((value: any) => {
          return {
            id: value.id,
            language: value.language
          }
        });
        console.log(this.languages)
      }
    });
  }

  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getAllPagesData();
     } else if(this.filterValue.length == 0){
      this.getAllPagesData();
     }
  }

  getAllPagesData(){
    
    let params:any = {};
    params.search = this.filterValue;

    if(this.customFilters['language']){
      params = {...params, "lang_id" : this.customFilters['language']};
    }

    if(this.customFilters['status']){
      params = {...params, "status" : this.customFilters['status']};
    }

    this.webpages.getAllPages(this.lang_id,params).subscribe((response) => {
      if(response.status){
        this.isLoading = false;
        this.allPages = response.data.pages.map((page: any) => ({
          ...page,
          created_at: this.formatDate(page.created_at),
          updated_at: this.formatDate(page.updated_at),
        }));
      }
    });
  }


  showFilterPopup():void {
    const filterDialog = this.dialog.open(CommonFilterPopupComponent,{
      height: '225px',
      width: '300px',
      position: {
        right: '30px',
        top:'150px'
      },
      data: {
        page: 'webpages',
        appliedfilters:this.customFilters,
        languages: this.languages,
      }
    })

    filterDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.applyUserFilter(result);
        console.log('Dialog result:', result);
      }else{
        console.log('Dialog closed without result');
      }
    });
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd.MM.yyyy') || date;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'draft':
        return 'bg_draft';
      default:
        return 'bg_success';
    }
  }

  getPublishOrDraftFilterData(type:string){
    this.allPages = [];
    let params:any = {};
    params.search = this.filterValue;
   
    this.webpages.getAllPages(this.lang_id,params).subscribe((response) => {
      if(response.status){
        this.allPages = response.data.pages.filter((page: any) => {
            if(page.status == type){
              return page;
            }
        });
      }
    });
  }

  confirmSingleDeletion(id:any){
    this.idsToProceed = [id];
    this.showMatDialog("", "delete-advertisement-confirmation");
  }


  showMatDialog(message:string, action:string){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deletePage();
        }
      }
    });
  }

  deletePage():any {
    let params = {id:this.idsToProceed};
    this.webpages.deleteWebPages(params).subscribe((response) => {
      if(response.status){
        this.getAllPagesData();
        this.showMatDialog('Page deleted successfully!.', 'display');
      }else{
        this.showMatDialog('Error in removing advertisement. Please try again.', 'display');
      }
    });
  }

  selectAllCoupons() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.allPages.map((ad:any) => ad.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  onCheckboxChange(item: any) {
    const index = this.selectedIds.indexOf(item.id);
    if (index === -1) {
      this.selectedIds.push(item.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  createNewPage(){
    const addNewPage = this.dialog.open(AddPageComponent,{
      width: '80vw',
      height: '80vh'
    })

    addNewPage.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "page-added-successfully"){
          this.showMatDialog('Page added successfully!.', 'display');
          this.getAllPagesData();
        }
      }
    });
  }

  viewPage(pageId: string){
    this.webpages.getSinglePageDetail(pageId).subscribe((res) => {
      if(res.status){
        const viewPage = this.dialog.open(AddPageComponent, {
          width: '2500px',
          height: '600px',
          data: {
            page: res.data.page,
          }
        })
      }      
    });
  }

  editPage(page: any){
    const addNewPage = this.dialog.open(AddPageComponent,{
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'full-screen-modal',
      data : page
    })
    addNewPage.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "page-added-successfully"){
          this.showMatDialog('Page updated successfully!.', 'display');
          this.getAllPagesData();
        }
      }
    });
  }

  getFrontendPages(){

    let params:any = {};
    params.search = this.filterValue;

    if(this.customFilters['language']){
      this.lang_id =  this.customFilters['language'];
    }

    if(this.customFilters['status']){
      params = {...params, "whereClause[status]" : this.customFilters['status']};
    }

    this.webpages.getFrontendPages(this.lang_id).subscribe((response) => {
      if (response.status) {
        this.pages = response.data.pages;
      }
    });
  }


  applyUserFilter(filters:any){
    this.customFilters = filters;
    this.getAllPagesData();
  }

}
