import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-cropper-dialog',
  templateUrl: './image-cropper-dialog.component.html',
  styleUrls: ['./image-cropper-dialog.component.scss']
})
export class ImageCropperDialogComponent implements AfterViewInit {
  @ViewChild('image', { static: false }) imageElement!: ElementRef<HTMLImageElement>;
  cropper!: Cropper;
  croppedImage: string = '';
  base64Image: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.warn(this.data);
    this.base64Image = this.data.imageUrl;
    
  }

  ngAfterViewInit() {
    if (!this.base64Image) {
      console.error('No base64 image provided');
      return;
    }

    setTimeout(() => {
      this.initializeCropper();
    },3000);
  }

  initializeCropper() {
    if (this.cropper) this.cropper.destroy();

    this.cropper = new Cropper(this.imageElement.nativeElement, {
      aspectRatio: 1,
      viewMode: 1,
      preview: '.img-preview',
      autoCropArea: 1,
      responsive: true,
    });
  }

  cropImage(): void {
    console.info('TypeOf getCroppedCanvas',typeof this.cropper.getCroppedCanvas);
    console.info('thisCropper',this.cropper);
    if (!this.cropper || typeof this.cropper.getCroppedCanvas !== 'function') {
      console.error('Cropper not initialized or getCroppedCanvas not available');
      return;
    }

    const canvas = this.cropper.getCroppedCanvas();
    if (canvas) {
      this.croppedImage = canvas.toDataURL('image/png');
    } else {
      console.error('Canvas not supported or crop failed');
    }
  }
}
