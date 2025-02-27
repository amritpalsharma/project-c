import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { ActivityService } from '../../../../services/activity';
import { WebPages } from '../../../../services/webpages.service';
import { TalentService } from '../../../../services/talent.service';
import { TranslateService } from '@ngx-translate/core';

interface Notification {
  id: number;
  image: string;
  title: string;
  content: string;
  time: string;
  seen: number;
  senderId: number;
  shouldAnimate: boolean;
  relativeTime: string;
}

@Component({
  selector: 'app-notifications-log',
  templateUrl: './notifications-log.component.html',
  styleUrl: './notifications-log.component.scss'
})
export class NotificationsLogComponent {
  displayedColumns: string[] = ['#', 'Name', 'Date - Time', 'Remove'];
  checkboxIds: string[] = [];
  allSelected: boolean = false;
  isLoading: boolean = false;
  activities: any = [];
  selectedIds: any = [];
  notifications: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  idsToDelete: any = [];

  constructor(private activityService: ActivityService, public dialog: MatDialog, public webPages: WebPages, private talentService: TalentService, private translateService: TranslateService) {
    translateService.onLangChange.subscribe(() => {
      let jsonData = localStorage.getItem("userData");
      let userId;
      if (jsonData) {
        let userData = JSON.parse(jsonData);
        userId = userData.id;
      }
      else {
        console.log("No data found in localStorage.");
      }

      let langId = localStorage.getItem('lang_id');

      this.fetchNotifications(userId, langId)
    });
  }

  ngOnInit() {
    // this.getActivity();

    // this.webPages.languageId$.subscribe((data) => {
    //   this.getActivity();
    // });

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    let langId = localStorage.getItem('lang_id');

    
    this.fetchNotifications(userId, langId);
  }


  fetchNotifications(userId: number, langId: any): void {
    this.notifications = [];
    this.isLoading = true;
    console.log('language updating', userId, langId);
    this.talentService.getNotifications(userId, langId).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        console.log('Fetched notifications response:', this.notifications);

        this.isLoading = false;

      }
    });
  }

  async getActivity(): Promise<void> {

    this.isLoading = true;

    const page = this.paginator ? this.paginator.pageIndex * 10 : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;
    const sortOrder = this.sort ? this.sort.direction : 'asc';
    const sortField = this.sort ? this.sort.active : '';

    let params: any = {};
    params.offset = page;
    params.limit = pageSize;
    params.lang = localStorage.getItem('lang_id');

    try {
      this.activityService.getActivity(params).subscribe((response) => {
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
      this.selectedIds = this.notifications.map((item: any) => item.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  confirmDeletion(): any {
    if (this.selectedIds.length == 0) {
      this.showMessage('Select notifications(s) first.');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showMatDialog("Are you sure you want to delete this Notification?", "delete-activity-confirmation");
  }

  deleteActivity(): any {
    let params = { id: this.idsToDelete };
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

  showMessage(message: string) {
    this.showMatDialog(message, 'display');
  }

  showMatDialog(message: string, action: string) {

    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          this.deleteActivity();
        }
      }
    });
  }

  confirmSingleDeletion(id: any) {
    this.idsToDelete = [id];
    this.showMatDialog("Are you sure you want to delete this Activity?", "delete-activity-confirmation");
  }
}
