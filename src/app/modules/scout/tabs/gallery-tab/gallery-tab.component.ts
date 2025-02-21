import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadPopupComponent } from '../../upload-popup/upload-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { TalentService } from '../../../../services/talent.service';
import { DeletePopupComponent } from '../../delete-popup/delete-popup.component';
import { ToastrService } from 'ngx-toastr';
import { ScoutService } from '../../../../services/scout.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'scout-gallery-tab',
  templateUrl: './gallery-tab.component.html',
  styleUrl: './gallery-tab.component.scss'
})
export class GalleryTabComponent {
  
  userId: any = '';
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any = "";
  selectedFile: any = '';
  defaultCoverImage:any = "./media/palyers.png";
  openedMenuId:any = '';
  @Input() coverImage: string = '';  // Define an input property
  @Output() dataEmitter = new EventEmitter<string>();
  @Input() isPremium: any;

  isLoading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private scoutService: ScoutService,
    public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      // console.log(params.id)
      this.userId = params.id;
      this.getGalleryData()
    });
    
    if(this.coverImage == ""){
      this.coverImage = this.defaultCoverImage;
    }
  }

  getGalleryData(){
    try {
      this.scoutService.getGalleryData().subscribe((response)=>{
        if (response && response.status && response.data) {
          this.userImages = response.data.images; 
          this.userVideos = response.data.videos; 
          this.imageBaseUrl = response.data.file_path;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  onCoverFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      console.log(this.selectedFile)
      try {

        const formdata = new FormData();
        formdata.append("cover_image", this.selectedFile);

        this.scoutService.uploadCoverImage(formdata).subscribe((response)=>{
          if (response && response.status) {
            this.coverImage = environment.url+"uploads/"+response.data.uploaded_fileinfo;
            this.dataEmitter.emit(this.coverImage); // Emitting the data
            // this.isLoading = false;
          } else {
            // this.isLoading = false;
            console.error('Invalid API response structure:', response);
          }
        });
      } catch (error) {
        // this.isLoading = false;
        console.error('Error fetching users:', error); 
      }
    }
  }

  deleteCoverImage(){
    try {
      this.scoutService.deleteCoverImage().subscribe((response)=>{
        if (response && response.status) {
          setTimeout(() => {
            this.coverImage = './media/palyers.png';
          }, 100);
          this.dataEmitter.emit(''); // Emitting the data
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error); 
    }
  }

  addPhotosPopup(type:string='all'){
    const messageDialog = this.dialog.open(UploadPopupComponent,{
      width: '715px',
      position: {
        top:'150px',
      },
      data: {
        userId: this.userId,
        file:type
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.files.length){
          console.log(result.files)
          this.getGalleryData()
        }
      }
    });
  }

  openMenu(imageId: string): void {
    // Toggle the menu for the given image ID
    this.openedMenuId = this.openedMenuId === imageId ? null : imageId;
  }

  deleteImage(id: any) {
    try {
      const loadingToast = this.toastr.info('Deleting image...', 'Please wait', { disableTimeOut: true });
      let params = { id: [id] };
  
      this.scoutService.deleteGalleryImage(params).subscribe({
        next: (response) => {
          this.toastr.clear(loadingToast.toastId);
          if (response && response.status) {
            const index = this.userImages.findIndex((x: any) => x.id === id);
            this.userImages.splice(index, 1);
            this.toastr.success('Image deleted successfully!', 'Delete Success');
          } else {
            this.toastr.error('Failed to delete image.', 'Delete Failed');
            console.error('Invalid API response structure:', response);
          }
        },
        error: (error) => {
          this.toastr.clear(loadingToast.toastId);
          this.toastr.error('An error occurred while deleting the image.', 'Error');
          console.error('Error deleting image:', error);
        }
      });
    } catch (error) {
      this.toastr.error('An error occurred. Please try again.', 'Unexpected Error');
      console.error('Unexpected error:', error);
    }
  }

  openDeleteDialog(id: any): void {
    // Close the floating menu when opening the dialog
    this.openedMenuId = null;
  
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Proceed with deletion if the user confirms
        this.deleteImage(id);
      } else {
        console.log('User canceled the delete');
      }
    });
  }
  
  downloadImage(baseUrl:any, image:any){

    fetch(baseUrl+image)
     .then(response => {
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       return response.blob(); // Convert the response to a Blob object
     })
     .then(blob => {
      this.openedMenuId = '';
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = image; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
     })
     .catch(error => {
       console.error('There was an error downloading the file:', error);
     });
  } 

}
