import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';

@Component({
  selector: 'app-add-perfomance-report',
  templateUrl: './add-perfomance-report.component.html',
  styleUrls: ['./add-perfomance-report.component.scss'],
})
export class AddPerfomanceReportComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  documentTitle: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddPerfomanceReportComponent>,
    public dialog: MatDialog,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient // Inject HttpClient to handle requests
  ) {}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  }

  onDrop(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('report', this.selectedFile);
      formData.append('document_title', this.documentTitle);
  
      // Using talentService to upload the file with progress tracking
      this.talentService.uploadReport(formData).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            // Calculate and update upload progress
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            console.log(`Upload Progress: ${this.uploadProgress}%`);
          }
        } else if (event.type === HttpEventType.Response) {
          // Handle successful upload response
          console.log('Upload complete', event.body);
          this.dialogRef.close(true); // Close dialog on success
        }
      }, error => {
        console.error('Error uploading report:', error);
      });
    } else {
      console.log('No file selected for upload.');
    }
  }
  
  
  // Upload the performance report
  uploadPerformanceReport() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('report', this.selectedFile);
      formData.append('document_title', this.documentTitle);

      this.talentService.uploadReport(formData).subscribe(
        response => {
          console.log('Upload successful:', response);
          this.dialogRef.close(true); // Close the dialog and return success
        },
        error => {
          console.error('Error uploading report:', error);
        }
      );
    } else {
      console.log('No file selected for upload.');
    }
  }
}
