import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '../../../../services/socket.service';
import { AdminHelperService } from '../../../../services/admin-helper.service';
import { UserRoleService } from '../../../../services/user-role.service';

@Component({
  selector: 'app-user-detail-popup',
  templateUrl: './user-detail-popup.component.html',
  styleUrl: './user-detail-popup.component.scss'
})
export class UserDetailPopupComponent {
  updatedData: any;
  selectedOption: any = "";

  constructor(
    public userRoleService: UserRoleService,
    private router: Router, private socketService: SocketService,
    public dialogRef: MatDialogRef<UserDetailPopupComponent>,
    private adminHelper: AdminHelperService,
    @Inject(MAT_DIALOG_DATA) public user: any) {
    console.log('edit user', user);

  }
  close() {
    this.dialogRef.close();
  }

  save() {
    console.log("event is", this.selectedOption, typeof (this.selectedOption));

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    const receiverIds = [this.user.id];

    if (this.selectedOption === "3") {
      this.socketService.emit("userRejected", { senderId: userId, receiverIds });
    }
    else {
      this.socketService.emit("userVerified", { senderId: userId, receiverIds });
    }

    this.dialogRef.close({ user: this.user.id, status: this.selectedOption });
  }

  closePopup(slug: string, id: Number, tab: any = ''): void {
    slug = slug.toLowerCase();
    // club roles
    if (slug == 'club representator') {
      slug = 'club';
    }
    slug = slug.toLowerCase();
    if (slug == 'vereinsvertreter') {
      slug = 'club';
    }

    // New code for club teamMember
    if (slug == 'club team-member') {
      slug = 'club';
    }

    if (slug == 'vereinsmitglied') {
      slug = 'club';
    }
    // scout roles
    if (slug == 'scout representator') {
      slug = 'scout';
    }
    if (slug == 'spähervertreter') {
      slug = 'scout';
    }

    // Scout Team member
    if (slug == 'scout team-member') {
      slug = 'scout';
    }

    if (slug == 'scout-teammitglied') {
      slug = 'scout';
    }

    let pageRoute = 'admin/' + slug.toLowerCase() + '/' + id;


    pageRoute = 'admin/' + slug.toLowerCase();
    // Navigate to User-detail with query parameter
    this.dialogRef.close();
    if (tab === 'purchases') {
      let fragment = tab;
      this.router.navigate([pageRoute, id], { fragment });
    }
    else {
      this.router.navigate([pageRoute, id]);
    }
  }

  onSelectionChange(event: Event): void {
    this.selectedOption = (event.target as HTMLInputElement).value;
  }

  formatDateTime(datetime: string) {
    // convertAdminDateTime
    let formattedDate = this.adminHelper.getSwitzerlandTime(datetime);
    return formattedDate;
  }

  isCurrentRoleClub(role_name: string): boolean {
    // Convert the role name to lowercase to ensure case-insensitive comparison
    role_name = role_name.toLowerCase();

    // Array containing possible translations/variants of the word "club"
    let clubTranslationsArr = ['club', 'clube', 'klub', 'klubb'];

    // Check if the role_name matches any item in the clubTranslationsArr
    return clubTranslationsArr.includes(role_name);
  }


}
