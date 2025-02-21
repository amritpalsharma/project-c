import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scout-lightbox-dialog',
  templateUrl: './lightbox-dialog.component.html',
  styleUrls: ['./lightbox-dialog.component.scss'],
})

export class LightboxDialogComponent {

  lightboxIsOpen: boolean = false; // Track the state of the lightbox
  mainImage: { src: string } = { src: '' }; // Current main image source
  album: any[] = []; // Array for album images
  loggedInUser:any = localStorage.getItem('userData');
  countryFlagUrl : any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Receive data from parent
    private dialogRef: MatDialogRef<LightboxDialogComponent>
  ) {}

  ngOnInit(): void {
  
    if (this.data) {
      this.album = this.data.album;
      this.mainImage = this.data.mainImage;
    }
  }
  
  navigateImage(direction: string): void {
    const currentIndex = this.data.album.findIndex(
      (image: any) => image.src === this.data.mainImage.src
    );

    if (direction === 'prev') {
      const prevIndex = (currentIndex - 1 + this.data.album.length) % this.data.album.length;
      this.data.mainImage.src = this.data.album[prevIndex].src;
    } else if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % this.data.album.length;
      this.data.mainImage.src = this.data.album[nextIndex].src;
    }
  }

  openImage(index: number): void {
    this.data.mainImage.src = this.data.album[index].src;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  // openImage(index: number): void {
  //   // Create album array with images' full paths
  //   this.album = this.highlights.images.map((image: any) => ({
  //     src: this.highlights.file_path + image.file_name,
  //   }));
  
  //   // Set the main image to be the one clicked
  //   this.mainImage = { src: this.album[index].src };
  
  //   // Open the lightbox
  //   this.lightboxIsOpen = true;
  // }
  closeLightbox(): void {
    // Close the lightbox
    this.lightboxIsOpen = false;
  }
}
