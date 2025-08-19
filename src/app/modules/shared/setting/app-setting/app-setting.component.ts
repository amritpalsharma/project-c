import { Component } from '@angular/core';
import { TalentService } from '../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DeleteProfileComponent } from '../../delete-profile/delete-profile.component';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { SharedDataService } from '../../shared-data.service';

@Component({
  selector: 'app-app-setting',
  templateUrl: './app-setting.component.html',
  styleUrls: ['./app-setting.component.scss'],
})
export class AppSettingComponent {
  currentLoggedInPermission: string = this.gloabalSettings.getCurrentViewOnly();
  loggedInUser: any = localStorage.getItem('userData'); // User data from local storage
  translatedText: string = '';
  deleteProfiletranslatedText: string = '';
  langSubscription!: Subscription;
  constructor(
    private sharedDataService: SharedDataService,
    private gloabalSettings: GlobalSettingsService,
    private talentService: TalentService,
    public dialog: MatDialog,
    private translate: TranslateService) { }

  ngOnInit() {
    // Parse user data from localStorage
    this.loggedInUser = JSON.parse(this.loggedInUser);
    console.info('this.loggedInUser',this.loggedInUser)
    
    this.updateTranslation();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateTranslation();
    });


    this.sharedDataService.sharedText$.subscribe(text => {
      this.currentLoggedInPermission = text;
    });
  }
  updateTranslation() {
    this.translate.get('changeNewsletterStatus').subscribe((res: string) => {
      this.translatedText = res;
    });
    this.translate.get('deleteProfiletranslatedText').subscribe((res: string) => {
      this.deleteProfiletranslatedText = res;
    });
  }
  // Open confirmation dialog
  showMatDialog(message: string, action: string, event: any) {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: { top: '150px' },
      data: { message, action },
    });

    messageDialog.afterClosed().subscribe((result) => {
      if (result?.action === 'newsletter-confirmed') {
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
    console.info('this.loggedInUser.permission',this.loggedInUser.permission)
    if (!this.checkRole()) {
      return;
    }
    this.showMatDialog(
      this.translatedText,
      "newsletter-confirmation",
      event
    );
  }

  checkRole() {
    if (!this.loggedInUser.isRepresentator) {
      return true;
    }
    if (this.loggedInUser.permission === 'admin.view' || this.loggedInUser.permission === 'admin.edit' || this.loggedInUser.permission === 'admin.access') {
      return false;
    }
    return true;
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
        if (response.message != '') {
          this.showMatDialog(response.message, 'display', '');
        }
      },
      (error) => {
        console.error('Error updating newsletter subscription:', error);
        // Revert the checkbox state on error
        event.target.checked = !event.target.checked;
      }
    );
  }

  showDeleteProfileMatDialog(message: string, action: string) {
    const messageDialog = this.dialog.open(DeleteProfileComponent, {
      width: '500px',
      position: { top: '150px' },
      data: { message, action },
    });

    messageDialog.afterClosed().subscribe((result) => {
      // alert(JSON.stringify(result))
      if (result?.action === 'delete-profile-confirmed') {
        // Proceed with API call
        // this.updateNewsletter(event);
        this.talentService.deleteProfile().subscribe(
          (response) => {
            //  console.log(response);
            if (response.status === true) {
              this.showMatDialog(response.message, 'delete-account-close', '');
            }
          })
      }
    });
  }

  confirmDeleteProfile(event: any) {
    this.showDeleteProfileMatDialog(
      this.deleteProfiletranslatedText,
      "newsletter-confirmation"
      // event
    );
  }
}
