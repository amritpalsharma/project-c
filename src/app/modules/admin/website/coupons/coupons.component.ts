import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatTableModule,MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { CouponService } from '../../../../services/coupon.service';
import { CoupenPopupComponent } from '../coupon-popup/coupon-popup.component';
import { CommonFilterPopupComponent } from '../../common-filter-popup/common-filter-popup.component';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent {

  coupons:any = [];
  displayedColumns: string[] = ['#','Name', 'Discount', 'Type', 'Code','Uses','Status','Deactivate', 'Edit','Remove'];
  
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  userId: any; 
  newStatus: any;
  isLoading:boolean = false;
  filterValue: string = '';
  lang_id: string = '';
  filterDialogRef:any = ""
  idsToProceed: any = [];
  selectedIds:any = [];
  customFilters:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private couponService: CouponService, public dialog: MatDialog, private sharedservice:SharedService ) {}

  ngOnInit(){
    this.getCoupons();
    this.sharedservice.data$.subscribe((data) => {
        if(data.action == 'lang_updated'){
            this.isLoading = true;
            this.lang_id = data.id;
            this.getCoupons();
        }
    });
  }

  getCoupons(filterApplied:boolean = false) {
    this.isLoading = true;
    let params:any = {};
    // params.offset = page;
    params.search = this.filterValue;
    // params.limit  = pageSize;  
    
    if(this.customFilters['discount_type']){
      params = {...params, "whereClause[discount_type]" : this.customFilters['discount_type']};
    }

    if(this.customFilters['status']){
      params = {...params, "whereClause[status]" : this.customFilters['status']};
    }

    try {
     this.couponService.getCoupons(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.coupons) {
        this.coupons = response.data.coupons; 
        // this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.coupons = [];
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching coupons:', error);
    }
  }


  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getCoupons();
     } else if(this.filterValue.length == 0){
      this.getCoupons();
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
      this.selectedIds = this.coupons.map((coupon:any) => coupon.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  deactivateCoupon(couponId:any){
    let params = {id:[couponId]};
    
    this.showMatDialog('Coupon deactivated successfully.', 'display');
    let index = this.coupons.findIndex((x:any) => x.id == couponId);
    // console.log(index);
    this.coupons[index].status = 'expired';
    this.couponService.expireCoupons(params).subscribe(
      response => {
        if(response.status){
        
        }else{
         
        }
      },
      error => {
        console.error('Error deactivating coupon:', error);
      }
    );
  }
  editCoupon(element:any = null){

    this.showMatDialog('Edit coupon is not allowed at the moment!', 'display');
    // edit coupon not available in stripe

  }


  createCoupon(){
    const createCouponDialog = this.dialog.open(CoupenPopupComponent,{
      height: '80vh',
      width: '80vw',
      panelClass: 'cutam-cupen',
      data : {
        action: 'create'
      }
    });

    createCouponDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "popupAdded"){
          // this.showMatDialog('Coupon created successfully!', 'display');
          this.showMatDialog(result.message, 'display');
          this.getCoupons();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  bulkPublish(): any{
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select coupon(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.couponService.publishCoupons(params).subscribe(
      response => {
        if(response.status){
          this.getCoupons();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Coupon(s) published successfully!.', 'display');
        }else{
          this.showMatDialog('Error in publishing coupons. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error publishing coupon:', error);
      }
    );

  }

  bulkDraft(): any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select coupon(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.couponService.draftCoupons(params).subscribe(
      response => {
        if(response.status){
          this.getCoupons();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Coupon(s) drafted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in drafting coupons. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error drafted coupon:', error);
      }
    );
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select coupon(s) first.', 'display');
      return false;
    }
    this.idsToProceed = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("", "delete-coupon-confirmation");
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
          this.deleteCoupons();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteCoupons():any {

    let params = {id:this.idsToProceed};
    this.couponService.deleteCoupons(params).subscribe(
      response => {
        if(response.status){
          this.getCoupons();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Coupon(s) deleted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing coupons. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting coupon:', error); 
      }
    );
  }

  confirmSingleDeletion(couponId:any){
    this.idsToProceed = [couponId];
    this.showMatDialog("", "delete-coupon-confirmation");
  }

  showFilterPopup():void {
    const filterDialog = this.dialog.open(CommonFilterPopupComponent,{
      height: '170px',
      width: '300px',
      position: {
        right: '30px',
        top:'150px'
      },
      data: {
        page: 'coupon',
        appliedfilters:this.customFilters
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
    this.getCoupons(true);
  }
}
