import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { ActivityService } from '../../../../services/activity';
import { WebPages } from '../../../../services/webpages.service';
import { TalentService } from '../../../../services/talent.service';
import { TranslateService } from '@ngx-translate/core';
import { AdminHelperService } from '../../../../services/admin-helper.service';
import { SharedService } from '../../../../services/shared.service';
import { Router } from '@angular/router';
import { UserRoleService } from '../../../../services/user-role.service';

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
  @ViewChild('notificationsAdmin', { static: false }) notificationsAdmin!: ElementRef;
  idsToDelete: any = [];
  deleteConfirmation3: string = '';
  selectNotificationFirst: string = '';

  constructor(
    public userRoleService: UserRoleService,
    public dialog: MatDialog,
    public webPages: WebPages,
    private talentService: TalentService,
    private translateService: TranslateService,
    public adminHelper: AdminHelperService,
    private sharedservice: SharedService,
    private router: Router) {
    translateService.onLangChange.subscribe(() => {
      let langId;
      if (translateService.currentLang == 'en') {
        langId = 1;
      }
      else {
        langId = 2;
      }
      this.fetchNotifications(langId);
    });
  }

  ngOnInit() {
    this.getJsonTranslations();
    let langId = localStorage.getItem('lang_id');
    this.fetchNotifications(langId);
    this.sharedservice.data$.subscribe((data: any) => {
      if (data.action == 'lang_updated') {
        this.getJsonTranslations();
      }
    });
  }

  convertTime(dateTime: any) {
    return this.talentService.convertTalentDateTime(dateTime);
  }

  fetchNotifications(langId: any): void {
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

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


  handleNotiificationClick(notification: any) {
    console.log(notification)
    let roleName = 'admin';
    let role = (roleName || '').toString().toLowerCase();

    if (notification.event === 'sendMessage') {
      this.router.navigate([`/${role}/chat`]);
    }
    else if (notification.event === 'userVerified' || notification.event === 'userRejected') {
      let fragment = 'notifications';
      this.router.navigate([`/${role}/setting`], { fragment });
    }
    else if (notification.event === 'acceptScoutRequest' || notification.event === 'rejectScoutRequest') {
      let fragment = 'portfolio';
      console.log(role, 'role')
      this.router.navigate([`/${role}/dashboard`], { fragment });
    }
    else if (notification.event === 'acceptClubInvite' || notification.event === 'rejectClubInvite') {
      let fragment = 'sighting';
      this.router.navigate([`/${role}/dashboard`], { fragment });
    }
    else {
      let role = (notification.senderRole || '').toString().toLowerCase();

      if (role === 'scout representator') {
        role = 'scout';
      }
      if (role === 'admin representator') {
        role = 'admin';
      }
      if (role === 'club representator') {
        role = 'club';
      }
      this.router.navigate([`/admin/${role}`, notification.senderId]);
    }

  }

  onPageChange() {
    let langId = localStorage.getItem('lang_id');
    this.fetchNotifications(langId);
  }

  onCheckboxChange(item: any) {
    // const index = this.selectedIds.indexOf(item.id);
    // if (index === -1) {
    //   this.selectedIds.push(item.id);
    // } else {
    //   this.selectedIds.splice(index, 1);
    // }

    // if (this.notifications.length === this.selectedIds.length) {
    //   this.allSelected = true;
    // } else {
    //   this.allSelected = false;
    // }
    const index = this.selectedIds.indexOf(item.id);
    if (index === -1) {
      // Adding the ID if it's not already selected
      this.selectedIds.push(item.id);
    } else {
      // Removing the ID if it's already selected
      this.selectedIds.splice(index, 1);
    }
    this.updateMasterCheckboxState();
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      // Select all popups
      this.selectedIds = this.notifications.map((popup: any) => popup.id);
    } else {
      // Deselect all popups
      this.selectedIds = [];
    }

    this.updateMasterCheckboxState();
  }

  confirmDeletion(): any {
    if (this.selectedIds.length == 0) {
      this.showMessage(this.selectNotificationFirst);
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showMatDialog(this.deleteConfirmation3, "delete-confirmation");
  }

  deleteActivity(): any {
    let ids = this.idsToDelete;
    this.talentService.deleteNotifications(ids).subscribe(
      response => {
        if (response.status) {
          let langId = localStorage.getItem('lang_id');
          this.fetchNotifications(langId);
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
          let isDeleted: any = localStorage.getItem('isDeleted');
          if (!isDeleted) {
            localStorage.setItem('isDeleted', 'true');
          }
          this.deleteActivity();
        }
      }
    });
  }

  confirmSingleDeletion(id: any) {
    this.idsToDelete = [id];
    this.showMatDialog(this.deleteConfirmation3, "delete-confirmation");
  }

  // formatDateTime(datetime: string) {
  //   // convertAdminDateTime
  //   let formattedDate = this.adminHelper.convertAdminDateTime(datetime, 'users');
  //   return formattedDate;
  // }

  // formatDateTime(datetime: string) {
  //   // convertAdminDateTime
  //   let formattedDate = this.adminHelper.getSwitzerlandTime(datetime);
  //   return formattedDate;
  // }


  getJsonTranslations() {
    this.translateService.get(['confirmDeleteinformation3', 'selectNotificationFirst']).subscribe((translations) => {
      this.deleteConfirmation3 = translations['confirmDeleteinformation3'];
      this.selectNotificationFirst = translations['selectNotificationFirst'];
      console.warn(this.selectNotificationFirst);
    })
  }

  updateMasterCheckboxState() {
    const masterCheckbox = this.notificationsAdmin?.nativeElement;
    if (!masterCheckbox) return;

    const total = this.notifications.length;
    const selected = this.selectedIds.length;
    // console.log('total',total);
    // console.log('selected',selected);

    masterCheckbox.indeterminate = selected > 0 && selected < total;
    masterCheckbox.checked = selected === total;
  }
}
