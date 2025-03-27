import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';


@Component({
  selector: 'app-add-representator-popup',
  templateUrl: './add-representator-popup.component.html',
  styleUrl: './add-representator-popup.component.scss'
})
export class AddRepresentatorPopupComponent {

  userId: any = ""
  email: any = "";
  role: any = "";

  firstName: any = "";
  lastName: any = "";
  designation: any = "";
  idToUpdate: any = "";
  error: boolean = false
  errorMsg: any = {}

  emailRequired: string = '';
  provideEmailAddress: string = '';
  roleIsRequired: string = '';
  firstNameRequired: string = '';
  lastNameRequired: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<AddRepresentatorPopupComponent>,
    public toaster: ToastrService,
    private translateService: TranslateService,
    public webPages: WebPages,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.userId = data.userId;

    if (data.action == "edit") {
      this.idToUpdate = data.representator.id;
      if (data.representator.first_name) {
        this.firstName = data.representator.first_name;
      }
      if (data.representator.last_name) {
        this.lastName = data.representator.last_name;
      }
      this.designation = this.getMetaValue(data.representator?.meta, 'designation');
    }
  }

  async ngOnInit() {
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
  }


  getMetaValue(stringifyData: any, key: any): any {
    console.log(stringifyData)
    if (stringifyData) {
      stringifyData = JSON.parse(stringifyData);
      if (stringifyData[key]) {
        return stringifyData[key];
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
  close(): void {
    this.dialogRef.close();
  }

  // validateInviteForm() {

  //   this.error = false;
  //   this.errorMsg = {};

  //   if (this.email == "") {
  //     this.error = true;
  //     this.errorMsg.email = "Email is required";
  //   } else if (!this.validEmail(this.email)) {
  //     this.error = true;
  //     this.errorMsg.email = "Enter valid email";
  //   }
  //   if (this.role == "") {
  //     this.error = true;
  //     this.errorMsg.role = "Role is required";
  //   }
  //   return this.error;
  // }

  // validateUpdateForm() {

  //   this.error = false;
  //   this.errorMsg = {};

  //   if (this.firstName == "") {
  //     this.error = true;
  //     this.errorMsg.firstName = "First name is required";
  //   }
  //   if (this.lastName == "") {
  //     this.error = true;
  //     this.errorMsg.lastName = "Last name is required";
  //   }
  //   return this.error;

  // }

  validateInviteForm() {

    this.error = false;
    this.errorMsg = {};

    if (this.email == "") {
      this.error = true;
      this.errorMsg.email = this.emailRequired;
      // emailRequired
    } else if (!this.validEmail(this.email)) {
      this.error = true;
      this.errorMsg.email = this.provideEmailAddress;
      //provideEmailAddress
    }
    if (this.role == "") {
      this.error = true;
      this.errorMsg.role = this.roleIsRequired;
      //roleIsRequired
    }
    return this.error;
  }

  validateUpdateForm() {

    this.error = false;
    this.errorMsg = {};

    if (this.firstName == "") {
      this.error = true;
      this.errorMsg.firstName = this.firstNameRequired;
      //firstNameRequired
    }
    if (this.lastName == "") {
      this.error = true;
      this.errorMsg.lastName = this.lastNameRequired;
      ////lastNameRequired
    }
    return this.error;

  }

  validEmail(email: any) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  sendInvite(): any {

    let validForm: any = this.validateInviteForm();
    if (validForm) {
      return false;
    }

    let params: any = {}
    if (this.firstName != "") {
      params.first_name = this.firstName;
    }
    if (this.lastName != "") {
      params.last_name = this.lastName;
    }
    params.email = this.email;
    params.site_role = this.role;
    let lang_id = localStorage.getItem('lang_id');
    params.lang = lang_id;
    this.userService.sendInviteToRepresentator(this.userId, params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else {
        // console.error('Invalid API response structure:', response);
        if (response.message.last_name != '' && response.message.last_name != undefined) {
          this.toaster.error(response.message.last_name);
        } else if (response.message.first_name != '' && response.message.first_name != undefined) {
          this.toaster.error(response.message.first_name);
        } else if (response.message.email != '' && response.message.email != undefined) {
          this.toaster.error(response.message.email);
        }

      }
    });
  }

  updateRepresentator(): any {

    let validForm: any = this.validateUpdateForm();
    if (validForm) {
      return false;
    }

    let formdata = new FormData();

    formdata.append("user[first_name]", this.firstName);
    formdata.append("user[last_name]", this.lastName);
    formdata.append("user[designation]", this.designation);
    let lang_id = localStorage.getItem('lang_id');
    formdata.append("lang", lang_id + '');
    this.userService.updateRepresentator(this.idToUpdate, formdata).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'updated',
          message: response.message
        });
      } else {

      }
    });
  }

  sendAdminInvite(): any {

    let validForm: any = this.validateInviteForm();
    if (validForm) {
      return false;
    }

    let params: any = {}
    params.email = this.email;
    params.site_role = this.role;
    params.first_name = this.firstName;
    params.last_name = this.lastName;
    let lang_id = localStorage.getItem('lang_id');
    params.lang = lang_id;
    this.userService.sendInviteToAdminRepresentator(params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else {
        if (response.message.last_name != '' && response.message.last_name != undefined) {
          this.toaster.error(response.message.last_name);
        } else if (response.message.first_name != '' && response.message.first_name != undefined) {
          this.toaster.error(response.message.first_name);
        } else if (response.message.email != '' && response.message.email != undefined) {
          this.toaster.error(response.message.email);
        }
        console.error('Invalid API response structure:', response);
      }
    });
  }

  getToasterMsg() {
    this.translateService.get([
      'emailRequired',
      'provideEmailAddress',
      'roleIsRequired',
      'firstNameRequired',
      'lastNameRequired',
    ]).subscribe((translations) => {
      console.warn('translations', translations);
      this.emailRequired = translations['emailRequired'];
      this.provideEmailAddress = translations['provideEmailAddress'];
      this.roleIsRequired = translations['roleIsRequired'];
      this.firstNameRequired = translations['firstNameRequired'];
      this.lastNameRequired = translations['lastNameRequired'];
    });
  }
}
