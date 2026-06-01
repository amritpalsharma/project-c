import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {

  userId: any = '';
  uploadedFiles: any = [];
  uploadResponse: any = [];
  type: string = "";
  theme: string = localStorage.getItem('theme') || 'dark';
  constructor(
    private translateService: TranslateService,
    private toaster: ToastrService,
    private userService: UserService,
    public dialogRef: MatDialogRef<UploadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userId = data.userId;
    this.type = data.type;
  }

  files: File[] = [];

  // Handles when dragging files over the drop zone
  onDragOver(event: DragEvent) {
    if (typeof document === 'undefined') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('dragover');
  }

  // Handles when dragging files leaves the drop zone
  onDragLeave(event: DragEvent) {
    if (typeof document === 'undefined') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragover');
  }

  // Handles dropping files into the drop zone
  onFileDropped(event: DragEvent) {
    if (typeof document === 'undefined') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragover');

    // Check if the event has files and add them to the file list
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  // Handles file selection from the input
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  // Adds the selected files to the list
  addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i)!);
    }

    if (this.type == "image") {
      this.uploadImages(this.files);
    } else if (this.type == "video") {
      this.uploadVideos(this.files);
    }

  }
  uploadProgress = 0;
  isLoading: boolean = false;
  // uploadImages(files: any) {
  //   this.isLoading = true;
  //   const formdata = new FormData();
  //   this.uploadProgress = 0;
  //   for (let i = 0; i < files.length; i++) {
  //     formdata.append("gallery_images[]", files[i]);
  //   }
  //   let lang_id = localStorage.getItem('lang_id');
  //   formdata.append('lang', lang_id + '');
  //   console.log('formdata')
  //   console.log(formdata)
  //   let loadingToast: any;
  //   this.translateService.get(['pleaseWait', 'uploadFiles']).subscribe((translations) => {
  //     loadingToast = this.toaster.info(`${translations['pleaseWait']}`, translations['uploadFiles'], {
  //       disableTimeOut: true,
  //     });
  //   })

  //   this.userService.uploadGalleryImages(this.userId, formdata).subscribe({
  //     next: (event: HttpEvent<any>) => {
  //       if (event.type === HttpEventType.UploadProgress && event.total) {
  //         this.uploadProgress = Math.round((100 * event.loaded) / event.total);
  //         // this.toastr.update(loadingToast.toastId, `${translations['pleaseWait']} (${this.uploadProgress}%)`, translations['uploadFiles']);
  //       }

  //       if (event.type === HttpEventType.Response) {
  //         const response = event.body;

  //         response.forEach((row: any) => {
  //           if (row.status) {
  //             this.toaster.clear(loadingToast.toastId);
  //             this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
  //           } else {
  //             this.files = [];
  //             this.toaster.clear(loadingToast.toastId);
  //             this.toaster.error(row.message);
  //           }
  //         });

  //         if (response[0].status) {
  //           // this.isLoading = false;
  //           // this.showMatDialog(response[0].message, 'display');
  //           this.toaster.success(response[0].message);
  //           this.dialogRef.close({
  //             files: this.uploadedFiles
  //           });
  //           this.isLoading = false;
  //         } else {
  //           this.files = [];
  //           this.isLoading = false;
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       this.toaster.clear(loadingToast.toastId);
  //       this.toaster.error('Upload failed');
  //       this.isLoading = false;
  //     }
  //   });
  //   // this.userService.uploadGalleryImages(this.userId, formdata).subscribe((response) => {
  //   //   console.log(response)
  //   //   response.forEach((row: any) => {
  //   //     console.log(row);
  //   //     this.uploadResponse.push(row.message)
  //   //     if (row.status) {
  //   //       this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
  //   //     }

  //   //   });
  //   //   // if (response && response.status) {

  //   //   // this.isLoading = false;
  //   //   // } else {
  //   //   // this.isLoading = false;
  //   //   // console.error('Invalid API response structure:', response);
  //   //   // }
  //   // });
  // }

  uploadImages(files: any) {
    this.isLoading = true;
    this.uploadProgress = 0;

    this.translateService.get(['pleaseWait', 'uploadFiles']).subscribe((translations) => {
      const loadingToast = this.toaster.info(`${translations['pleaseWait']}`, translations['uploadFiles'], {
        disableTimeOut: true,
      });

      const formdata = new FormData();
      for (let i = 0; i < files.length; i++) {
        formdata.append("gallery_images[]", files[i]);
      }

      this.userService.uploadGalleryImages(this.userId, formdata).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            // this.toastr.update(loadingToast.toastId, `${translations['pleaseWait']} (${this.uploadProgress}%)`, translations['uploadFiles']);
          }

          if (event.type === HttpEventType.Response) {
            const response = event.body;

            response.forEach((row: any) => {
              if (row.status) {
                this.toaster.clear(loadingToast.toastId);
                this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
              } else {
                this.files = [];
                this.toaster.clear(loadingToast.toastId);
                this.toaster.error(row.message);
              }
            });

            if (response[0].status) {
              this.isLoading = false;
              // this.showMatDialog(response[0].message, 'display');
              this.toaster.success(response[0].message);
              this.dialogRef.close({
                files: this.uploadedFiles
              });
            } else {
              this.files = [];
              this.isLoading = false;
            }
          }
        },
        error: (err) => {
          this.toaster.clear(loadingToast.toastId);
          this.toaster.error('Upload failed');
          this.isLoading = false;
        }
      });
    });
  }

  uploadVideos(files: any) {
    const formdata = new FormData();
    this.isLoading = true;
    this.uploadProgress = 0;
    for (let i = 0; i < files.length; i++) {
      formdata.append("gallery_images[]", files[i]);
    }

    console.log('formdata')
    console.log(formdata)

    // this.userService.uploadGalleryImages(this.userId, formdata).subscribe((response) => {
    //   console.log(response)
    //   response.forEach((row: any) => {
    //     console.log(row);
    //     this.uploadResponse.push(row.message)
    //     if (row.status) {
    //       this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
    //     }

    //   });
    // });

    this.translateService.get(['pleaseWait', 'uploadFiles']).subscribe((translations) => {
      const loadingToast = this.toaster.info(`${translations['pleaseWait']}`, translations['uploadFiles'], {
        disableTimeOut: true,
      });
      this.userService.uploadGalleryImages(this.userId, formdata).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            // this.toastr.update(loadingToast.toastId, `${translations['pleaseWait']} (${this.uploadProgress}%)`, translations['uploadFiles']);
          }

          if (event.type === HttpEventType.Response) {
            const response = event.body;

            response.forEach((row: any) => {
              if (row.status) {
                this.toaster.clear(loadingToast.toastId);
                this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
              } else {
                this.files = [];
                this.toaster.clear(loadingToast.toastId);
                this.toaster.error(row.message);
              }
            });

            if (response[0].status) {
              this.isLoading = false;
              // this.showMatDialog(response[0].message, 'display');
              this.toaster.success(response[0].message);
              this.dialogRef.close({
                files: this.uploadedFiles
              });
              this.isLoading = false;
            } else {
              this.files = [];
              this.isLoading = false;
            }
          }
        },
        error: (err) => {
          this.toaster.clear(loadingToast.toastId);
          this.toaster.error('Upload failed');
          this.isLoading = false;
        }
      });
    });
  }

  close() {
    this.dialogRef.close({
      files: this.uploadedFiles
    });
  }
}
