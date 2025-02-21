// Angular Component
import { Component, Input, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WebPages } from '../../../../../services/webpages.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';

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
  selector: 'app-add-faq-page',
  templateUrl: './add-faq-page.component.html',
  styleUrls: ['./add-faq-page.component.scss']
})
export class AddFaqPageComponent implements OnInit {
  @Input() pageId: any;
  @Input() pageType: any;
  
  @Input() languages: Language[] = [];
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  content: string = '';
  formData: any = {
    meta_title:'',
    meta_description:'',
    title:'',
    faq_banner_title: '',
    banner_img: null,
    page_content: '',
    faq_collapse_titile:'',
    faq_first_btn_txt:'',
    faq_sec_btn_txt:'',
    faq_third_btn_txt:'',
    faq_first_btn_content:[{ title: '', desc: ''}],
    faq_second_btn_content:[{ title: '', desc: ''}],
    faq_third_btn_content:[{ title: '', desc: ''}],
    page_id: '',
    page_type:'',
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id'),
  };

  constructor(private webpages: WebPages, public dialogRef: MatDialogRef<AddFaqPageComponent>) {}

  ngOnInit(): void {
    this.editor = new Editor();
    if(this.pageType){
      this.formData.page_type = this.pageType;
    }
    if (this.pageId) {
      this.formData.page_id = this.pageId;
      this.getPageById(this.pageId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }


  onFileChange(event: any, fieldName: string): void {
    this.formData[fieldName] = event.target.files[0];
  }
  addFirstButtonContent(){
    this.formData.faq_first_btn_content.push({ title: '', desc: ''});
  }
  addSecondButtonContent(){
    this.formData.faq_second_btn_content.push({ title: '', desc: ''});
  }
  addThirdButtonContent(){
    this.formData.faq_second_btn_content.push({ title: '', desc: ''});
  }

  removeFirstButtonContent(i:number): void {
    this.formData.faq_first_btn_content.splice(i, 1);
  }
  removeSecondButtonContent(i:number): void {
    this.formData.faq_third_btn_content.splice(i, 1);
  }
  removeThirdButtonContent(i:number): void {
    this.formData.faq_third_btn_content.splice(i, 1);
  }
  getPageById(id: number): void {
    this.webpages.getPageById(id).subscribe(response => {
      if (response.status) {
        this.formData.faq_banner_title = response.data.pageData.faq_banner_title;
        this.formData.faq_collapse_titile = response.data.pageData.faq_collapse_titile;
        this.formData.faq_first_btn_content = response.data.pageData.faq_first_btn_content;
        this.formData.faq_first_btn_txt = response.data.pageData.faq_first_btn_txt;
        this.formData.faq_sec_btn_content = response.data.pageData.faq_sec_btn_content;
        this.formData.faq_sec_btn_txt = response.data.pageData.faq_sec_btn_txt;
        this.formData.faq_third_btn_content= response.data.pageData.faq_third_btn_content;
        this.formData.faq_third_btn_txt = response.data.pageData.faq_third_btn_content;
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
      }
    });
  }
  submitForm(): void {
    const formData = new FormData();
    for (const key in this.formData) {
      if (Array.isArray(this.formData[key])) {
        this.formData[key].forEach((item: string, index: number) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, this.formData[key]);
      }
    }
     // Append specific club_nd_scout_section values (if they exist)
 
     this.webpages.addFaqPage(formData).subscribe(response => {
      this.dialogRef.close({
        action: 'page-added-successfully'
      });
    }); 
  }
}