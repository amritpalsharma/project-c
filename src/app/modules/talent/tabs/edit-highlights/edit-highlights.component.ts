import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../services/talent.service';
import { UploadPopupComponent } from '../../upload-popup/upload-popup.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../services/webpages.service';

@Component({
  selector: 'app-edit-highlights',
  templateUrl: './edit-highlights.component.html',
  styleUrls: ['./edit-highlights.component.scss']
})
export class EditHighlightsComponent {

  images: any = [];
  videos: any = [];
  url: string = '';
  maxUploads: number = 6; // Limit the number of uploads
  selectedImageIds: number[] = [];
  selectedVideoIds: number[] = [];
  totalSelected: number = 0; // Track total selected files
  loggedInUser: any = localStorage.getItem('userData');
  userId: any;
  isLoading: boolean = false;
  successTxt: string = '';
  errorTxt: string = '';
  Processing: string = '';
  pleaseWait: string = '';

  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditHighlightsComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,
    private translateService: TranslateService,
    public webPages: WebPages,
  ) { }

  theme: any = localStorage.getItem('theme');

  ngOnInit(): void {

    this.theme = localStorage.getItem('theme');

    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.userId = this.loggedInUser.id;
    this.images = this.data.images || [];
    this.videos = this.data.videos || [];
    this.url = this.data.url || '';

    this.getGalleryData();
    this.getJsonTranslations();
    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    });
  }

  getGalleryData() {
    try {
      this.talentService.getGalleryData().subscribe((response) => {
        if (response && response.status && response.data) {
          this.images = response.data.images;
          this.videos = response.data.videos;
          this.url = response.data.file_path;
          this.setFeaturedData();
        } else {
          console.error('Invalid API response structure:', response);
        }

      });
    } catch (error) {
      console.error('Error fetching users:', error);

    }
  }

  setFeaturedData() {
    // Preselect images that are already featured
    this.images.forEach((image: any) => {
      if (image.is_featured != 0) {
        this.selectedImageIds.push(image.id);
        this.totalSelected++; // Increment total selected count
      }
    });

    // Preselect videos that are already featured
    this.videos.forEach((video: any) => {
      if (video.is_featured != 0) {
        this.selectedVideoIds.push(video.id);
        this.totalSelected++; // Increment total selected count
      }
    });
  }

  // Called when an image checkbox is toggled
  onImageSelect(event: Event, imageId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked && this.totalSelected >= this.maxUploads) {
      let lang_id = localStorage.getItem('lang_id');
      let message = '';

      if (lang_id == '1') {
        // English
        message = `You can only select a maximum of ${this.maxUploads} files.`;
      } else if (lang_id == '2') {
        // German (Deutsch)
        message = `Sie können maximal ${this.maxUploads} Dateien auswählen.`;
      } else if (lang_id == '3') {
        // Italian (Italiano)
        message = `Puoi selezionare al massimo ${this.maxUploads} file.`;
      } else if (lang_id == '4') {
        // French (Français)
        message = `Vous ne pouvez sélectionner que ${this.maxUploads} fichiers au maximum.`;
      } else if (lang_id == '5') {
        // Spanish (Español)
        message = `Solo puedes seleccionar un máximo de ${this.maxUploads} archivos.`;
      } else if (lang_id == '6') {
        // Portuguese (Português)
        message = `Você só pode selecionar no máximo ${this.maxUploads} arquivos.`;
      } else if (lang_id == '7') {
        // Danish (Dansk)
        message = `Du kan kun vælge maksimalt ${this.maxUploads} filer.`;
      } else if (lang_id == '8') {
        // Swedish (Svenska)
        message = `Du kan bara välja maximalt ${this.maxUploads} filer.`;
      } else {
        // Default fallback (English)
        message = `You can only select a maximum of ${this.maxUploads} files.`;
      }
      if (message != '') {
        alert(message);
      }
      (event.target as HTMLInputElement).checked = false; // Deselect the checkbox
      return;
    }

    if (isChecked) {
      this.selectedImageIds.push(imageId);
      this.totalSelected++; // Increment total selected count
    } else {
      this.selectedImageIds = this.selectedImageIds.filter(id => id !== imageId);
      this.totalSelected--; // Decrement total selected count
    }
  }

  // Called when a video checkbox is toggled
  onVideoSelect(event: Event, videoId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked && this.totalSelected >= this.maxUploads) {
      // alert(`You can only select a maximum of ${this.maxUploads} files.`);
      let lang_id = localStorage.getItem('lang_id');
      let message = '';

      if (lang_id == '1') {
        // English
        message = `You can only select a maximum of ${this.maxUploads} files.`;
      } else if (lang_id == '2') {
        // German (Deutsch)
        message = `Sie können maximal ${this.maxUploads} Dateien auswählen.`;
      } else if (lang_id == '3') {
        // Italian (Italiano)
        message = `Puoi selezionare al massimo ${this.maxUploads} file.`;
      } else if (lang_id == '4') {
        // French (Français)
        message = `Vous ne pouvez sélectionner que ${this.maxUploads} fichiers au maximum.`;
      } else if (lang_id == '5') {
        // Spanish (Español)
        message = `Solo puedes seleccionar un máximo de ${this.maxUploads} archivos.`;
      } else if (lang_id == '6') {
        // Portuguese (Português)
        message = `Você só pode selecionar no máximo ${this.maxUploads} arquivos.`;
      } else if (lang_id == '7') {
        // Danish (Dansk)
        message = `Du kan kun vælge maksimalt ${this.maxUploads} filer.`;
      } else if (lang_id == '8') {
        // Swedish (Svenska)
        message = `Du kan bara välja maximalt ${this.maxUploads} filer.`;
      } else {
        // Default fallback (English)
        message = `You can only select a maximum of ${this.maxUploads} files.`;
      }
      if (message != '') {
        alert(message);
      }
      (event.target as HTMLInputElement).checked = false; // Deselect the checkbox
      return;
    }

    if (isChecked) {
      this.selectedVideoIds.push(videoId);
      this.totalSelected++; // Increment total selected count
    } else {
      this.selectedVideoIds = this.selectedVideoIds.filter(id => id !== videoId);
      this.totalSelected--; // Decrement total selected count
    }
  }


  videoDuration: string = '';
  videoThumbnail: string = '';

  // setDuration(duration: number) {
  //   this.videoDuration = this.formatDuration(duration);
  // }

  setDurationAndThumbnail(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
    // Set Duration
    this.videoDuration = this.formatDuration(videoElement.duration);

  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}.${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`;
    } else {
      return `${minutes}.${String(seconds).padStart(2, '0')}`;
    }
  }

  close() {
    this.dialogRef.close({
      videoDuration: this.videoDuration
    })
  }

  // Called when the save button is clicked
  onSubmit(): void {
    const selectedData = [...this.selectedImageIds, ...this.selectedVideoIds];

    let unset_all: any = false;

    if (selectedData.length == 0) {
      unset_all = true;
    }

    // Show loading notification
    const loadingToast = this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });

    // Send the selected IDs to your API or handle them as needed
    this.talentService.toggleFeaturedFiles(selectedData, unset_all).subscribe({
      next: (response) => {
        this.toastr.clear(loadingToast.toastId); // Clear loading notification
        if (response.message != '' && response.message != undefined) {
          this.toastr.success(response.message, this.successTxt); // Show success notification
        } else {
          this.toastr.success('Files saved successfully!', 'Success'); // Show success notification
        }
        this.close(); // Close the dialog if needed
      },
      error: (error) => {
        this.toastr.clear(loadingToast.toastId); // Clear loading notification
        this.toastr.error('Failed to save files. Please try again.', 'Error'); // Show error notification
        console.error('Error saving files:', error);
      }
    });
  }

  // Handle file input change (Photos or Videos)
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      if (this.totalSelected + files.length > this.maxUploads) {
        // this.toastr.warning(`You can only upload a maximum of ${this.maxUploads} files.`, 'Upload Limit Exceeded');
        let lang_id = localStorage.getItem('lang_id');
        let message = '';

        if (lang_id == '1') {
          // English
          message = `You can only select a maximum of ${this.maxUploads} files.`;
        } else if (lang_id == '2') {
          // German (Deutsch)
          message = `Sie können maximal ${this.maxUploads} Dateien auswählen.`;
        } else if (lang_id == '3') {
          // Italian (Italiano)
          message = `Puoi selezionare al massimo ${this.maxUploads} file.`;
        } else if (lang_id == '4') {
          // French (Français)
          message = `Vous ne pouvez sélectionner que ${this.maxUploads} fichiers au maximum.`;
        } else if (lang_id == '5') {
          // Spanish (Español)
          message = `Solo puedes seleccionar un máximo de ${this.maxUploads} archivos.`;
        } else if (lang_id == '6') {
          // Portuguese (Português)
          message = `Você só pode selecionar no máximo ${this.maxUploads} arquivos.`;
        } else if (lang_id == '7') {
          // Danish (Dansk)
          message = `Du kan kun vælge maksimalt ${this.maxUploads} filer.`;
        } else if (lang_id == '8') {
          // Swedish (Svenska)
          message = `Du kan bara välja maximalt ${this.maxUploads} filer.`;
        } else {
          // Default fallback (English)
          message = `You can only select a maximum of ${this.maxUploads} files.`;
        }
        if (message != '') {
          alert(message);
        }
        return;
      }

      files.forEach((file: File) => {
        const fileType = file.type.split('/')[0]; // Detect if it's an image or video
        const reader = new FileReader();

        reader.onload = (e: any) => {
          const uploadedFile = { full_name: e.target.result, selected: true, file };

          if (fileType === 'image' && this.images.length < this.maxUploads) {
            this.images.push(uploadedFile);
            this.totalSelected++; // Increment total selected count
          } else if (fileType === 'video' && this.videos.length < this.maxUploads) {
            this.videos.push(uploadedFile);
            this.totalSelected++; // Increment total selected count
          }
        };

        reader.readAsDataURL(file);
      });

      //this.toastr.success(`${files.length} file(s) added successfully.`, 'Files Uploaded');
    }
  }

  addPhotosPopup() {
    const messageDialog = this.dialog.open(UploadPopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        userId: this.userId
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.files.length) {
          this.getGalleryData()
        }
      }
    });
  }

  getJsonTranslations() {
    this.translateService.get(['success!', 'error', 'nationalityRequired', 'dobRequired', 'dominantFootRequired', 'Processing', 'pleaseWait']).subscribe((translations) => {
      this.successTxt = translations['success!'];
      this.errorTxt = translations['error'];
      // this.nationalityRequired = translations['nationalityRequired'];
      // this.dobRequired = translations['dobRequired'];
      // this.dominantFootRequired = translations['dominantFootRequired'];
      this.Processing = translations['Processing'];
      this.pleaseWait = translations['pleaseWait'];
      console.log('Title fetch Function Fired');
    })
  }
}
