// cover-image-cropper.component.ts
import {
  Component,
  Inject,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cover-image-cropper',
  templateUrl: './cover-image-cropper.component.html',
  styleUrls: ['./cover-image-cropper.component.scss'],
})
export class CoverImageCropperComponent implements AfterViewInit {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropBox') cropBox!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  imageUrl: string = '';
  pos = { x: 0, y: 0 };
  cropWidth = 800;
  cropHeight = 360;
  isDragging = false;
  isResizing = false;
  offset = { x: 0, y: 0 };
  initial = { width: 800, height: 360 };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoverImageCropperComponent>
  ) {
    this.imageUrl = data.imageUrl;
  }

  ngAfterViewInit(): void {
    // Center crop box based on image container
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    this.pos.x = (containerRect.width - this.cropWidth) / 2;
    this.pos.y = (containerRect.height - this.cropHeight) / 2;

    this.centerCropBox(); // image already loaded
    this.updateCropMaskVars();
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    const point = this.getEventPoint(event);
    this.offset = {
      x: point.x - this.pos.x,
      y: point.y - this.pos.y,
    };
    document.addEventListener('mousemove', this.onMoveDrag);
    document.addEventListener('touchmove', this.onMoveDrag, { passive: false });
    document.addEventListener('mouseup', this.stopAction);
    document.addEventListener('touchend', this.stopAction);

  }

  updateCropMaskVars() {
    const container = this.container.nativeElement;
    container.style.setProperty('--crop-x', `${this.pos.x + this.cropWidth / 2}px`);
    container.style.setProperty('--crop-y', `${this.pos.y + this.cropHeight / 2}px`);
    container.style.setProperty('--crop-width', `${this.cropWidth}px`);
    container.style.setProperty('--crop-height', `${this.cropHeight}px`);
  }

  centerCropBox() {
    // const containerRect = this.container.nativeElement.getBoundingClientRect();

    // // Ensure the crop box fits inside the container
    // this.cropWidth = Math.min(this.cropWidth, containerRect.width);
    // this.cropHeight = Math.min(this.cropHeight, containerRect.height);

    // this.pos.x = (containerRect.width - this.cropWidth) / 2;
    // this.pos.y = (containerRect.height - this.cropHeight) / 2;

    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const imageRect = this.imageElement.nativeElement.getBoundingClientRect();

    const cropW = Math.min(this.cropWidth, imageRect.width);
    const cropH = Math.min(this.cropHeight, imageRect.height);

    this.cropWidth = cropW;
    this.cropHeight = cropH;

    this.pos.x = (imageRect.width - cropW) / 2 + (imageRect.left - containerRect.left);
    this.pos.y = (imageRect.height - cropH) / 2 + (imageRect.top - containerRect.top);

    this.updateCropMaskVars(); // ensure white area is correct
  }


  startResize(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    const point = this.getEventPoint(event);
    this.offset = { x: point.x, y: point.y };
    this.initial = { width: this.cropWidth, height: this.cropHeight };
    document.addEventListener('mousemove', this.onMoveResize);
    document.addEventListener('touchmove', this.onMoveResize, { passive: false });
    document.addEventListener('mouseup', this.stopAction);
    document.addEventListener('touchend', this.stopAction);
  }

  onMoveDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;
    const point = this.getEventPoint(event);
    const newX = point.x - this.offset.x;
    const newY = point.y - this.offset.y;
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    this.pos.x = Math.max(0, Math.min(newX, containerRect.width - this.cropWidth));
    this.pos.y = Math.max(0, Math.min(newY, containerRect.height - this.cropHeight));
    this.updateCropMaskVars();
  };

  // onMoveResize = (event: MouseEvent | TouchEvent) => {
  //   if (!this.isResizing) return;
  //   const point = this.getEventPoint(event);
  //   const deltaX = point.x - this.offset.x;
  //   const deltaY = point.y - this.offset.y;

  //   const newWidth = this.initial.width + deltaX;
  //   const newHeight = this.initial.height + deltaY;

  //   const containerRect = this.container.nativeElement.getBoundingClientRect();

  //   this.cropWidth = Math.max(100, Math.min(newWidth, containerRect.width - this.pos.x));
  //   this.cropHeight = Math.max(60, Math.min(newHeight, containerRect.height - this.pos.y));
  //   this.updateCropMaskVars();
  // };
  onMoveResize = (event: MouseEvent | TouchEvent) => {
    if (!this.isResizing) return;
    const point = this.getEventPoint(event);
    const deltaX = point.x - this.offset.x;
    const deltaY = point.y - this.offset.y;

    const newWidth = this.initial.width + deltaX;
    const newHeight = this.initial.height + deltaY;

    const containerRect = this.container.nativeElement.getBoundingClientRect();

    // Enforcing the max width and height limits
    this.cropWidth = Math.max(100, Math.min(newWidth, 800, containerRect.width - this.pos.x));
    this.cropHeight = Math.max(60, Math.min(newHeight, 360, containerRect.height - this.pos.y));

    this.updateCropMaskVars();
  };

  stopAction = () => {
    this.isDragging = false;
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onMoveDrag);
    document.removeEventListener('touchmove', this.onMoveDrag);
    document.removeEventListener('mousemove', this.onMoveResize);
    document.removeEventListener('touchmove', this.onMoveResize);
    document.removeEventListener('mouseup', this.stopAction);
    document.removeEventListener('touchend', this.stopAction);
  };

  getEventPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  }

  cropImage() {
    const img = this.imageElement.nativeElement;
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const imageRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imageRect.width;
    const scaleY = img.naturalHeight / imageRect.height;
    const cropLeft = (this.pos.x - imageRect.left + containerRect.left) * scaleX;
    const cropTop = (this.pos.y - imageRect.top + containerRect.top) * scaleY;
    const canvas = document.createElement('canvas');
    canvas.width = this.cropWidth * scaleX;
    canvas.height = this.cropHeight * scaleY;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      cropLeft,
      cropTop,
      this.cropWidth * scaleX,
      this.cropHeight * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    this.dialogRef.close(croppedBase64);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  onTouchStartDrag(event: TouchEvent) {
    this.startDrag(event);
  }

  onTouchStartResize(event: TouchEvent) {
    this.startResize(event);
  }
}