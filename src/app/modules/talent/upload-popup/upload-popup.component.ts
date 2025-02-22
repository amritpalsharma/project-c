import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { TalentService } from '../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'talent-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {

  userId: any = '';
  uploadedFiles: any = [];
  uploadResponse: { message: string; status: boolean }[] = []; // Updated type
  file: any = 'all';
  pleaseWait: string = '';
  uploadingPhotos: string = '';

  constructor(private userService: TalentService, public dialogRef: MatDialogRef<UploadPopupComponent>, private toastr: ToastrService, private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userId = data.userId;
    this.file = data.file ? data.file : 'all';
  }

  files: File[] = [];

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


  uploadImages(files: any) {
    // let loadingToast = [];
    this.translateService.get([
      'pleaseWait',
      'uploadingPhotos',
    ]).subscribe((translations) => {
      const loadingToast = this.toastr.info(translations['pleaseWait'], translations['uploadingPhotos'], {
        disableTimeOut: true, // Keep the toaster open until manually cleared
      });
      const formdata = new FormData();
      // let lang_id = localStorage.getItem('lang_id');
      // formdata.append("lang",lang_id);
      for (let i = 0; i < files.length; i++) {
        formdata.append("gallery_images[]", files[i]);
      }

      this.userService.uploadGalleryImages(formdata).subscribe((response) => {
        console.log(response);
        response.forEach((row: any) => {
          console.log('row', row);
          // Add both message and status to uploadResponse array
          this.uploadResponse.push({ message: row.message, status: row.status });

          if (row.status) {
            this.toastr.clear(loadingToast.toastId);
            this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
          } else {
            this.toastr.clear(loadingToast.toastId);
            this.toastr.error(row.message, 'Error');
          }
        });
      });
    });
  }

  close() {
    this.dialogRef.close({
      files: this.uploadedFiles
    });
  }
}
