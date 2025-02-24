import { Component, Input, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WebPages } from '../../../../../services/webpages.service';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';

interface Language {
  id: string;
  description: string;
  language: string;
  status: string;
  updated_at: string;
  created_at: string;
  slug: string;
}

@Component({
  selector: 'app-add-contact-page',
  templateUrl: './add-contact-page.component.html',
  styleUrl: './add-contact-page.component.scss'
})
export class AddContactPageComponent {
  @Input() pageId: any;
  @Input() languages: Language[] = [];

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];

  colorPresets :any = environment.colors;
  bannerImagePreview:any;
  imageLoaded: boolean = false;

  formData: any = {
    page_id: '',
    lang_id: '',
    meta_title:'',
    meta_description:'',
    banner_bg_img: null,
    banner_title: '',
    form_title: '',
    txt_before_radio_btn: '',
    talent_label_txt: '',
    club_label_txt: '',
    scout_label_txt: '',
    submit_btn_txt: '',
    address: '',
    email: '',
  };
  constructor(private webpages: WebPages, public dialogRef : MatDialogRef<AddContactPageComponent>) {}
  ngOnInit() {
    this.editor = new Editor();
    if(this.pageId){
      this.formData.page_id = this.pageId;
      this.getPagebyId(this.pageId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getPagebyId(id: number): void {
    this.webpages.getPageById(id).subscribe(response => {
      if (response.status) {
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.formData.banner_title = response.data.pageData.banner_title;
        this.formData.form_title = response.data.pageData.form_title;
        this.formData.txt_before_radio_btn = response.data.pageData.txt_before_radio_btn;
        this.formData.talent_label_txt = response.data.pageData.talent_label_txt;
        this.formData.club_label_txt = response.data.pageData.club_label_txt;
        this.formData.scout_label_txt = response.data.pageData.scout_label_txt;
        this.formData.submit_btn_txt = response.data.pageData.submit_btn_txt;
        this.formData.address = response.data.pageData.address;
        this.formData.email = response.data.pageData.email;
        if(response.data?.pageData?.banner_bg_img != ''){
          this.bannerImagePreview = response.data.base_url + response.data.pageData.banner_bg_img;
        }else{
          this.imageLoaded = false;
        }
      }
    });
  }
  // Update the `removeImage` method to reset the `imageLoaded` property.
  removeImage(fieldName: string): void {
    this.formData[fieldName] = 'remove_image';
    this.bannerImagePreview = null;
    this.imageLoaded = false;
  }


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.banner_bg_img = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.bannerImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitForm(): void {
    const formData = new FormData();
    for (const key in this.formData) {
      formData.append(key, this.formData[key]);
    }

    // Append lang_id to FormData
    formData.append('lang', String(localStorage.getItem('lang_id')));

    console.log(this.formData, 'submit-form');
    this.webpages.addContactPage(formData).subscribe(response => {
      this.dialogRef.close({
        action: "page-added-successfully",
        message: response.message
      });
    });
  }



}
