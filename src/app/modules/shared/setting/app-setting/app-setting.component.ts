import { Component } from '@angular/core';
import { TalentService } from '../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';

@Component({
  selector: 'app-app-setting',
  templateUrl: './app-setting.component.html',
  styleUrls: ['./app-setting.component.scss'],
})
export class AppSettingComponent {
  loggedInUser: any = localStorage.getItem('userData'); // User data from local storage

  constructor(private talentService: TalentService, public dialog: MatDialog) {}

  ngOnInit() {
    // Parse user data from localStorage
    this.loggedInUser = JSON.parse(this.loggedInUser);
  }

  // Open confirmation dialog
  showMatDialog(message: string, action: string, event: any) {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: { top: '150px' },
      data: { message, action },
    });

    messageDialog.afterClosed().subscribe((result) => {
      if (result?.action === 'delete-confirmed') {
        // Proceed with API call
        this.updateNewsletter(event);
      } else {
        // Revert the checkbox to its original state
        event.target.checked = this.loggedInUser.newsletter === 1;
      }
    });
  }

  // Handle toggle event
  onNewsletterToggle(event: any) {
    this.showMatDialog(
      "Are you sure you want to change newsletter status?",
      "newsletter-confirmation",
      event
    );
  }

  // Update newsletter subscription via API
  updateNewsletter(event: any) {
    const newsletter = event.target.checked ? 1 : 0;

    this.talentService.updateNewsletter({ newsletter }).subscribe(
      (response) => {
        if (response?.status && response?.data) {
          // Update local storage only if API call is successful
          this.loggedInUser.newsletter = newsletter;
          localStorage.setItem('userData', JSON.stringify(this.loggedInUser));
        } else {
          console.error('Invalid API response structure:', response);
          // Revert the checkbox state on failure
          event.target.checked = !event.target.checked;
        }
      },
      (error) => {
        console.error('Error updating newsletter subscription:', error);
        // Revert the checkbox state on error
        event.target.checked = !event.target.checked;
      }
    );
  }
}
