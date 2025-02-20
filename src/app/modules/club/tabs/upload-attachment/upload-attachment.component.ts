import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-upload-attachment',
  templateUrl: './upload-attachment.component.html',
  styleUrl: './upload-attachment.component.scss'
})
export class UploadAttachmentComponent {
  idToBeUpdated:any = "";
  attachmentRows:any = [{
    title: "",
    file: ""
  }];

  constructor(public dialogRef : MatDialogRef<UploadAttachmentComponent>, public userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.idToBeUpdated = data.id;

      console.log(this.idToBeUpdated)
    }
  
  close(){
    this.dialogRef.close();
  }

  titleUpdate(event: any, index:any){
    let value = event.target.value;
    this.attachmentRows[index].title = value;
  }

  addNewRow(){
    this.attachmentRows.push({
      title: "",
      file: ""
    });
  }

  removeRow(index:any):any {

    if(this.attachmentRows.length == 1){
      return false;
    }
    let temp = this.attachmentRows;
    temp.splice(index,1);
    this.attachmentRows = temp;
  }

  onAttachmentFileChange(event: Event, index:any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentRows[index].file = input.files[0];
    }
  }

  upload(){
    const formData = new FormData();

    this.attachmentRows.map(function(attachment:any, index:any) {
      formData.append('attachments['+index+'][title]', attachment.title);
      formData.append('attachments['+index+'][file]', attachment.file);
    });
    
    try {
      this.userService.uploadSightAttachment(this.idToBeUpdated, formData).subscribe((response)=>{
       if (response && response.status) {
         this.dialogRef.close({
          id: this.idToBeUpdated,
          action: 'added'
         })
       } else {
         console.error('Invalid API response structure:', response); 
       }
     });     
   } catch (error) {
     console.error('Error:', error);
   }
  }
    
}
