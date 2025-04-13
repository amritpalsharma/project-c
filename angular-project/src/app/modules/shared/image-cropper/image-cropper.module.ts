import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from './image-cropper.component';

@NgModule({
  declarations: [
    ImageCropperComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ImageCropperComponent
  ]
})
export class ImageCropperModule { }