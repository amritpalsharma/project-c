import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-talk-js-helper',
  templateUrl: './talk-js-helper.component.html',
  styleUrls: ['./talk-js-helper.component.scss'] // ✅ correct
})

export class TalkJsHelperComponent {

  theme: string = localStorage.getItem('theme') || 'dark';
  constructor(
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<TalkJsHelperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TalkJsHelperComponent
  ) { }

  ngOnInit() {
    this.getJsonTranslations();
    console.info(this.data)
  }

  confirmDelete(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  AreYouSureToDeleteConvo: string = '';
  cancelRemoveFavBtn: string = '';
  removeFavbtn: string = '';
  isLoading: boolean = true;
  getJsonTranslations() {
    this.translateService.get(['AreYouSureToDeleteConvo', 'cancelRemoveFavBtn', 'removeFavbtn']).subscribe((translations) => {
      this.AreYouSureToDeleteConvo = translations['AreYouSureToDeleteConvo'];
      this.cancelRemoveFavBtn = translations['cancelRemoveFavBtn'];
      this.removeFavbtn = translations['removeFavbtn'];
      // this.isLoading = false;
    })
  }
}
