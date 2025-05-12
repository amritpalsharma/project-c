import { Component } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { BarController } from 'chart.js';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  userData: any = {};
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  contactNumber: string = '';
  address: string = '';
  city: string = '';
  state: string = '';
  zipcode: string = '';
  password: string = '';
  image: any = '';
  imageToUpload: any = '';
  imageLoading: boolean = false;
  profileData: any;
  error: string | null = null;
  inputFieldType: string = '';
  isReadonly: boolean = true;

  constructor(private userService: UserService, public dialog: MatDialog, private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.userService.getAdminProfile().subscribe((response) => {
      if (response && response.status) {

        this.userData = response.data.user_data;
        this.firstName = this.userData.first_name || '';
        this.lastName = this.userData.last_name || '';
        this.email = this.userData.username || '';
        this.contactNumber = this.userData.meta.contact_number || '';
        this.address = this.userData.meta.address || '';
        this.city = this.userData.meta.city || '';
        this.state = this.userData.meta.state || '';
        this.zipcode = this.userData.meta.zipcode || '';
        this.image = this.userData.meta.profile_image_path || '../../../assets/images/1.png';
        // this.isLoading = false;

      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let FileToUpload = input.files[0];
      this.imageToUpload = FileToUpload;
      let $this = this;
      let reader = new FileReader();
      reader.onload = function (fileData: any) {
        $this.image = fileData.target.result;
      };
      reader.readAsDataURL(FileToUpload);

      let formdata = new FormData();
      formdata.append("profile_image", this.imageToUpload);
      this.imageLoading = true;
      this.userService.updateAdminImage(formdata).subscribe((response) => {
        if (response && response.status) {
          // this.isLoading = false;
          this.imageLoading = false;
          let newImageUrl = environment.url + "uploads/" + response.data.uploaded_fileinfo;
          let localData: any = localStorage.getItem('userData');
          localData = JSON.parse(localData);
          localData.profile_image_path = newImageUrl;
          localData = JSON.stringify(localData);
          localStorage.setItem('userData', localData);
          this.userService.changeImageUrl(newImageUrl);
          this.showMatDialog("Profile image updated successfully!", 'display')
        } else {
          // this.isLoading = false;
          this.imageLoading = false;
          console.error('Invalid API response structure:', response);
          this.showMatDialog("Error in uploading image", 'display')
        }
      });
    }
  }

  updateAdminProfile() {

    const formdata = new FormData();
    formdata.append("user[first_name]", this.firstName);
    formdata.append("user[last_name]", this.lastName);
    formdata.append("user[contact_number]", this.contactNumber);
    formdata.append("user[address]", this.address);
    formdata.append("user[city]", this.city);
    formdata.append("user[zipcode]", this.zipcode);
    formdata.append("user[state]", this.state);
    formdata.append("user[password]", this.password);
    let lang_id = localStorage.getItem('lang_id') + '';
    formdata.append("lang", lang_id);
    if (this.imageToUpload != "") {
      formdata.append("user[profile_image]", this.imageToUpload);
    }

    this.userService.updateAdminProfile(formdata).subscribe((response) => {
      if (response && response.status) {
        // this.isLoading = false;
        if (response.message != '' && response.message != undefined) {
          this.showMatDialog(response.message, 'display')
        } else {
          this.showMatDialog("Profile updated successfully!", 'display')
        }
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });

  }

  deleteProfile() {
    this.showMatDialog2("", 'delete-representator-confirmation');
  }

  showMatDialog2(message: string, action: string) {
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
      if (result !== undefined && result.action === "delete-confirmed") {
        this.deleteProfileImage();
      }
    });
  }

  deleteProfileImage() {
    this.userService.deleteProfileImage().subscribe(
      response => {
        if (response.status) {
          this.image = '';

          let formdata = new FormData();
          formdata.append("profile_image", this.image);
          this.imageLoading = true;
          this.userService.updateAdminImage(formdata).subscribe((response) => {
            if (response && response.status) {
              // this.isLoading = false;
              this.imageLoading = false;
              let newImageUrl = environment.url + "uploads/" + response.data.uploaded_fileinfo;
              let localData: any = localStorage.getItem('userData');
              localData = JSON.parse(localData);
              localData.profile_image_path = newImageUrl;
              localData = JSON.stringify(localData);
              localStorage.setItem('userData', localData);
              this.userService.changeImageUrl(newImageUrl);
              // this.showMatDialog("Profile image updated successfully!", 'display')
            } else {
              // this.isLoading = false;
              this.imageLoading = false;
              console.error('Invalid API response structure:', response);
              this.showMatDialog("Error in uploading image", 'display')
            }
          });

          this.toastr.success(response.message);
        }
        else {
          this.toastr.error(response.error);
        }
      },
      error => {
        console.error('Error deleting user:', error);
        // this.toastr.error(this.generalError, this.errorTxt);
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
        //  console.log('Dialog result:', result);
      }
    });
  }

  toggleReadonly() {
    this.isReadonly = !this.isReadonly;
    // if (this.isReadonly === true) {
    // }
  }


}
