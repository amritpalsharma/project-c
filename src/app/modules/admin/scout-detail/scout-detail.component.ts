import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { InviteScoutTalentPopupComponent } from '../tabs/invite-scout-talent-popup/invite-scout-talent-popup.component';
import { environment } from '../../../../environments/environment';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TitleService } from '../../../title.service';
import { SharedService } from '../../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageCropperComponent2 } from '../../shared/image-cropper/image-cropper.component';
import { AdminHelperService } from '../../../services/admin-helper.service';
import { UserRoleService } from '../../../services/user-role.service';


@Component({
  selector: 'app-scout-detail',
  templateUrl: './scout-detail.component.html',
  styleUrl: './scout-detail.component.scss'
})

export class ScoutDetailComponent implements OnInit {

  constructor(
    public userRoleService: UserRoleService,
    private route: ActivatedRoute,
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService,
    private sharedservice: SharedService,
    private toaster: ToastrService,
    private location: Location,
    private adminHelper: AdminHelperService
  ) { }
  activeTab: string = 'profile';
  userId: any = {};
  user: any = {};
  baseUrl: string = '';
  // userNationalities: any = [];
  coverImage: any = "";
  paginationData: any = {};
  pageTitle: string = '';
  userDeleteConfirm: string = '';
  langSubscription!: Subscription;
  deleteProfileImageConfirm: string = '';
  currentLangId: any = localStorage.getItem('lang_id');
  profileImageLoading: boolean = true;
  ngOnInit(): void {
    this.getJsonTranslations();
    this.sharedservice.data$.subscribe((data: any) => {
      if (data.action == 'lang_updated') {
        this.getJsonTranslations();
      }
    });
    this.route.params.subscribe((params: any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserProfile(this.userId);
      this.activeTab = 'profile';
    });

    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // console.info(event);
      if (event.lang == 'en') {
        this.currentLangId = 1;
      } else if (event.lang == 'de') {
        this.currentLangId = 2;
      }
      this.getUserProfile(this.userId);
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'purchases') {
        this.activeTab = fragment;
      }
    });
  }

  getUserProfile(userId: any) {
    this.profileImageLoading = true;
    try {
      this.userService.getProfileDataAdmin(userId, this.currentLangId).subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {
          this.user = response.data.user_data;
          this.baseUrl = response.data.imagePath;
          this.paginationData = response.data.pagination;
          // this.userNationalities = JSON.parse(this.user.user_nationalities);
          if (this.user.meta && this.user.meta.cover_image_path) {
            this.coverImage = this.user.meta.cover_image_path;
          }
          // this.profileImageLoading = false;
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.profileImageLoading = false;
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  changeUserStatus(currentStatus: any) {
    // let newStatus = 2;
    // if (currentStatus == 2) {
    //   newStatus = 3;
    // }
    let newStatus = currentStatus;
    this.userService.updateUserStatus([this.userId], newStatus).subscribe(response => {
      this.user.status = newStatus;
      if (response.message != '' && response.message != undefined) {
        this.showMatDialog(response.message, 'display');
      } else {
        // this.showMatDialog('User status updated successfully!', 'display');
        this.toaster.success(response.message);
      }
    },
      error => {
        this.toaster.error('Fehler bei der Aktualisierung des Benutzerstatus. Bitte versuchen Sie es erneut.');
        console.error('Error updating user status:', error);
        // this.showMatDialog('Error updating user status. Please try again.', 'display');
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
        //  console.log('Dialog result:', result);
      }
    });
  }



  switchTab(tab: string) {
    this.activeTab = tab;
  }

  confirmDeletion() {
    this.showMatDialog(this.userDeleteConfirm, "delete-confirmation");
  }


  deleteUser() {
    let langId = localStorage.getItem('lang_id');
    this.userService.deleteUser([this.userId], langId).subscribe(
      response => {
        if (response.message != '' && response.message != undefined) {
          this.showMatDialog(response.message, 'display');
        } else {
          this.showMatDialog('User deleted successfully!', 'display');
        }
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



  exportUser() {
    this.userService.exportSingleUser(this.userId).subscribe((response) => {
      if (response && response.status) {
        let fileUrl = response.data.file_path;
        let fileName = response.data.file_name;
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
      if (slug == 'no_route_found') {
        this.router.navigate(['admin/users']);
      } else {
        this.router.navigate(['admin/' + slug, id]);
      }
    } else if (type == 'prev') {
      let slug = this.getRoleById(this.paginationData.prev.role);
      let id = this.paginationData.prev.id;
      if (slug == 'no_route_found') {
        this.router.navigate(['admin/users']);
      } else {
        this.router.navigate(['admin/' + slug, id]);
      }
    }
  }

  getRoleById(roleId: any): any {
    if (roleId == "2") {
      return 'club';
    } else if (roleId == "3") {
      return 'scout';
    } else if (roleId == "4") {
      return 'player';
    } else if (roleId == "5") {
      return 'admin';
    } else if (roleId == "6") {
      return 'club';
    } else if (roleId == "7") {
      return 'scout';
    }
    else {
      return 'no_route_found';
    }
  }

  inviteTalent() {
    const inviteDialog = this.dialog.open(InviteScoutTalentPopupComponent, {
      width: '600px',
      height: '450px',
      position: {
        top: '70px'
      },
      data: {
        scoutId: this.userId
      }
    })

    inviteDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result)
        if (result.action == "added") {
          if (result.message != '' && result.message != undefined) {
            // this.showMatDialog(result.message, 'display')
            this.toaster.success(result.message)
          } else {
            this.toaster.success("Spieler erfolgreich eingeladen")
            // this.showMatDialog("Players invited successfully", 'display')
          }
          // this.activeTab = 'profile';

          // this.activeTab = 'portfolio';
          // this.switchTab('portfolio');
          // this.viewSight(result.id);

        }
        console.log('Dialog result:', result);
      }
    });
  }

  getJsonTranslations() {
    this.translateService.get(['dashboard', 'confirmDeleteinformation', 'deleteProfilePhoto']).subscribe((translations) => {
      this.pageTitle = translations['dashboard'];
      this.userDeleteConfirm = translations['confirmDeleteinformation'];
      this.deleteProfileImageConfirm = translations['deleteProfilePhoto'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

  goToBack() {
    this.location.back();
  }

  formatDateTime(datetime: string) {
    // convertAdminDateTime
    // let formattedDate = this.adminHelper.convertAdminDateTime(datetime, 'users');
    let formattedDate = this.adminHelper.getSwitzerlandTime(datetime);
    return formattedDate;
  }
  deleteImageConfirm() {
    this.showMatDialog(this.deleteProfileImageConfirm, "delete-profile-confirmation");
  }

  deleteUserProfile() {
    // let langId = localStorage.getItem('lang_id');
    this.userService.deleteProfileImageAdmin(this.userId).subscribe(
      response => {
        // this.showMatDialog(response.message, 'display');
        this.toaster.success(response.message)
        this.getUserProfile(this.userId);
        // this.router.navigate(['/admin/users']);
      },
      error => {
        console.error('Error deleting user:', error);
        // this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
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
          // this.showMatDialog(response.message, 'display');
          this.toaster.success(response.message)
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
