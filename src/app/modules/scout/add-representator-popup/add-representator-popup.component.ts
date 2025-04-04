import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ScoutService } from '../../../services/scout.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'scout-add-representator-popup',
  templateUrl: './add-representator-popup.component.html',
  styleUrl: './add-representator-popup.component.scss'
})

export class AddRepresentatorPopupComponent {

  userId: any = ""
  email: any = "";
  // firstName:any = "";
  // lastName:any = "";
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
    private scoutService: ScoutService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<AddRepresentatorPopupComponent>,
    private translateService: TranslateService,
    public webPages: WebPages,
    public toaster: ToastrService,
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
    }
    if (this.lastName == "") {
      this.error = true;
      this.errorMsg.lastName = this.lastNameRequired;
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

    let verification_link = window.location.origin + '/home';

    let params: any = {}
    params.email = this.email;
    params.first_name = this.firstName;
    params.last_name = this.lastName;
    params.site_role = this.role;
    params.verification_link = verification_link;
    params.lang = localStorage.getItem('lang_id');
    this.scoutService.sendInviteToRepresentator(this.userId, params).subscribe((response) => {
      if (response && response.status == true) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else {
        // console.error('Invalid API response structure:', response);
        let apiErrors = response.message;
        console.log(apiErrors);
        this.errorMsg = {}; // Reset errors before mapping new ones
        if (apiErrors.email != '' && apiErrors.email != undefined) {
          this.errorMsg.email = apiErrors.email; // Assuming API sends an array of errors
        }
        if (apiErrors.site_role) {
          this.errorMsg.role = apiErrors.site_role;
        }
        if (apiErrors != '' && apiErrors != undefined) {
          if (apiErrors.email != '' && apiErrors.email != undefined) {
            this.toaster.error(apiErrors.email);
          }
          if (apiErrors.first_name != '' && apiErrors.first_name != undefined) {
            this.toaster.error(apiErrors.first_name);
          }
          if (apiErrors.last_name != '' && apiErrors.last_name != undefined) {
            this.toaster.error(apiErrors.last_name);
          }
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

    // formdata.append("user[first_name]", this.firstName);
    // formdata.append("user[last_name]", this.lastName);
    // formdata.append("user[designation]", this.designation);

    let langId: any = localStorage.getItem('lang_id');

    formdata.append("first_name", this.firstName);
    formdata.append("last_name", this.lastName);
    formdata.append("designation", this.designation);
    formdata.append("lang", langId);

    this.scoutService.updateRepresentator(this.idToUpdate, formdata).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'updated',
          message: response.message
        });
      } else {
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
      this.emailRequired = translations['emailRequired'];
      this.provideEmailAddress = translations['provideEmailAddress'];
      this.roleIsRequired = translations['roleIsRequired'];
      this.firstNameRequired = translations['firstNameRequired'];
      this.lastNameRequired = translations['lastNameRequired'];
    });
  }
}
