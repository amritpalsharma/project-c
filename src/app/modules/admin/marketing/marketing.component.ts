import { Component, inject,ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MarketingPopupComponent } from './marketing-popup/marketing-popup.component';
import { FilterPopupComponrnt } from '../filter-popup/filter-popup.component';
import { MarketingService } from '../../../services/marketing.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../environments/environment';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { CommonFilterPopupComponent } from '../common-filter-popup/common-filter-popup.component';

@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss']
})
export class MarketingComponent {
  displayedColumns: string[] = ['#','Name', 'For', 'Language','Display Freq','Display Location','Start Date','End Date','Status','Edit','Remove'];
  isLoading:boolean = false;
  popups: any = [];
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  selectedIds: number[] = [];  
  filterValue: string = '';
  idsToDelete: any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  customFilters:any = [];
  rolesForFilter:any = [];
  langs:any = environment.langs;
  locations:any = environment.domains;
  frequency:any = ['Once a day', 'Once a week', 'Once 2 Hrs', 'Twice a day', 'Once a month', 'One time only'];

  constructor(public dialog: MatDialog,private marketingApi: MarketingService) {}
  ngOnInit(): void {
    this.getSystemPopups();
    this.getRoles();
  }

  async getSystemPopups(filterApplied:boolean = false): Promise<void> {
    this.isLoading = true;
    const page = this.paginator ? this.paginator.pageIndex*10 : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;
    // const sortOrder = this.sort ? this.sort.direction : 'asc';
    // const sortField = this.sort ? this.sort.active : '';

    let params:any = {};
    params.offset = page;
    params.search = this.filterValue;
    params.limit  = pageSize;
    params.orderBy = "id";
    params.order = "desc";

    if(filterApplied){
      params.offset = 0;
      this.paginator.firstPage(); // to reset the page if user applied filter on any page except the first one
    }

    if(this.customFilters['role']){
      let getFreePaymentType = ["1","3","5"];
      let paymentType = (getFreePaymentType.includes(this.customFilters['role'])) ? 'free' : 'paid';
      params = {...params, "whereClause[role]" : this.customFilters['role'], "whereClause[payment_type]": paymentType};
    }

    if(this.customFilters['language']){
      params = {...params, "whereClause[language]" : this.customFilters['language']};
    }

    if(this.customFilters['frequency']){
      params = {...params, "whereClause[frequency]" : this.customFilters['frequency']};
    }

    if(this.customFilters['location']){
      params = {...params, "whereClause[popup_location]" : this.customFilters['location']};
    }

    if(this.customFilters['status']){
      params = {...params, "whereClause[status]" : this.customFilters['status']};
    }

    try {
      this.isLoading = true;
     this.marketingApi.getSystemPopups(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.popups) {
        this.popups = response.data.popups;
        this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.popups = [];
        this.paginator.length = 0;
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  createSystemPoup(){
    console.log('Edit user button clicked!');
    const dialogRef = this.dialog.open(MarketingPopupComponent,{
      height: '80vh',
      width: '70vw',
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "popupAdded"){
          this.showMessage('Popup created successfully!');
          this.getSystemPopups();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getSystemPopups();
    } else if(this.filterValue.length == 0){
      this.getSystemPopups();
    }
  }

  showFiltersPopup(){
    alert('show filters popup')
    //   this.dialog.open(FilterPopupComponrnt,{
    //     height: '450px',
    //     width: '300px',
    //     position: {
    //       right: '30px',
    //       top:'150px'
    //     }
    //   })
  }

  onPageChange() {
    this.getSystemPopups();
  }

  onCheckboxChange(popup: any) {
    const index = this.selectedIds.indexOf(popup.id);
    if (index === -1) {
      this.selectedIds.push(popup.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  selectAllPopups() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.popups.map((popup:any) => popup.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMessage('Select popup(s) first.');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("", "popup-delete-confirmation");
  }


  deletePopups():any {

    let params = {id:this.idsToDelete};
    this.marketingApi.deletePopups(params).subscribe(
      response => {
        this.getSystemPopups();
        this.selectedIds = [];
        this.allSelected = false;
        // console.log('Popups deleted successfully:', response);
        this.showMessage('Popup(s) deleted successfully!');
      },
      error => {
        console.error('Error deleting popup:', error);
        this.showMessage('Error deleting popup. Please try again.');
      }
    );
  }

  showMessage(message:string){
    this.showMatDialog(message, 'display');
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
          this.deletePopups();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  showRole(id:number){
    return environment.roles.filter(role =>
      role.id == id
    ).map(role =>
      role.role
    );
  }

  editPopup(data:any){
    
    const dialogRef = this.dialog.open(MarketingPopupComponent,{
      height: '80vh',
      width: '70vw',
      data: data
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "popupUpdated"){
          this.showMessage('Popup updated successfully!');
          this.getSystemPopups();
        }
      //  console.log('Dialog result:', result);
      }
    });

  }
  
  confirmSingleDeletion(id:any){
    this.idsToDelete = [id];
    this.showMatDialog("", "popup-delete-confirmation");
  }

  getRoleTypes(data:any){
    data = JSON.parse(data);
    let result = "";
    for(let row of data){

      if(row.user_role){
        let type = '';
        if(row.payment_type == "Paid"){
          type = '(P)';
        }else if(row.payment_type == "Free"){
          type = '(F)';
        }
        result += row.user_role+type+', '
      }
    }
    return result.slice(0, -2);
  }

  getRoles(){
    this.marketingApi.getRolePaymentTypes().subscribe((response)=>{
      if (response && response.status) {
        this.rolesForFilter = response.data.userTypes;
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }

  showFilterPopup():void {
    const filterDialog = this.dialog.open(CommonFilterPopupComponent,{
      height: '340px',
      width: '300px',
      position: {
        right: '30px',
        top:'150px'
      },
      data: {
        page: 'marketing',
        appliedfilters:this.customFilters,
        roles: this.rolesForFilter,
        languages: this.langs,
        frequency: this.frequency,
        locations: this.locations,
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
    this.getSystemPopups(true);
  }
}
