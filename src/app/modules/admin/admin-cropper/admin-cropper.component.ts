import { Component, Inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-admin-cropper',
  templateUrl: './admin-cropper.component.html',
  styleUrl: './admin-cropper.component.scss'
})
export class AdminCropperComponent {

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
  
    // cover image
    width: number = 600;
    height: number = 200;
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private dialogRef: MatDialogRef<AdminCropperComponent>
    ) {
      this.imageUrl = data.imageUrl;
  
      // if (this.data.action === 'cover_image') {
      //   this.width = 600;
      //   this.height = 200;
      // }
    }
  
  
    ngAfterViewChecked() {
      const container = this.container.nativeElement;
      const cropWidth = this.size * 5 / 2;
      const cropHeight = this.size;
  
      container.style.setProperty('--crop-x', `${this.pos.x + cropWidth / 2}px`);
      container.style.setProperty('--crop-y', `${this.pos.y + cropHeight / 2}px`);
      container.style.setProperty('--crop-width', `${cropWidth}px`);
      container.style.setProperty('--crop-height', `${cropHeight}px`);
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
  
    startResize(event: MouseEvent | TouchEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isResizing = true;
  
      const point = this.getEventPoint(event);
      this.offset = {
        x: point.x,
        y: point.y,
      };
      this.initialSize = this.size;
  
      document.addEventListener('mousemove', this.onMoveResize);
      document.addEventListener('touchmove', this.onMoveResize, { passive: false });
      document.addEventListener('mouseup', this.stopAction);
      document.addEventListener('touchend', this.stopAction);
    }
  
    onMoveDrag = (event: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
  
      event.preventDefault();
  
      const point = this.getEventPoint(event);
  
      const containerRect = this.container.nativeElement.getBoundingClientRect();
      const cropBoxRect = this.cropBox.nativeElement.getBoundingClientRect();
  
      const newX = point.x - this.offset.x;
      const newY = point.y - this.offset.y;
  
      // Make sure the box stays inside container
      const maxX = containerRect.width - cropBoxRect.width;
      const maxY = containerRect.height - cropBoxRect.height;
  
      this.pos.x = Math.max(0, Math.min(newX, maxX));
      this.pos.y = Math.max(0, Math.min(newY, maxY));
    };
  
  
  
    onMoveResize = (event: MouseEvent | TouchEvent) => {
    if (!this.isResizing) return;
  
    event.preventDefault();
  
    const point = this.getEventPoint(event);
    const deltaX = point.x - this.offset.x;
  
    // Maintain 5:2 ratio: width = size * 2.5, height = size
    let newSize = this.initialSize + deltaX;
  
    const containerRect = this.container.nativeElement.getBoundingClientRect();
  
    // Calculate width and height of new crop box
    let newWidth = newSize * 2.5;
    let newHeight = newSize;
  
    // Restrict resizing if it goes outside container
    const maxWidth = containerRect.width - this.pos.x;
    const maxHeight = containerRect.height - this.pos.y;
  
    // Adjust size so it fits within container bounds
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newSize = newWidth / 2.5;
      newHeight = newSize;
    }
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newSize = newHeight;
      newWidth = newSize * 2.5;
    }
  
    // Minimum size constraint
    newSize = Math.max(50, newSize);
  
    this.size = newSize;
  };
  
  
    onMoveResize2 = (event: MouseEvent | TouchEvent) => {
      if (!this.isResizing) return;
  
      event.preventDefault();
  
      const point = this.getEventPoint(event);
      const delta = {
        x: point.x - this.offset.x,
        y: point.y - this.offset.y,
      };
  
      let newSize = this.initialSize + Math.max(delta.x, delta.y);
  
      const containerRect = this.container.nativeElement.getBoundingClientRect();
  
      // Prevent the box from resizing outside container
      const maxWidth = containerRect.width - this.pos.x;
      const maxHeight = containerRect.height - this.pos.y;
      const maxSize = Math.min(maxWidth, maxHeight);
  
      this.size = Math.max(50, Math.min(newSize, maxSize)); // minimum 50px
    };
  
  
    stopAction = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      this.isDragging = false;
      this.isResizing = false;
  
      document.removeEventListener('mousemove', this.onMoveDrag);
      document.removeEventListener('touchmove', this.onMoveDrag);
      document.removeEventListener('mousemove', this.onMoveResize);
      document.removeEventListener('touchmove', this.onMoveResize);
      document.removeEventListener('mouseup', this.stopAction);
      document.removeEventListener('touchend', this.stopAction);
    };
  
    private getEventPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
      if (event instanceof MouseEvent) {
        return { x: event.clientX, y: event.clientY };
      } else {
        const touch = event.touches[0] || event.changedTouches[0];
        return { x: touch.clientX, y: touch.clientY };
      }
    }
  
    onTouchStartDrag(event: TouchEvent) {
      event.preventDefault();
      this.startDrag(event);
    }
  
    onTouchStartResize(event: TouchEvent) {
      event.preventDefault();
      this.startResize(event);
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
  
    const cropWidth = this.size * 2.5;
    const cropHeight = this.size;
  
    // Calculate exact crop positions on the image
    const cropLeft = (this.pos.x + containerRect.left - imageRect.left) * scaleX;
    const cropTop = (this.pos.y + containerRect.top - imageRect.top) * scaleY;
    const cropW = cropWidth * scaleX;
    const cropH = cropHeight * scaleY;
  
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);
  
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(
      img,
      cropLeft, cropTop, cropW, cropH, // source from original image
      0, 0, canvas.width, canvas.height // destination on canvas
    );
  
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    this.dialogRef.close(croppedBase64);
  }
  
  
    // By Amrit 16-5-25
    cropImage2() {
      const img = this.imageElement.nativeElement;
      const containerRect = this.container.nativeElement.getBoundingClientRect();
      const imageRect = img.getBoundingClientRect();
  
      const scaleX = img.naturalWidth / imageRect.width;
      const scaleY = img.naturalHeight / imageRect.height;
  
      const cropLeft = (this.pos.x - imageRect.left + containerRect.left) * scaleX;
      const cropTop = (this.pos.y - imageRect.top + containerRect.top) * scaleY;
      const cropSize = this.size * scaleX; // Assuming square crop
  
      const canvas = document.createElement('canvas');
  
      // Set max resolution here
      const MAX_RESOLUTION = 3000; // Max resolution width/height
      const resolution = Math.min(cropSize, MAX_RESOLUTION);
      canvas.width = resolution;
      canvas.height = resolution;
  
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
  
      ctx.drawImage(
        img,
        cropLeft,
        cropTop,
        cropSize,
        cropSize,
        0,
        0,
        // cropSize,
        // cropSize,
        resolution,
        resolution
      );
  
      // Use 'image/jpeg' with quality or 'image/png' for lossless
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      this.dialogRef.close(croppedBase64);
    }
  
    cancel() {
      this.dialogRef.close(null);
    }
}