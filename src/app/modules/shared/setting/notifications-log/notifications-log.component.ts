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
import { ScoutService } from '../../../../services/scout.service';
import { SocketService } from '../../../../services/socket.service';

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
  loggedInUser: any = localStorage.getItem('userData');
  activities: any = [];
  selectedIds: any = [];
  notifications: any[] = [];
  selectNotificationFirst: string = '';
  confirmDeleteinformation: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  idsToDelete: any = [];

  constructor(public dialog: MatDialog, public webPages: WebPages, private talentService: TalentService, private translateService: TranslateService, private scoutService: ScoutService, private socketService: SocketService) {
    this.updateTranslation();
    translateService.onLangChange.subscribe(() => {
      this.fetchNotifications()
      this.updateTranslation();
    });
  }

  ngOnInit() {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.fetchNotifications();
  }

  checkRole() {
    if (!this.loggedInUser.isRepresentator) {
      return true;
    }
    if (this.loggedInUser.permission === 'admin.view' || this.loggedInUser.permission === 'admin.edit') {
      return false;
    }
    return true;
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

    this.talentService.getNotifications(userId, langId, page, pageSize).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.paginator.length = response.total_count;

        this.isLoading = false;

      }
    });
  }

  notificationClicked(id: number, seen: number, notification: any) {
    if (!notification.seen) {
      this.talentService.updateNotificationSeen(notification.id, 1).subscribe({
        next: (response) => {
          if (response.status) {
            notification.seen = 1;
            console.log('Message from API:', response.message);
          }
          else {
            console.log("something went wrong");
          }
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
    }
    else {
      console.log("already seen");
    }
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
    if (!this.checkRole()) {
      return;
    }
    if (this.selectedIds.length == 0) {
      this.showMessage(this.selectNotificationFirst);
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showMatDialog(this.confirmDeleteinformation, "delete-confirmation");
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

  isResponded: boolean = false;

  responseToScoutInvite(myResponse: string, scoutId: any, notification: any) {
    let jsonData = localStorage.getItem("userData");
    let userId: any;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }
    let langId = localStorage.getItem('lang_id');

    const formData = new FormData();
    formData.append('is_accepted', myResponse);
    // formData.append('player_id', userId);
    // formData.append('scout_id', scoutId);

    this.talentService.UpdateScoutRequest(scoutId, formData, langId).subscribe((response) => {
      if (response && response.status) {
        if (myResponse === 'accepted') {
          this.socketService.emit("acceptScoutRequest", { senderId: userId, receiverId: scoutId })
        }
        else {
          this.socketService.emit("rejectScoutRequest", { senderId: userId, receiverId: scoutId })
        }
        this.showMessage(response.message);
        // this.isResponded = true;
        this.notificationClicked(notification.id, notification.seen, notification)
      } else {
        console.error('Invalid API response structure:', response);
        this.showMessage(response.message);
      }
    });
  }

  updateSightingInviteResponse(status: string, eventId: any, clubId: any, notification: any) {

    let jsonData = localStorage.getItem("userData");
    let userId: any;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }
    let langId = localStorage.getItem('lang_id');

    this.talentService.updateSightingInviteResponse(status, eventId, langId).subscribe((response) => {
      if (response && response.status) {
        if (status === 'accepted') {
          this.socketService.emit("acceptClubInvite", { senderId: userId, receiverId: clubId })
        }
        else {
          this.socketService.emit("rejectClubInvite", { senderId: userId, receiverId: clubId })
        }
        this.showMessage(response.message);
        // this.isResponded = true;
        this.notificationClicked(notification.id, notification.seen, notification)
      } else {
        console.error('Invalid API response structure:', response);
        this.showMessage(response.message);
      }
    });
  }

  confirmSingleDeletion(id: any) {
    if (!this.checkRole()) {
      return;
    }
    this.idsToDelete = [id];
    this.showMatDialog(this.confirmDeleteinformation, "delete-confirmation");
  }

  convertTime(dateTime: any) {
    return this.talentService.convertTalentDateTime(dateTime);
  }

  updateTranslation() {
    this.translateService.get(['selectNotificationFirst', 'areYouSuretoDeleteNotification']).subscribe((res: any) => {
      // this.deleteProfiletranslatedText = res['deleteProfileConfirm'];
      // this.deleteTxt = res['delete'].toUpperCase();
      // this.errorMsg = res['pleaseConfirmSpellings'];
      this.selectNotificationFirst = res['selectNotificationFirst'];
      this.confirmDeleteinformation = res['areYouSuretoDeleteNotification'];
    });
  }
}
