import { Component } from '@angular/core';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent {
  image: any; // Holds the image to be cropped
  croppedImage: any; // Holds the cropped image

  constructor() {}

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onCrop(): void {
    // Logic for cropping the image
    // This is where you would implement the cropping functionality
  }

  onClear(): void {
    this.image = null;
    this.croppedImage = null;
  }
}