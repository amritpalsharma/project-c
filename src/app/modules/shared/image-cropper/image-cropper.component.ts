import {
  Component,
  Inject,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent2 {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropBox') cropBox!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  imageUrl: string = '';
  pos = { x: 0, y: 0 };
  size = 100;
  isDragging = false;
  isResizing = false;
  offset = { x: 0, y: 0 };
  initialSize = 100;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImageCropperComponent2>
  ) {
    this.imageUrl = data.imageUrl;
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.offset = {
      x: event.clientX - this.pos.x,
      y: event.clientY - this.pos.y,
    };
    event.stopPropagation();
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    this.offset = {
      x: event.clientX,
      y: event.clientY,
    };
    this.initialSize = this.size;
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('document:mouseup')
  endDrag() {
    this.isDragging = false;
    this.isResizing = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const containerRect = this.container.nativeElement.getBoundingClientRect();

    if (this.isDragging) {
      const newX = event.clientX - this.offset.x;
      const newY = event.clientY - this.offset.y;

      this.pos.x = Math.min(
        Math.max(0, newX),
        containerRect.width - this.size
      );
      this.pos.y = Math.min(
        Math.max(0, newY),
        containerRect.height - this.size
      );
    }

    if (this.isResizing) {
      const dx = event.clientX - this.offset.x;
      const dy = event.clientY - this.offset.y;

      const delta = Math.max(dx, dy);
      let newSize = this.initialSize + delta;

      const maxWidth = containerRect.width - this.pos.x;
      const maxHeight = containerRect.height - this.pos.y;
      newSize = Math.min(newSize, maxWidth, maxHeight);
      newSize = Math.max(50, newSize); // minimum size

      this.size = newSize;
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
    const cropSize = this.size * scaleX;

    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      cropLeft,
      cropTop,
      cropSize,
      cropSize,
      0,
      0,
      250,
      250
    );

    const croppedBase64 = canvas.toDataURL('image/png');
    this.dialogRef.close(croppedBase64);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
