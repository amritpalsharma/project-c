import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {

  userId: any = '';
  uploadedFiles:any = [];
  uploadResponse:any = [];
  type:string = "";
  constructor(private userService: UserService, public dialogRef : MatDialogRef<UploadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.userId = data.userId;
      this.type = data.type;
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

    if(this.type == "image"){
      this.uploadImages(this.files);
    }else if(this.type == "video"){
      this.uploadVideos(this.files);
    }
   
  }

  uploadImages(files:any){
    const formdata = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formdata.append("gallery_images[]", files[i]);
    }

    console.log('formdata')
    console.log(formdata)

    this.userService.uploadGalleryImages(this.userId, formdata).subscribe((response)=>{
      console.log(response)
      response.forEach((row:any) => {
        console.log(row);
        this.uploadResponse.push(row.message)
        if(row.status){
          this.uploadedFiles.push({id:row.data.id, file_name: row.data.uploaded_file});
        }

      });
      // if (response && response.status) {
        
        // this.isLoading = false;
      // } else {
        // this.isLoading = false;
        // console.error('Invalid API response structure:', response);
      // }
    });
  }

  uploadVideos(files:any){
    const formdata = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formdata.append("gallery_images[]", files[i]);
    }

    console.log('formdata')
    console.log(formdata)

    this.userService.uploadGalleryImages(this.userId, formdata).subscribe((response)=>{
      console.log(response)
      response.forEach((row:any) => {
        console.log(row);
        this.uploadResponse.push(row.message)
        if(row.status){
          this.uploadedFiles.push({id:row.data.id, file_name: row.data.uploaded_file});
        }

      });
      // if (response && response.status) {
        
        // this.isLoading = false;
      // } else {
        // this.isLoading = false;
        // console.error('Invalid API response structure:', response);
      // }
    });
  }

  close() {
    this.dialogRef.close({
      files: this.uploadedFiles
    });
  }
}
