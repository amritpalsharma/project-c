import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { TalentService } from '../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MessagePopupComponent } from '../message-popup/message-popup.component';

@Component({
  selector: 'talent-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {

  userId: any = '';
  isProccess: any = '';
  uploadedFiles: any = [];
  uploadResponse: { message: string; status: boolean }[] = []; // Updated type
  file: any = 'all';
  pleaseWait: string = '';
  uploadingPhotos: string = '';

  isLoading: boolean = false;

  constructor(private talentService: TalentService, public dialog: MatDialog, public dialogRef: MatDialogRef<UploadPopupComponent>, private toastr: ToastrService, private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userId = data.userId;
    this.file = data.file ? data.file : 'all';
  }

  files: File[] = [];

  theme: any = localStorage.getItem('theme');

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
  }

  // Handles when dragging files over the drop zone
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('dragover');
  }

  // Handles when dragging files leaves the drop zone
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragover');
  }

  // Handles dropping files into the drop zone
  onFileDropped(event: DragEvent) {

    event.preventDefault();
    event.stopPropagation();

    const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    if (!validTypes.includes(file.type)) {
      console.warn('Invalid file type');
      return;
    }

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
    this.files = [];
    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i)!);
    }
    this.uploadImages(this.files);
  }

  showMatDialog(message: string, action: string, name: any = '') {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action,
        name: name
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteScoutPlayer();
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  uploadProgress: any

  uploadImages(files: any) {
    this.isLoading = true;
    this.uploadProgress = 0;

    this.translateService.get(['pleaseWait', 'uploadFiles']).subscribe((translations) => {
      const loadingToast = this.toastr.info(`${translations['pleaseWait']}`, translations['uploadFiles'], {
        disableTimeOut: true,
      });

      const formdata = new FormData();
      for (let i = 0; i < files.length; i++) {
        formdata.append("gallery_images[]", files[i]);
      }

      this.talentService.uploadGalleryImages(formdata).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            // this.toastr.update(loadingToast.toastId, `${translations['pleaseWait']} (${this.uploadProgress}%)`, translations['uploadFiles']);
          }

          if (event.type === HttpEventType.Response) {
            const response = event.body;

            response.forEach((row: any) => {
              if (row.status) {
                this.toastr.clear(loadingToast.toastId);
                this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
              } else {
                this.files = [];
                this.toastr.clear(loadingToast.toastId);
                this.toastr.error(row.message);
              }
            });

            if (response[0].status) {
              this.isLoading = false;
              // this.showMatDialog(response[0].message, 'display');
              this.toastr.success(response[0].message);
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
          this.toastr.clear(loadingToast.toastId);
          this.toastr.error('Upload failed');
          this.isLoading = false;
        }
      });
    });
  }

  uploadImages54(files: any) {
    this.isLoading = true;
    // let loadingToast = [];
    this.translateService.get([
      'pleaseWait',
      'uploadingFiles',
    ]).subscribe((translations) => {
      const loadingToast = this.toastr.info(translations['pleaseWait'], translations['uploadingFiles'], {
        disableTimeOut: true, // Keep the toaster open until manually cleared
      });
      const formdata = new FormData();
      // let lang_id = localStorage.getItem('lang_id');
      // formdata.append("lang",lang_id);
      for (let i = 0; i < files.length; i++) {
        formdata.append("gallery_images[]", files[i]);
      }
      this.talentService.uploadGalleryImages(formdata).subscribe((response) => {
        console.log(response);

        response.forEach((row: any) => {
          console.log('row', row);
          // Add both message and status to uploadResponse array
          // this.uploadResponse.push({ message: row.message, status: row.status });

          if (row.status) {
            this.toastr.clear(loadingToast.toastId);
            this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
          } else {
            this.files = [];
            this.toastr.clear(loadingToast.toastId);
            this.toastr.error(row.message);
          }
        });

        if (response[0].status) {
          this.isLoading = false;
          this.showMatDialog(response[0].message, 'display');
          this.dialogRef.close({
            files: this.uploadedFiles
          });
        } else {
          this.files = [];
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
