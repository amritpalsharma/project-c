import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { UploadPopupComponent } from '../../upload-popup/upload-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';
import { CoverImageCropperComponent } from '../../../shared/cover-image-cropper/cover-image-cropper.component';
import { ToastrService } from 'ngx-toastr';
import { UserRoleService } from '../../../../services/user-role.service';

@Component({
  selector: 'app-gallery-tab',
  templateUrl: './gallery-tab.component.html',
  styleUrl: './gallery-tab.component.scss'
})
export class GalleryTabComponent {

  userId: any = '';
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any = `${environment.url}uploads/`;
  selectedFile: any = '';
  isdefaultCoverImage: string = '';
  // defaultCoverImage:any = "./media/palyers.png";
  defaultCoverImage: any = "./assets/images/no_cover_img.png";
  openedMenuId: any = '';
  @Input() coverImage: string = '';  // Define an input property
  @Output() dataEmitter = new EventEmitter<string>();
  constructor(
    public userRoleService: UserRoleService,
    private route: ActivatedRoute, private userService: UserService, public dialog: MatDialog, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      // console.log(params.id)
      this.userId = params.id;
      this.getUserGallery(this.userId)
    });
    console.log(this.coverImage, "image cover")

    if (this.coverImage == "") {
      this.isdefaultCoverImage = 'no_cover_img_css1';
      // this.isShowDefaultImg = '';
      this.coverImage = this.defaultCoverImage;
      // Client ask remove deafult image for admin in ticket #196
      // https://farooqmalik.atlassian.net/jira/software/projects/KAN/boards/1?selectedIssue=KAN-196&text=Talent
    }
  }

  getUserGallery(userId: any) {
    console.log(userId)
    try {
      this.userService.getGalleryData(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.userImages = response.data.images;
          this.userVideos = response.data.videos;
          this.imageBaseUrl = response.data.file_path;
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


  onCoverImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      if (!selectedFile.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
      if (selectedFile.size > maxSizeInBytes) {
        // this.toastr.error(this.maxSizeForProfile, this.errorTxt, {
        //   timeOut: 5000  // Set duration to 5 seconds (5000ms)
        // });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const imageData = reader.result as string;

        const dialogRef = this.dialog.open(CoverImageCropperComponent, {
          width: '850px',
          data: { imageUrl: imageData, action: 'cover_image' },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe((croppedImage) => {
          if (croppedImage) {
            console.log('Cropped Image:', croppedImage);
            this.uploadCroppedCoverImage(croppedImage);

          } else {
            console.log('No cropped image returned');
          }
        });
      };

      reader.readAsDataURL(selectedFile);
    } else {
      console.error('No file selected');
    }
  }


  uploadCroppedCoverImage(croppedImage: string): void {
    const blob = this.dataURItoBlob(croppedImage);
    const formData = new FormData();
    formData.append('cover_image', blob, 'cropped-image.png');

    // Show a loading toast
    // this.toastr.info(this.uploadingPhotos, this.pleaseWait, { disableTimeOut: true });

    try {
      this.userService.uploadCoverImage(this.userId, formData).subscribe(
        (response) => {
          if (response && response.status) {
            this.coverImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
            this.dataEmitter.emit(this.coverImage);  // Emit updated cover image
            this.toastr.clear();
            if (response.message != '') {
              this.toastr.success(response.message);
            } else {
              this.toastr.success('Cover image uploaded successfully!', 'Success');
            }
          } else {
            // this.toastr.clear();
            // this.toastr.error(this.generalError, this.errorTxt);
            console.error('Invalid API response structure:', response);
          }
        },
        (error) => {
          // this.toastr.clear();
          // this.toastr.error(this.generalError, this.errorTxt);
          console.error('Error uploading cover image:', error);
        },
      );
    } catch (error) {
      // this.toastr.clear();
      // this.toastr.error(this.generalError, this.errorTxt);
      console.error('Error during cover image upload:', error);
    }

  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  onCoverFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      console.log(this.selectedFile)
      try {
        let lang_id = localStorage.getItem('lang_id');

        const formdata = new FormData();
        formdata.append("cover_image", this.selectedFile);
        formdata.append("lang", lang_id + '');

        this.userService.uploadCoverImage(this.userId, formdata).subscribe((response) => {
          if (response && response.status) {
            this.coverImage = environment.url + "uploads/" + response.data.uploaded_fileinfo;
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

  deleteCoverImage() {
    try {
      this.userService.deleteCoverImage(this.userId).subscribe((response) => {
        if (response && response.status) {
          setTimeout(() => {
            this.coverImage = './assets/images/no_cover_img.png';
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

  addPhotosPopup() {
    const messageDialog = this.dialog.open(UploadPopupComponent, {
      width: '900px',
      // height: '300px',
      position: {
        top: '150px'
      },
      data: {
        userId: this.userId,
        type: "image"
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.files.length) {
          console.log(result.files)
          this.userImages = [...result.files, ...this.userImages];
          console.log(this.userImages)
        }
      }
    });
  }

  addVideosPopup() {
    const messageDialog = this.dialog.open(UploadPopupComponent, {
      width: '900px',
      // height: '300px',
      position: {
        top: '150px'
      },
      data: {
        userId: this.userId,
        type: "video"
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.files.length) {
          console.log(result.files)
          this.userVideos = [...result.files, ...this.userVideos];
          console.log(this.userVideos)
        }
      }
    });
  }

  openMenu(id: any) {
    this.openedMenuId = id;
  }

  deleteImage(id: any) {

    try {
      let params = { id: [id] };
      this.userService.deleteGalleryImage(params).subscribe((response) => {
        if (response && response.status) {
          let index = this.userImages.findIndex((x: any) => x.id == id)
          this.userImages.splice(index, 1);
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

  downloadImage(baseUrl: any, image: any) {

    fetch(baseUrl + image)
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


  deleteVideo(id: any) {

    try {
      let params = { id: [id] };
      this.userService.deleteGalleryImage(params).subscribe((response) => {
        if (response && response.status) {
          let index = this.userVideos.findIndex((x: any) => x.id == id)
          this.userVideos.splice(index, 1);
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

  downloadVideo(baseUrl: any, video: any) {

    fetch(baseUrl + video)
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
        anchor.download = video; // Set the filename for download
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
