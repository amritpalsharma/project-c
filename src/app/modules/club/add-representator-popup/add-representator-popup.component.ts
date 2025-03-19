import { Component, Inject } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../services/club.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';


@Component({
  selector: 'scout-add-representator-popup',
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
    private clubService: ClubService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<AddRepresentatorPopupComponent>,
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
    params.email = this.email;
    params.site_role = this.role;
    params.first_name = this.firstName;
    params.last_name = this.lastName;
    params.designation = this.designation;
    params.lang = localStorage.getItem('lang_id');


    this.clubService.sendInviteToRepresentator(this.userId, params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  updateRepresentator(): any {

    let validForm: any = this.validateUpdateForm();
    if (validForm) {
      return false;
    }

    let formdata = new FormData();
    let lang = localStorage.getItem('lang_id');
    formdata.append("user[first_name]", this.firstName);
    formdata.append("user[last_name]", this.lastName);
    formdata.append("user[designation]", this.designation);
    formdata.append("user[lang]", lang + '');

    this.clubService.updateRepresentator(this.idToUpdate, formdata).subscribe((response) => {
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

  sendAdminInvite(): any {

    let validForm: any = this.validateInviteForm();
    if (validForm) {
      return false;
    }

    let params: any = {}
    params.email = this.email;
    params.site_role = this.role;
    this.clubService.sendInviteToRepresentator(this.userId, params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added'
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
