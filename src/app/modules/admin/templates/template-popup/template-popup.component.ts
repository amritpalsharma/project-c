import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';
import { TemplateService } from '../../../../services/template.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../services/webpages.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-templates',
  templateUrl: './template-popup.component.html',
  styleUrl: './template-popup.component.scss'
})
export class TemplatePopupComponent implements OnInit, OnDestroy {
  // id = 0;
  editor!: Editor;
  title: string = "";
  selectedRole: any = 0;
  selectedLang: any = 1;
  selectedLocation: any = 1;
  roles: any = [];
  langs: any = [];
  locations: any = [];
  templateIdToEdit: any = '';
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  colorPresets: any = environment.colors;

  content: string = '';
  isLoading: boolean = false
  error: boolean = false
  errorMsg: any = {}
  type: string = "";
  subject: string = "";


  titleRequired: string = '';
  typeRequired: string = '';
  contentRequired: string = '';
  subjectRequired: string = '';

  constructor(
    public dialogRef: MatDialogRef<TemplatePopupComponent>, private tempalateApi: TemplateService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private webPages: WebPages,

    @Inject(MAT_DIALOG_DATA) public template: any
  ) {
    if (template) {
      this.getTemplates(template.id)
    }

    let envRoles: any = environment.roles;

    this.roles = envRoles;


    this.langs = environment.langs;
    this.locations = environment.domains;
  }

  ngOnInit(): void {
    this.editor = new Editor();

    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      let lang_id = localStorage.getItem('lang_id');
      if (lang_id == '2') {
        this.roles = [
          { role: "All", name: "All", slug: "all", id: 0 },
          { role: "Admin", name: "Admin", slug: "admin", id: 1 },
          { role: "Club", name: "Club", slug: "club", id: 2 },
          { role: "Scout", name: "Scout", slug: "scout", id: 3 },
          { role: "Talente", name: "Talente", slug: "talent", id: 4 }
        ];
        // this.roles = this.roles.push({ role: "All", name: "All", slug: "all", id: 0 })
        this.langs = environment.langs_de;
        this.locations = environment.domains_de;
      }
      this.getToasterMsg();
    });
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
      action: 'remove'
    });
  }

  validateForm() {

    this.error = false;
    this.errorMsg = {};

    if (this.title == "") {
      this.error = true;
      this.errorMsg.title = this.titleRequired;
    }
    if (this.content == "" || this.content == "<p></p>") {
      this.error = true;
      this.errorMsg.content = this.contentRequired;
    }
    if (this.type == "") {
      this.error = true;
      this.errorMsg.type = this.typeRequired;
    }
    if (this.subject == "") {
      this.error = true;
      this.errorMsg.subject = this.subjectRequired;
    }
    return this.error;
  }


  async getTemplates(id: any): Promise<void> {
    this.isLoading = true;

    try {
      this.isLoading = true;
      this.tempalateApi.getTemplateById(id).subscribe((response) => {
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

  createTemplate(): any {

    let validForm: any = this.validateForm();
    if (validForm) {
      return false;
    }

    let params: any = {}
    params.title = this.title;
    params.content = this.content;
    params.email_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.type = this.type;
    params.subject = this.subject;
    params.status = 1; // 1 for active, 2 for inactive    
    params.lang = localStorage.getItem('lang_id');

    this.tempalateApi.addEmailTemplate(params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'templateAdded',
          message: response.message
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }

  updateTemplate(): any {

    let validForm: any = this.validateForm();
    if (validForm) {
      return false;
    }

    let params: any = {}

    params.title = this.title;
    params.content = this.content;
    params.email_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.status = 1; // 1 for active, 2 for inactive
    params.subject = this.subject;
    params.type = this.type;
    params.lang = localStorage.getItem('lang_id');

    this.tempalateApi.updateEmailTemplate(this.templateIdToEdit, params).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'templateUpdated',
          message: response.message
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }

  getToasterMsg() {
    this.translateService.get(['titleRequired', 'typeRequired', 'contentRequired', 'subjectRequired']).subscribe((translations) => {
      this.titleRequired = translations['titleRequired'];
      this.typeRequired = translations['typeRequired'];
      this.contentRequired = translations['contentRequired'];
      this.subjectRequired = translations['subjectRequired'];
    });
  }

}
