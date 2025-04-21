import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-lightbox-dialog',
  templateUrl: './lightbox-dialog.component.html',
  styleUrls: ['./lightbox-dialog.component.scss']
})
export class LightboxDialogComponent {
  currentIndex = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { album: any[], mainImage: any }) {
    this.currentIndex = data.album.findIndex(item => item.src === data.mainImage.src);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.data.album.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.data.album.length) % this.data.album.length;
  }

  get currentItem() {
    return this.data.album[this.currentIndex];
  }
}
