import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';
import { TemplateService } from '../../../../services/template.service';
@Component({
  selector: 'app-templates',
  templateUrl: './template-popup.component.html',
  styleUrl: './template-popup.component.scss'
})
export class TemplatePopupComponent  implements OnInit, OnDestroy  {
  // id = 0;
  editor!: Editor;
  title:string = "";
  selectedRole:any = 0;
  selectedLang:any = 1;
  selectedLocation:any = 1;
  roles:any = [];
  langs:any = [];
  locations:any = [];
  templateIdToEdit: any = '';
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  colorPresets :any = environment.colors;

  content: string = '';
  isLoading:boolean = false
  error:boolean = false
  errorMsg:any = {}
  type: string = "";
  subject: string = "";

  constructor(    
    public dialogRef: MatDialogRef<TemplatePopupComponent>, private tempalateApi: TemplateService,
    @Inject(MAT_DIALOG_DATA) public template: any
  ) {
    if(template){
      this.getTemplates(template.id)
    }

    let envRoles:any = environment.roles;
    
    this.roles = envRoles;
    this.langs = environment.langs;
    this.locations = environment.domains;
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  close(): void {
   console.log(this.editor);
    this.dialogRef.close({
    });
  }
  
  remove(): void {
    this.dialogRef.close({
      action:'remove'
    });
  }

  validateForm(){

    this.error = false;
    this.errorMsg = {};
    
    if(this.title == ""){
      this.error = true;
      this.errorMsg.title = "Title is required";
    }
    if(this.content == "" || this.content == "<p></p>"){
      this.error = true;
      this.errorMsg.content = "Content is required";
    }
    if(this.type == ""){
      this.error = true;
      this.errorMsg.type = "Type is required";
    }
    if(this.subject == ""){
      this.error = true;
      this.errorMsg.subject = "Subject is required";
    }
    return this.error;
  }

  
  async getTemplates(id:any): Promise<void> {
    this.isLoading = true;

    try {
      this.isLoading = true;
      this.tempalateApi.getTemplateById(id).subscribe((response)=>{
      if (response && response.status && response.data && response.data.emailTemplate) {
        
        this.template = response.data.emailTemplate;
        // console.log(this.template)
        this.templateIdToEdit = this.template.id;
        this.title = this.template.title;
        this.content = this.template.content;
        this.selectedRole = Number(this.template.email_for);
        this.selectedLang = Number(this.template.language);
        this.selectedLocation = Number(this.template.location);
        
        this.type = this.template.type;
        this.subject = this.template.subject
        this.isLoading = false;
      } else {
        this.template = [];
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  createTemplate():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }
   
    let params:any = {}
    params.title = this.title;
    params.content = this.content;
    params.email_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.type = this.type;
    params.subject = this.subject;
    params.status  = 1; // 1 for active, 2 for inactive    
    
    this.tempalateApi.addEmailTemplate(params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'templateAdded'
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }

  updateTemplate():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }

    let params:any = {}

    params.title = this.title;
    params.content = this.content;
    params.email_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.status  = 1; // 1 for active, 2 for inactive
    params.subject = this.subject;
    params.type = this.type;
    
    this.tempalateApi.updateEmailTemplate(this.templateIdToEdit, params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'templateUpdated'
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }

}
