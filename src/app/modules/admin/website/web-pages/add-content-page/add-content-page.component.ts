// Angular Component
import { Component, Input, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WebPages } from '../../../../../services/webpages.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';
import { EditorConfigService } from '../../../../../services/editor-config.service';
import tinymce from 'tinymce';

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
  selector: 'app-add-content-page',
  templateUrl: './add-content-page.component.html',
  styleUrls: ['./add-content-page.component.scss']
})
export class AddContentPageComponent implements OnInit {
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
  colorPresets: any = environment.colors;
  lang: string = localStorage.getItem('lang') || 'de';
  editorConfig: any;
  content: string = '';
  formData: any = {
    slug: '',
    meta_title: '',
    meta_description: '',
    title: '',
    banner_title: '',
    banner_img: null,
    page_content: '',
    page_id: '',
    page_type: '',
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id'),
    accordionData: []
  };
  imageLoaded: boolean = false;

  bannerImagePreview: string | ArrayBuffer | null = null;
  isLoading: boolean = false;
  constructor(
    private configService: EditorConfigService,
    private webpages: WebPages,
    public dialogRef: MatDialogRef<AddContentPageComponent>) { }

  ngOnInit(): void {
    this.editor = new Editor();
    if (this.pageType) {
      this.formData.page_type = this.pageType;
    }
    if (this.pageId) {
      this.formData.page_id = this.pageId;
      this.getPagebyId(this.pageId);
    }
    this.editorConfig = this.configService.getConfig(this.lang);
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  addAccordionItem(): void {
    this.formData.accordionData.push({ title: '', description: '' });
  }

  removeAccordionItem(index: number): void {
    this.formData.accordionData.splice(index, 1);
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
    this.isLoading = true;
    const formData = new FormData();
    const editor = tinymce.get('editorFirstForCOntet');
    if (editor) {
      this.formData.page_content = editor.getContent();
    }
    for (const key in this.formData) {
      if (Array.isArray(this.formData[key])) {
        if(key !== 'accordionData' ){
          this.formData[key].forEach((item: string, index: number) => {
            formData.append(`${key}[${index}]`, item);
          });
        }
        else{
          this.formData.accordionData.forEach((item: any, index: number) => {
            formData.append(`accordionData[${index}][title]`, item.title);
            formData.append(`accordionData[${index}][description]`, item.description);
          });
        }

      } else {
        formData.append(key, this.formData[key]);
      }
    }


    // Append lang_id to FormData
    formData.append('lang', String(localStorage.getItem('lang_id')));

    console.log('content', this.content);
    console.log(this.formData, 'submit-form');
    this.webpages.addContentPage(formData).subscribe(response => {
      this.isLoading = false;
      this.dialogRef.close({
        action: 'page-added-successfully',
        message: response.message
      });
    });
    this.isLoading = false;
  }

  getPagebyId(id: number): void {
    this.webpages.getPageById(id).subscribe(response => {
      if (response.status) {
        this.formData.banner_title = response.data.pageData.banner_title;
        this.formData.page_content = response.data.pageData.page_content;
        const editor = tinymce.get('editorFirstForCOntet');
        if (editor) {
          setTimeout(() => {
            editor.setContent(this.formData.page_content);
          }, 1500);
        }
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.bannerImagePreview = response.data?.pageData?.banner_img ? response.data.base_url + response.data.pageData.banner_img : null;
      }
    });
  }
}
