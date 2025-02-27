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

  constructor(public dialog: MatDialog, public webPages: WebPages, private talentService: TalentService, private translateService: TranslateService) {
    translateService.onLangChange.subscribe(() => {
      this.fetchNotifications()
    });
  }

  ngOnInit() {
    this.fetchNotifications();
  }


  fetchNotifications(): void {
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

    const page = this.paginator ? this.paginator.pageIndex + 1 : 1;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;

    this.notifications = [];
    this.isLoading = true;

    console.log('language updating', userId, langId, page, pageSize);
    this.talentService.getNotifications(userId, langId, page, pageSize).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.paginator.length = response.total_count;
        console.log('Fetched notifications response:', this.notifications, this.paginator.length);

        this.isLoading = false;

      }
    });
  }

  onPageChange() {
    this.fetchNotifications();
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
    this.showMatDialog("Are you sure you want to delete this Notification?", "delete-confirmation");
  }

  deleteActivity(): any {
    let ids = this.idsToDelete;
    this.talentService.deleteNotifications(ids).subscribe(
      response => {
        if (response.status) {
          this.fetchNotifications();
          this.selectedIds = [];
          this.allSelected = false;
          this.showMessage(response.message);
        }
        else {
          this.showMessage('getting some error!');
        }
      }
    )
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
    this.showMatDialog("Are you sure you want to delete this Activity?", "delete-confirmation");
  }
}
