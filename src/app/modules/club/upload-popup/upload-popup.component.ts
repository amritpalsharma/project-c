import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { ScoutService } from '../../../services/scout.service';
import { MessagePopupComponent } from '../message-popup/message-popup.component';


@Component({
  selector: 'talent-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {

  isLoading : boolean = false;

  userId: any = '';
  uploadedFiles: any = [];
  uploadResponse: any = [];
  constructor(private scoutService: ScoutService, public dialog: MatDialog, public dialogRef: MatDialogRef<UploadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userId = data.userId;
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

  uploadImages(files: any) {
    this.isLoading = true;
    const formdata = new FormData();

    for (let i = 0; i < files.length; i++) {
      formdata.append("gallery_images[]", files[i]);
    }

    console.log('formdata')
    console.log(formdata)

    this.scoutService.uploadGalleryImages(formdata).subscribe((response) => {
      console.log(response)
      response.forEach((row: any) => {
        console.log(row);
        this.uploadResponse.push(row.message)
        if (row.status) {
          this.uploadedFiles.push({ id: row.data.id, file_name: row.data.uploaded_file });
        }

      });

      if (response[0].status) {
        this.isLoading = false;
        this.showMatDialog(response[0].message, 'display');
        this.dialogRef.close({
          files: this.uploadedFiles
        });
      }
    });
  }

  close() {
    this.dialogRef.close({
      files: this.uploadedFiles
    });
  }
}
