import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatTableModule,MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { AdvertisementService } from '../../../../services/advertisement.service';
import { AdvertisingPopupComponent } from '../advertising-popup/advertising-popup.component';
import { CommonFilterPopupComponent } from '../../common-filter-popup/common-filter-popup.component';
@Component({
  selector: 'app-advertising',
  templateUrl: './advertising.component.html',
  styleUrl: './advertising.component.scss'
})
export class AdvertisingComponent {

  advertisements:any = [];
  displayedColumns: string[] = ['#','Name', 'Type', 'Page','Display Duration','Status','View', 'Edit','Remove'];
  
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  userId: any; 
  newStatus: any;
  isLoading:boolean = false;
  filterValue: string = '';
  filterDialogRef:any = ""
  idsToProceed: any = [];
  selectedIds:any = [];
  customFilters:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  typeOptions: any = [
    '250 x 250 - Square',
    '200 x 200 - Small Square',
    '468 x 60 - Banner',
    '728 x 90 - Leaderboard',
    '300 x 250 - Inline Rectangle',
    '336 x 280 - Large Rectangle',
    '120 x 600 - Skyscraper',
    '160 x 600 - Wide Skyscraper'
  ];

  pageOptions: any = [  ];

  constructor(private advertisementService: AdvertisementService, public dialog: MatDialog) {}

  ngOnInit(): void {
    
     this.getAdvertisements();
     this.getPagesList();
  }

  getPagesList(){

    this.advertisementService.getPageAds().subscribe((response) => {
      let {pages} = response.data;

      this.pageOptions = pages.map((value: any) => {
        return {
          id: value.id,
          page: value.title
        }
      });
    });

  }

  getAdvertisements(filterApplied:boolean = false) {

    this.isLoading = true;
    let params:any = {};
    params.search = this.filterValue;

    if(this.customFilters['page_name']){
      params = {...params, "whereClause[page_name]" : this.customFilters['page_name']};
    }

    if(this.customFilters['status']){
      params = {...params, "whereClause[status]" : this.customFilters['status']};
    }

    if(this.customFilters['type']){
      params = {...params, "whereClause[type]" : this.customFilters['type']};
    }

    try {
     this.advertisementService.getAdvertisements(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.advertisements) {
        this.advertisements = response.data.advertisements; 
        // this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.advertisements = [];
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching advertisements:', error);
    }

  }


  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getAdvertisements();
     } else if(this.filterValue.length == 0){
      this.getAdvertisements();
     }
  }

  onCheckboxChange(item: any) {
    const index = this.selectedIds.indexOf(item.id);
    if (index === -1) {
      this.selectedIds.push(item.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  selectAllCoupons() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.advertisements.map((ad:any) => ad.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  editAdvertisement(element:any){
    const updateAdDialog = this.dialog.open(AdvertisingPopupComponent,{
      height: '80vh',
      width: '80vw',
      panelClass: 'cutam-cupen',
      data : {
        action: 'update',
        ad: element
      }
    });

    updateAdDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "updated"){
          this.showMatDialog('Advertisement updated successfully!', 'display');
          this.getAdvertisements();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }


  createAdvertisement(){
    const createAdDialog = this.dialog.open(AdvertisingPopupComponent,{
      height: '80vh',
      width: '80vw',
      panelClass: 'cutam-cupen',
      data : {
        action: 'create'
      }
    });

    createAdDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "added"){
          this.showMatDialog('Advertisement created successfully!', 'display');
          this.getAdvertisements();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  viewAdvertisement(element:any){
    const viewAdDialog = this.dialog.open(AdvertisingPopupComponent,{
      height: '80vh',
      width: '80vw',
      panelClass: 'cutam-cupen',
      data : {
        action: 'view',
        ad: element
      }
    });
  }

  bulkPublish(): any{
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select advertisement(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.advertisementService.publishAdvertisements(params).subscribe(
      response => {
        if(response.status){
          this.getAdvertisements();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Advertisement(s) published successfully!.', 'display');
        }else{
          this.showMatDialog('Error in publishing advertisement. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error publishing advertisement:', error);
      }
    );

  }

  bulkDraft(): any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select advertisement(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.advertisementService.draftAdvertisements(params).subscribe(
      response => {
        if(response.status){
          this.getAdvertisements();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Advertisement(s) drafted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in drafting advertisement. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error drafted advertisement:', error);
      }
    );
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select advertisement(s) first.', 'display');
      return false;
    }
    this.idsToProceed = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
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
          this.deleteAdvertisement();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteAdvertisement():any {

    let params = {id:this.idsToProceed};
    this.advertisementService.deleteAdvertisements(params).subscribe(
      response => {
        if(response.status){
          this.getAdvertisements();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Advertisement(s) deleted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing advertisement. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting advertisement:', error); 
      }
    );
  }

  confirmSingleDeletion(couponId:any){
    this.idsToProceed = [couponId];
    this.showMatDialog("", "delete-advertisement-confirmation");
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
        page: 'advertisement',
        appliedfilters:this.customFilters,
        pages: this.pageOptions,
        types: this.typeOptions
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

  applyUserFilter(filters:any){
    this.customFilters = filters;
    this.getAdvertisements(true);
  }

  
}

