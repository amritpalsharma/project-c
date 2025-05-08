import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent {

  theme : any = localStorage.getItem('theme');

  constructor(public dialogRef: MatDialogRef<DeletePopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private translateService: TranslateService, private webPages : WebPages) {}

  fromPage : string = '';
  type : string = '';
  type2 : string = '';
  galleryText : string = '';
  mainText : string = '';

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.fromPage = this.data.from_page;
    this.type = this.data.type==='video' ? 'video' : 'photo';
    this.type2 = this.data.type2==='profile' ? 'profile' : '';
    this.webPages.languageId$.subscribe((data) => {
      this.mainText = this.getJsonTranslations();
    });
  }

  confirmDelete(): void {
    // Close the dialog and return true (confirm deletion)
    this.dialogRef.close(true);
  }

  cancel(): void {
    // Close the dialog without any action (cancel deletion)
    this.dialogRef.close(false);
  }

  getJsonTranslations() {
    let type2 : string = '';
    this.translateService.get(['deleteFromGalleryConfirmation', this.type]).subscribe((translations) => {
      this.galleryText = translations['deleteFromGalleryConfirmation'];
      type2 = translations[this.type];
    })

    let text = this.galleryText.replace('{{type}}', type2);

    return text;
  }
}
