import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordComponent } from '../../../shared/reset-password/reset-password.component';
import { SocketService } from '../../../../services/socket.service';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { SharedDataService } from '../../shared-data.service';

@Component({
  selector: 'app-password-settings',
  templateUrl: './password-settings.component.html',
  styleUrl: './password-settings.component.scss'
})
export class PasswordSettingsComponent {
  loggedInUser: any = [];
  userEmail: string = '';
  currentLoggedInPermission: string = this.gloabalSettings.getCurrentViewOnly();

  constructor(
    private gloabalSettings: GlobalSettingsService,
    private sharedDataService: SharedDataService,
    public dialog: MatDialog, private socketService: SocketService) {
    this.getUserStatus();
    this.sharedDataService.sharedText$.subscribe(text => {
      this.currentLoggedInPermission = text;
    });
  }

  getUserStatus() {
    this.socketService.getLoggedInUserDetail().then((result: any) => {
      // console.info('result',result);
      if (result.userData != '' && typeof result.userData != undefined) {
        this.loggedInUser = result.userData;
        if (result.email && typeof result.email != undefined) {
          this.userEmail = result.email;
        }
      }
    });
  }


  openResetDialog() {

    const dialogRef = this.dialog.open(ResetPasswordComponent, {
      width: '600px',
      data: {
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('User saved:', this.userData);
      } else {
        console.log('User canceled the edit');
      }
    });
  }
}
