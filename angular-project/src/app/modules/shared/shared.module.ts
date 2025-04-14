import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from './image-cropper/image-cropper.module';

@NgModule({
  imports: [
    CommonModule,
    ImageCropperModule
  ],
  exports: [
    ImageCropperModule
  ]
})
export class SharedModule { }