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
  selector: 'app-add-news-page',
  templateUrl: './add-news-page.component.html',
  styleUrls: ['./add-news-page.component.scss']
})
export class AddNewsPageComponent implements OnInit {
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
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];
  content: string = '';
  formData: any = {
    slug: '',
    meta_title: '',
    meta_description: '',
    title: '',
    banner_title: '',
    banner_bg_img: null,
    slider_btn_txt:'',
    news_title:'',
    //remove this 
    slider_date: '02.02.2024',
    slider_title:'',
    slider_btn_link:'learrn-more',
    //end here
    page_id: '',
    page_type: '',
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id')
  };
  imageLoaded: boolean = false;

  bannerImagePreview: string | ArrayBuffer | null = null;

  constructor(private webpages: WebPages, public dialogRef: MatDialogRef<AddNewsPageComponent>) {}

  ngOnInit(): void {
    this.editor = new Editor();
    if (this.pageType) {
      this.formData.page_type = this.pageType;
    }
    if (this.pageId) {
      this.formData.page_id = this.pageId;
      this.getPagebyId(this.pageId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onFileChange(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.formData[fieldName] = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.bannerImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Update the `removeImage` method to reset the `imageLoaded` property.
  removeImage(fieldName: string): void {
    this.formData[fieldName] = 'remove_image';
    this.bannerImagePreview = null;
    this.imageLoaded = false;
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

    // Append lang_id to FormData
    formData.append('lang', String(localStorage.getItem('lang_id')));

    console.log('content', this.content);
    console.log(this.formData, 'submit-form');
    this.webpages.addNewsPage(formData).subscribe(response => {
      this.dialogRef.close({
        action: 'page-added-successfully',
        message: response.message
      });
    });
  }

  getPagebyId(id: number): void {
    this.webpages.getPageById(id).subscribe(response => {
      if (response.status) {
        this.formData.banner_title = response.data.pageData.banner_title;
        this.formData.news_title = response.data.pageData.news_title;
        this.formData.slider_btn_txt = response.data.pageData.slider_btn_txt;
        this.formData.slider_date = response.data.pageData.slider_date;
        this.formData.slider_title = response.data.pageData.slider_title;
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.bannerImagePreview = response.data.base_url + response.data.pageData.banner_bg_img;
      }
    });
  }
}
