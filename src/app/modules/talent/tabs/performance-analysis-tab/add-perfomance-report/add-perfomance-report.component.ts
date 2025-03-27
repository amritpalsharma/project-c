import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-add-perfomance-report',
  templateUrl: './add-perfomance-report.component.html',
  styleUrls: ['./add-perfomance-report.component.scss'],
})
export class AddPerfomanceReportComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  documentTitle: string = '';
  enterDocumentTitle: string = '';
  isLoading: boolean = false;

  theme : any = localStorage.getItem('theme');

  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddPerfomanceReportComponent>,
    public dialog: MatDialog,
    private talentService: TalentService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient // Inject HttpClient to handle requests
  ) { }

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.getToasterMsg();
    this.translate.onLangChange.subscribe((event) => {
      this.getToasterMsg();
    });
  }

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
      let lang_id = localStorage.getItem('lang_id');
      formData.append('lang', lang_id + '');

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
          this.dialogRef.close({ uploaded: true, message: event.body.message }); // Close dialog on success
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

      // Show loading message
      const loadingToast = this.toastr.info('Uploading report...', 'Please wait', { disableTimeOut: true });

      this.talentService.uploadReport(formData).subscribe({
        next: (response) => {
          console.log('Upload successful:', response);

          // Close loading toaster, then show success message
          this.toastr.clear(loadingToast.toastId);
          this.toastr.success('Report uploaded successfully!', 'Success');

          this.dialogRef.close(true); // Close the dialog and return success
        },
        error: (error) => {
          console.error('Error uploading report:', error);

          // Close loading toaster, then show error message
          this.toastr.clear(loadingToast.toastId);
          this.toastr.error('Failed to upload report. Please try again.', 'Error');
        }
      });
    } else {
      this.toastr.warning('No file selected for upload.', 'Warning');
    }
  }

  getToasterMsg() {
    this.translate.get(['enterDocumentTitle', 'submittingPerformanceData', 'pleaseWait']).subscribe((res: any) => {
      this.enterDocumentTitle = res['enterDocumentTitle'];
      // this.submittingPerformanceData = res['submittingPerformanceData'];
      // this.pleaseWait = res['pleaseWait'];
      // this.downloading = res['downloading'];
    });
  }
}
