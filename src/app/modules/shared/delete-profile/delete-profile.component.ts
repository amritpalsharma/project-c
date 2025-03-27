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
  errorMsg: string = 'Please confirm your spellings.';
  langSubscription!: Subscription;
  deleteTxt: string = '';
  constructor(
    public dialogRef: MatDialogRef<DeleteProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) { }
  ngOnInit() {
    // Parse user data from localStorage
    // this.loggedInUser = JSON.parse(this.loggedInUser);
    this.updateTranslation();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateTranslation();
    });
  }
  updateTranslation() {
    this.translate.get(['deleteProfileConfirm', 'delete', 'pleaseConfirmSpellings']).subscribe((res: any) => {
      this.deleteProfiletranslatedText = res['deleteProfileConfirm'];
      this.deleteTxt = res['delete'].toUpperCase();
      this.errorMsg = res['pleaseConfirmSpellings'];
    });
  }
  deleteProfileConfirmed() {
    if (this.deleteAccount == this.deleteTxt) {
      this.isShowErrorMsg = false;
      this.dialogRef.close({ action: 'delete-profile-confirmed' });
    } else {
      this.isShowErrorMsg = true;
      // alert(this.errorMsg)
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
