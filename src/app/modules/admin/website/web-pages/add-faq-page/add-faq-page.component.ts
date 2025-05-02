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

// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import { CKEditor5 } from '@ckeditor/ckeditor5-angular';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // Use `* as` to avoid type mismatch

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


  public editorData: string = '<p>Hello from CKEditor 5!</p>';
  // getConfig
  editorConfig: any;
  // editorConfig = {
  //   // base_url: '/assets/tinymce', // path to tinymce folder
  //   // suffix: '.min',
  //   apikey:'vtw0pppfq7efn33a7j0kgks14gccdq6g9dqbigz3vnj26ejy',
  //   language: 'de', // 'en' or 'de'
  //   language_url: '/assets/tinymce/langs/de.js',
  //   plugins: 'lists link image table code',
  //   toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | link image table code',
  //   skin_url: '/assets/tinymce/skins/ui/oxide',
  //   content_css: '/assets/tinymce/skins/content/default/content.css',
  // };

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
  content: string = '';
  bannerImagePreview: string | ArrayBuffer | null = null;
  formData: any = {
    meta_title: '',
    meta_description: '',
    title: '',
    faq_banner_title: '',
    banner_img: null,
    page_content: '',
    faq_collapse_titile: '',
    faq_first_btn_txt: '',
    faq_sec_btn_txt: '',
    faq_third_btn_txt: '',
    faq_first_btn_content: [{ title: '', desc: '' }],
    faq_sec_btn_content: [{ title: '', desc: '' }],
    faq_third_btn_content: [{ title: '', desc: '' }],
    page_id: '',
    page_type: '',
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id'),
  };
  editorFirst: Editor[] = [];
  editorSecond: Editor[] = [];
  editorThird: Editor[] = [];

  editorContent = '';
  lang = localStorage.getItem('lang') || 'de'; // or dynamically based on user selection
  config: any;

  constructor(
    private configService: EditorConfigService,
    private webpages: WebPages,
    public dialogRef: MatDialogRef<AddFaqPageComponent>
  ) {
    this.editorConfig = this.configService.getConfig(this.lang);
  }

  ngOnInit(): void {
    this.editor = new Editor();
    if (this.pageType) {
      this.formData.page_type = this.pageType;
    }
    if (this.pageId) {
      this.formData.page_id = this.pageId;
      this.getPageById(this.pageId);
    }

  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.editorFirst.forEach(editor => editor.destroy());
    this.editorSecond.forEach(editor => editor.destroy());
    this.editorThird.forEach(editor => editor.destroy());
  }


  // onFileChange(event: any, fieldName: string): void {
  //   this.formData[fieldName] = event.target.files[0];
  // }
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
  addFirstButtonContent() {
    this.formData.faq_first_btn_content.push({ title: '', desc: '' });
  }
  addSecondButtonContent() {
    this.formData.faq_sec_btn_content.push({ title: '', desc: '' });
  }
  addThirdButtonContent() {
    this.formData.faq_third_btn_content.push({ title: '', desc: '' });
  }

  removeFirstButtonContent(i: number): void {
    this.formData.faq_first_btn_content.splice(i, 1);
  }
  removeSecondButtonContent(i: number): void {
    this.formData.faq_sec_btn_content.splice(i, 1);
  }
  removeThirdButtonContent(i: number): void {
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
        this.formData.faq_third_btn_content = response.data.pageData.faq_third_btn_content;
        this.formData.faq_third_btn_txt = response.data.pageData.faq_third_btn_txt;
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.bannerImagePreview = response.data?.pageData?.banner_img ? response.data.base_url + response.data.pageData.banner_img : null;

        setTimeout(() => {
          this.formData.faq_first_btn_content.forEach((item: any, index: any) => {
            // this.editorFirst[index] = new Editor();
            this.setEditorContentById('editorFirst' + index, item.desc);
          });


          this.formData.faq_sec_btn_content.forEach((item: any, index: any) => {
            // this.editorSecond[index] = new Editor();
            this.setEditorContentById('editorSecond' + index, item.desc);
          });

          this.formData.faq_third_btn_content.forEach((item: any, index: any) => {
            // this.editorThird[index] = new Editor();
            this.setEditorContentById('editorThird' + index, item.desc);
          });
        }, 1000);




      }
    });
  }
  submitForm(): void {
    const formData = new FormData();
    for (const key in this.formData) {
      // console.log(key);
      // console.log(this.formData);
      // console.log(this.getEditorContentById('editorFirst0')); //
      // return;
      if (key == 'faq_first_btn_content') {
        // console.log((this.formData[key]));
        this.formData[key].forEach((item: any, index: number) => {
          item.desc = this.getEditorContentById('editorFirst' + index);
        });
        formData.append(key, JSON.stringify(this.formData[key]));
      } else if (key == 'faq_sec_btn_content') {
        this.formData[key].forEach((item: any, index: number) => {
          item.desc = this.getEditorContentById('editorSecond' + index);
        });
        formData.append(key, JSON.stringify(this.formData[key]));
      } else if (key == 'faq_third_btn_content') {
        this.formData[key].forEach((item: any, index: number) => {
          item.desc = this.getEditorContentById('editorThird' + index);
        });
        formData.append(key, JSON.stringify(this.formData[key]));
      } else {
        // if (Array.isArray(this.formData[key])) {
        //   // this.formData[key].forEach((item: string, index: number) => {
        //   //   formData.append(`${key}[${index}]`, item);
        //   // });
        // } else {

        formData.append(key, this.formData[key]);
        // }
      }

    }

    // Append lang_id to FormData
    formData.append('lang', String(localStorage.getItem('lang_id')));

    console.log(formData);
    // Append specific club_nd_scout_section values (if they exist)

    this.webpages.addFaqPage(formData).subscribe(response => {
      this.dialogRef.close({
        action: 'page-added-successfully',
        message: response.message
      });
    });
  }

  // To remove Image
  removeImage(fieldName: string): void {
    this.formData[fieldName] = 'remove_image';
    this.bannerImagePreview = null;
    // this.imageLoaded = false;
  }

  handleEditorChange(content: any, index: number) {
    this.editorFirst[index] = content;
    this.formData.faq_first_btn_content[index].desc = content;
    console.log('content is ', content)
  }
  handleEditorChange2(content: any, index: number) {
    this.editorSecond[index] = content;
  }
  handleEditorChange3(content: any, index: number) {
    this.editorThird[index] = content;
  }

  setEditorContentById(id: string, value: string): void {
    const editor = tinymce.get(id);
    if (editor) {
      editor.setContent(value);
    }
  }

  getEditorContentById(id: string): string | undefined {
    const editor = tinymce.get(id);
    if (editor) {
      // Optionally, use the 'value' for something else, like logging or updating a model
      //   console.log('Value passed:', value);
      return editor.getContent();
    }
    return undefined;  // Return undefined if the editor is not found
  }


  onEditorInit(editorInstance: any, index: number) {
    //const content = editorInstance.getContent();
    // Set up a listener for the `blur` event
    // editorInstance.on('blur', () => {
    //   this.onBlur(editorInstance, index);  // Call custom blur handler
    // });
  }

  onBlur(editorInstance: any, index: number) {
    // Get the content of the editor when it loses focus
    const content = editorInstance.getContent();  // Get current content of the editor
    console.log('Editor blurred. Current content:', content);

    // Manually update the model (if needed)
    this.editorFirst[index] = content;
  }
}