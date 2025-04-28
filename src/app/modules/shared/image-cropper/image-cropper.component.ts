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

  ngAfterViewChecked() {
    const container = this.container.nativeElement;
    container.style.setProperty('--crop-x', `${this.pos.x + this.size / 2}px`);
    container.style.setProperty('--crop-y', `${this.pos.y + this.size / 2}px`);
    container.style.setProperty('--crop-size', `${this.size}px`);
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


  // startDrag(event: MouseEvent | TouchEvent) {
  //   this.isDragging = true;
  //   if (event instanceof MouseEvent) {
  //     this.offset = {
  //       x: event.clientX - this.pos.x,
  //       y: event.clientY - this.pos.y,
  //     };
  //   } else if (event instanceof TouchEvent) {
  //     // clientX = event.touches[0].clientX;
  //     // clientY = event.touches[0].clientY;

  //     this.offset = {
  //       x: event.touches[0].clientX - this.pos.x,
  //       y: event.touches[0].clientY - this.pos.y,
  //     };
  //   }
  //   // this.offset = {
  //   //   x: event.clientX - this.pos.x,
  //   //   y: event.clientY - this.pos.y,
  //   // };
  //   event.stopPropagation();
  // }

  // startResize(event: MouseEvent | TouchEvent) {
  //   this.isResizing = true;
  //   if (event instanceof MouseEvent) {
  //     this.offset = {
  //       x: event.clientX - this.pos.x,
  //       y: event.clientY - this.pos.y,
  //     };
  //   } else if (event instanceof TouchEvent) {
  //     // clientX = event.touches[0].clientX;
  //     // clientY = event.touches[0].clientY;

  //     this.offset = {
  //       x: event.touches[0].clientX - this.pos.x,
  //       y: event.touches[0].clientY - this.pos.y,
  //     };
  //   }
  //   // this.offset = {
  //   //   x: event.clientX,
  //   //   y: event.clientY,
  //   // };
  //   this.initialSize = this.size;
  //   event.stopPropagation();
  //   event.preventDefault();
  // }

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
