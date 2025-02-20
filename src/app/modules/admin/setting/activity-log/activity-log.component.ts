import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatTableModule,MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { ActivityService } from '../../../../services/activity';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.scss'
})
export class ActivityLogComponent {
  
  displayedColumns: string[] = ['#','Name', 'Date - Time', 'Remove'];
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  isLoading:boolean = false;
  activities:any = [];
  selectedIds:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  idsToDelete: any = [];

  constructor(private activityService: ActivityService, public dialog: MatDialog){}

  ngOnInit(){
    this.getActivity();
  }

  async getActivity(): Promise<void> {

    this.isLoading = true;
    
    const page = this.paginator ? this.paginator.pageIndex*10 : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;
    const sortOrder = this.sort ? this.sort.direction : 'asc';
    const sortField = this.sort ? this.sort.active : '';

    
    let params:any = {};
    params.offset = page;
    params.limit  = pageSize;
    params.lang  = localStorage.getItem('lang_id');

    try {
     this.activityService.getActivity(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.userData) {
        this.activities = response.data.userData; 
        this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  onPageChange() {
    this.getActivity();
  }
  
  onCheckboxChange(item: any) {
    const index = this.selectedIds.indexOf(item.id);
    if (index === -1) {
      this.selectedIds.push(item.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.activities.map((item:any) => item.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }
  
  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMessage('Select activity(s) first.');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("", "delete-activity-confirmation");
  }


  deleteActivity():any {
    let params = {id:this.idsToDelete};
    this.activityService.deleteActivity(params).subscribe(
      response => {
        this.getActivity();
        this.selectedIds = [];
        this.allSelected = false;
        this.showMessage('Activity deleted successfully!');
      },
      error => {
        console.error('Error deleting activity:', error);
        this.showMessage('Error deleting activity. Please try again.');
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
          this.deleteActivity();
        }
      }
    });
  }

  confirmSingleDeletion(id:any){
    this.idsToDelete = [id];
    this.showMatDialog("", "delete-activity-confirmation");
  }
}
