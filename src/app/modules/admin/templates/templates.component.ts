import { Component, inject,ViewChild } from '@angular/core';
import {  MatDialog } from '@angular/material/dialog';
import {  MatDialogRef} from '@angular/material/dialog';
import { FilterPopupComponrnt } from '../filter-popup/filter-popup.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../environments/environment';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { TemplatePopupComponent } from './template-popup/template-popup.component'; 
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { TemplateService } from '../../../services/template.service';
import { CommonFilterPopupComponent } from '../common-filter-popup/common-filter-popup.component';
import { AdminHelperService } from '../../../services/admin-helper.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss'
})
export class TemplatesComponent {
  displayedColumns: string[] = ['#','Name', 'For', 'Language','Created Date - Time','Edit','Remove'];
  isLoading:boolean = false;
  templates: any = [];
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  selectedIds: number[] = [];  
  filterValue: string = '';
  lang_id: string = '';
  idsToDelete: any = [];
  customFilters:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  roles: any = [];
  langs: any = environment.langs;

  constructor(public dialog: MatDialog,private tempalateApi: TemplateService, public adminHelper: AdminHelperService) {}
  ngOnInit(): void {
    this.getTemplates();

    let envRoles:any = environment.roles;
    envRoles.unshift({id: 0, role: 'All'});
    this.roles = envRoles;
  } 

  

  async getTemplates(filterApplied:boolean = false): Promise<void> {
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
      params = {...params, "whereClause[role]" : this.customFilters['role']};
    }

    if(this.customFilters['language']){
      params = {...params, "whereClause[language]" : this.customFilters['language']};
    }

    
    try {
      this.isLoading = true;
      this.tempalateApi.getTemplates(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.emailTemplates) {
        this.templates = response.data.emailTemplates;
        this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.templates = [];
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

  createTemplate(){
    const dialogRef = this.dialog.open(TemplatePopupComponent,{
      // height: '598px',
      // width: '600px',
      height: '90vh',
      width: '90vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "templateAdded"){
          this.showMessage('Email template created successfully!');
          this.getTemplates();
        }
      }
    });
  }

  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getTemplates();
    } else if(this.filterValue.length == 0){
      this.getTemplates();
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
    this.getTemplates();
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
      this.selectedIds = this.templates.map((popup:any) => popup.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMessage('Select template(s) first.');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("", "template-delete-confirmation");
  }


  deleteTemplates():any {

    let params = {id:this.idsToDelete};
    this.tempalateApi.deleteEmailTemplate(params).subscribe(
      response => {
        this.getTemplates();
        this.selectedIds = [];
        this.allSelected = false;
        // console.log('Popups deleted successfully:', response);
        this.showMessage('Template(s) deleted successfully!');
      },
      error => {
        console.error('Error deleting template:', error);
        this.showMessage('Error deleting template. Please try again.');
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
          this.deleteTemplates();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  editTemplate(data:any){
    const updateDialogRef = this.dialog.open(TemplatePopupComponent,{
      // height: '598px',
      // width: '600px',
      height: '90vh',
      width: '90vw',
      data: data
    });

    updateDialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "templateUpdated"){
          this.showMessage('Email template updated successfully!');
          this.getTemplates();
        }
      }
    });
  }
  
  confirmSingleDeletion(id:any){
    this.idsToDelete = [id];
    this.showMatDialog("", "template-delete-confirmation");
  }

  getRole(id:any){
    let row = this.roles.find((role:any) => role.id == id);
    return row ? row.role : null;
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
        page: 'template',
        appliedfilters:this.customFilters,
        roles: this.roles,
        languages: this.langs
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
    this.getTemplates(true);
  }
}
   