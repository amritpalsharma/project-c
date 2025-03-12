import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'delete-profile',
  templateUrl: './delete-profile.component.html',
  styleUrls: ['./delete-profile.component.scss']
})
export class DeleteProfileComponent {
  deleteAccount: string = '';
  deleteProfiletranslatedText: string = '';
  isShowErrorMsg: boolean = false;
  errorMsg: string = 'Values do not match. Please confirm your spelling.';
  langSubscription!: Subscription;
  constructor(
    public dialogRef: MatDialogRef<DeleteProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) { }
  ngOnInit() {
    // Parse user data from localStorage
    // this.loggedInUser = JSON.parse(this.loggedInUser);
    // this.updateTranslation();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateTranslation();
    });
  }
  updateTranslation() {
    this.translate.get('deleteProfileConfirm').subscribe((res: string) => {
      this.deleteProfiletranslatedText = res;
    });
  }
  deleteProfileConfirmed() {
    if (this.deleteAccount === 'DELETE') {
      this.isShowErrorMsg = false;
      this.dialogRef.close({ action: 'delete-profile-confirmed' });
    } else {
      this.isShowErrorMsg = true;
    }
  }
  newsletterConfirmed() {
    this.dialogRef.close({ action: 'newsletter-confirmed' });
  }
  activityConfirmed() {
    this.dialogRef.close({ action: 'activity-delete-confirmed' });
  }
  close() {
    this.dialogRef.close();
  }
}
