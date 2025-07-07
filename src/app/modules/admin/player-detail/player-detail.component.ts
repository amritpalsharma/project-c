import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { AdminHelperService } from '../../../services/admin-helper.service';
import { ImageCropperComponent2 } from '../../shared/image-cropper/image-cropper.component';
import { UserRoleService } from '../../../services/user-role.service';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.scss'
})
export class PlayerDetailComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private toaster: ToastrService,
    private location: Location,
    private adminHelper: AdminHelperService,
    public userRoleService: UserRoleService
  ) { }
  activeTab: string = 'profile';
  userId: any = {};
  user: any = {};
  currentUserID: number = 0;
  // userNationalities: any = [];
  coverImage: any = "";
  paginationData: any = {};
  userCountryFlag: string = '';
  deleteProfileConfirm: string = '';
  baseUrl: string = '';
  langSubscription!: Subscription;
  deleteProfileImageConfirm: string = '';

  currentLangId: any;
  customClubInfo: any;

  ngOnInit(): void {
    this.currentLangId = localStorage.getItem('lang_id');
    this.route.params.subscribe((params: any) => {
      console.log(params.id)
      this.userId = params.id;
      this.currentUserID = this.userId;
      this.getUserProfile(this.userId);
      this.activeTab = 'profile';
    });
    this.updateTranslation();
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // console.info(event);
      if (event.lang == 'en') {
        this.currentLangId = 1;
      } else if (event.lang == 'de') {
        this.currentLangId = 2;
      }
      this.updateTranslation();
      this.getUserProfile(this.userId);
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'purchases') {
        this.activeTab = fragment;
      }
    });
  }

  updateTranslation() {
    this.translate.get('deleteProfileConfirm').subscribe((res: string) => {
      this.deleteProfileConfirm = res;
    });
    this.translate.get('deleteProfilePhoto').subscribe((res: string) => {
      this.deleteProfileImageConfirm = res;
    });

  }
  getUserProfile(userId: any) {
    try {
      this.userService.getProfileDataAdmin(userId, this.currentLangId).subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {
          this.user = response.data.user_data;
          this.baseUrl = response.data.imagePath;
          this.userCountryFlag = JSON.parse(this.user.user_nationalities)[0].flag_path;
          this.paginationData = response.data.pagination;
          // this.userNationalities = JSON.parse(this.user.user_nationalities);
          if (this.user.meta && this.user.meta.cover_image_path) {
            this.coverImage = this.user.meta.cover_image_path;
          }

          if (this.user?.custom_club_info && this.user?.custom_club_info != '') {
            this.customClubInfo = JSON.parse(this.user.custom_club_info);
          }
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

  changeUserStatus(currentStatus: any) {
    let newStatus = 2;
    if (currentStatus == 2) {
      newStatus = 3;
    }
    if (currentStatus == 3) {
      newStatus = 3;
    }

    if (currentStatus == 2) {
      newStatus = 2;
    }

    if (currentStatus == 1) {
      newStatus = 1;
    }

    this.userService.updateUserStatus([this.userId], newStatus).subscribe(response => {
      this.user.status = newStatus;
      // this.showMatDialog('User status updated successfully!', 'display');
      if (response.message != '') {
        this.showMatDialog(response.message, 'display');
      }
    },
      error => {
        console.error('Error updating user status:', error);
        this.showMatDialog('Error updating user status. Please try again.', 'display');
      }
    );
  }

  showMatDialog(message: string, action: string) {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          this.deleteUser();
        }

        if (result.action == "delete-profile-confirmed") {
          this.deleteUserProfile();
        }

      }
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  confirmDeletion() {
    this.showMatDialog(this.deleteProfileConfirm, "delete-confirmation");
  }


  deleteUser() {
    let langId = localStorage.getItem('lang_id');
    this.userService.deleteUser([this.userId], langId).subscribe(
      response => {
        this.showMatDialog('User deleted successfully!', 'display');
        this.router.navigate(['/admin/users']);
      },
      error => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }

  handleCoverImageData(data: string) {
    this.coverImage = data; // Assign the received data to a variable
    console.log('Data received from child:', data);
  }

  handleRefreshAfterUpdate(data: any) {
    this.getUserProfile(this.userId);
  }

  onProfileImageChange(croppedImage: any) {
    try {
      // FileToUpload
      const blob = this.dataURItoBlob(croppedImage);
      const formData = new FormData();
      let lang_id = localStorage.getItem('lang_id');
      formData.append('profile_image', blob, 'cropped-image.png');
      formData.append('lang', lang_id + '');
      this.userService.uploadProfileImage(this.userId, formData).subscribe((response) => {
        if (response && response.status) {
          this.showMatDialog(response.message, 'display');
          this.getUserProfile(this.userId);
          // this.user.meta.profile_image_path = environment.url + "uploads/" + response.data.uploaded_fileinfo;
          // this.isLoading = false;
        } else {
          this.showMatDialog('Error in updating profile image!', 'display');
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error upload image:', error);
    }
  }

  onProfileFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      if (!selectedFile.type.startsWith('image/')) {
        // this.toastr.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const imageData = reader.result as string;

        const dialogRef = this.dialog.open(ImageCropperComponent2, {
          width: '500px',
          data: { imageUrl: imageData, action: 'profile_image' },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe((croppedImage) => {
          if (croppedImage) {
            console.log('Cropped Image:', croppedImage);
            this.onProfileImageChange(croppedImage);
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

  exportUser() {
    this.userService.exportSingleUser(this.userId).subscribe((response) => {
      if (response && response.status) {
        let fileUrl = response.data.file_path;
        let fileName = response.data.file_name;
        this.download(fileUrl, fileName);
        this.toaster.success(response.message);
      } else {
        this.userService.apiToasterError();
      }
    });
  }

  download(fileUrl: any, fileName: any) {
    // use the fetch/blob method because single download isn't working 
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert the response to a Blob object
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
  }

  paginate(type: any) {
    if (type == 'next') {
      let slug = this.getRoleById(this.paginationData.next.role);
      let id = this.paginationData.next.id;
      this.router.navigate(['admin/' + slug, id]);
    } else if (type == 'prev') {
      let slug = this.getRoleById(this.paginationData.prev.role);
      let id = this.paginationData.prev.id;
      this.router.navigate(['admin/' + slug, id]);
    }
  }

  getRoleById(roleId: any): any {
    if (roleId == "2") {
      return 'club';
    } else if (roleId == "3") {
      return 'scout';
    } else if (roleId == "4") {
      return 'player';
    }
  }

  goToBack() {
    this.location.back();
  }

  formatDateTime(datetime: string) {
    // convertAdminDateTime
    // let formattedDate = this.adminHelper.convertAdminDateTime(datetime, 'users');
    if (datetime && datetime != '') {
      let formattedDate = this.adminHelper.getSwitzerlandTime(datetime);
      return formattedDate;
    }
    return;
  }

  deleteImageConfirm() {
    this.showMatDialog(this.deleteProfileImageConfirm, "delete-profile-confirmation");
  }

  deleteUserProfile() {
    // let langId = localStorage.getItem('lang_id');
    this.userService.deleteProfileImageAdmin(this.currentUserID).subscribe(
      response => {
        this.showMatDialog(response.message, 'display');
        this.getUserProfile(this.currentUserID);
        // this.router.navigate(['/admin/users']);
      },
      error => {
        console.error('Error deleting user:', error);
        // this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }

  // Helper function to convert base64 to Blob
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
}
