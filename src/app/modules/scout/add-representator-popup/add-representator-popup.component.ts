import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ScoutService } from '../../../services/scout.service';


@Component({
  selector: 'scout-add-representator-popup',
  templateUrl: './add-representator-popup.component.html',
  styleUrl: './add-representator-popup.component.scss'
})

export class AddRepresentatorPopupComponent {

  userId:any = ""
  email:any = "";
  role:any = "";

  firstName:any = "";
  lastName:any = "";
  designation:any = "";
  idToUpdate:any = "";
  error:boolean = false
  errorMsg:any = {}

  constructor(private scoutService: ScoutService,private route: ActivatedRoute, public dialogRef : MatDialogRef<AddRepresentatorPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    
      this.userId = data.userId;

      if(data.action == "edit"){
        this.idToUpdate = data.representator.id; 
        if(data.representator.first_name){
          this.firstName = data.representator.first_name;
        }
        if(data.representator.last_name){
          this.lastName = data.representator.last_name;
        }
        this.designation = this.getMetaValue(data.representator?.meta, 'designation');
      }
  }

  
  getMetaValue(stringifyData:any, key:any):any{
    console.log(stringifyData)
    if(stringifyData){
      stringifyData = JSON.parse(stringifyData);
      if(stringifyData[key]){
        return stringifyData[key];
      }else{
        return "";
      }
    }else{
      return "";
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  validateInviteForm(){

    this.error = false;
    this.errorMsg = {};
    
    if(this.email == ""){
      this.error = true;
      this.errorMsg.email = "Email is required";
    }else if(!this.validEmail(this.email)){
      this.error = true;
      this.errorMsg.email = "Enter valid email";
    }
    if(this.role == ""){
      this.error = true;
      this.errorMsg.role = "Role is required";
    }
    return this.error;
  }

  validateUpdateForm(){

    this.error = false;
    this.errorMsg = {};
    
    if(this.firstName == ""){
      this.error = true;
      this.errorMsg.firstName = "First name is required";
    }
    if(this.lastName == ""){
      this.error = true;
      this.errorMsg.lastName = "Last name is required";
    }
    return this.error;

  }

  validEmail(email:any) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  sendInvite():any {

    let validForm:any = this.validateInviteForm();
    if(validForm){
      return false;
    }

    let params:any = {}
    params.email = this.email;
    params.site_role = this.role;
    params.lang = localStorage.getItem('lang_id');
    this.scoutService.sendInviteToRepresentator(this.userId, params).subscribe((response)=>{
      if (response && response.status == true) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else {
        // console.error('Invalid API response structure:', response);
        let apiErrors = response.message;
        this.errorMsg = {}; // Reset errors before mapping new ones
        if (apiErrors.email) {
          this.errorMsg.email = apiErrors.email; // Assuming API sends an array of errors
        }
        if (apiErrors.site_role) {
          this.errorMsg.role = apiErrors.site_role;
        }
      }
    });

  }

  updateRepresentator():any{

    let validForm:any = this.validateUpdateForm();
    if(validForm){
      return false;
    }

    let formdata = new FormData();

    formdata.append("user[first_name]", this.firstName);
    formdata.append("user[last_name]", this.lastName);
    formdata.append("user[designation]", this.designation);

    this.scoutService.updateRepresentator(this.idToUpdate, formdata).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'updated'
        });
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

}
