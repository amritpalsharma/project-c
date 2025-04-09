import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';
import { BlogService } from '../../../../../services/blog.service';
import { WebPages } from '../../../../../services/webpages.service';
import { TranslateService } from '@ngx-translate/core';

// import { TemplateService } from '../../../../../services/template.service';

@Component({
  selector: 'app-blog-popup',
  templateUrl: './blog-popup.component.html',
  styleUrl: './blog-popup.component.scss'
})
export class BlogPopupComponent implements OnInit, OnDestroy {
  // id = 0;
  editor!: Editor;
  editorEn!: Editor;
  editorDe!: Editor;
  editorIt!: Editor;
  editorFr!: Editor;
  editorEs!: Editor;
  editorPt!: Editor;
  editorDk!: Editor;
  editorSv!: Editor;
  title: string = "";

  titles: { [key: string]: string } = {};
  meta_titles: { [key: string]: string } = {};
  meta_descriptions: { [key: string]: string } = {};

  status: string = "";
  selectedRole: any = 0;
  selectedLang: any = '1';
  selectedLocation: any = 1;
  roles: any = [];
  langs: any = [];
  locations: any = [];
  blogIdToEdit: any = '';
  featured_image: any = "";
  featuredImages: { [key: string]: File } = {};
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
  allContent: any = { en: '', de: '', it: '', fr: '', es: '', pt: '', dk: '', sv: '', }
  isLoading: boolean = false
  error: boolean = false
  errorMsg: any = {}
  slug: string = "";
  meta_description: string = "";
  meta_title: string = "";

  titleRequired: string = '';
  contentRequired: string = '';
  slugRequired: string = '';
  metaTitleReruired: string = '';
  descriptionRequired: string = '';
  invalidSlug: string = '';

  editors: any;


  constructor(
    public dialogRef: MatDialogRef<BlogPopupComponent>, private blogApi: BlogService,
    private webpages: WebPages,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public blog: any
  ) {
    if (blog) {
      this.getBlog(blog.id)
    }

    let envRoles: any = environment.roles;

    this.roles = envRoles;
    // this.langs = environment.langs;
    this.langs = this.getAllLanguages();
    this.locations = environment.domains;
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.editorEn = new Editor();
    this.editorDe = new Editor();
    this.editorIt = new Editor();
    this.editorFr = new Editor();
    this.editorEs = new Editor();
    this.editorPt = new Editor();
    this.editorDk = new Editor();
    this.editorSv = new Editor();

    this.editors = {
      en: this.editorEn,
      de: this.editorDe,
      it: this.editorIt,
      fr: this.editorFr,
      es: this.editorEs,
      pt: this.editorPt,
      dk: this.editorDk,
      sv: this.editorSv
    };

    this.getToasterMsg();
    this.webpages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
  }

  ngOnDestroy(): void {
    // this.editor.destroy();
    this.editorEn.destroy;
    this.editorDe.destroy;
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

  // onImageChange(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     let FileToUpload = input.files[0];
  //     this.featured_image = FileToUpload;
  //   }
  // }

  onImageChange(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let fileToUpload = input.files[0];
      this.featured_image = fileToUpload;
      this.featuredImages[key] = fileToUpload;
      console.log("fileToUpload", this.featuredImages);

      const reader = new FileReader();
      reader.onload = () => {
        // this.imagePreview = reader.result;
      };
      reader.readAsDataURL(fileToUpload);
    }

    console.log("fileToUpload", this.featured_image)
  }


  getAllLanguages() {
    this.webpages.getAllLanguage().subscribe((response) => {
      if (response.status) {
        let languages = response.data.languages;

        this.langs = languages
          .map((value: any) => {
            this.titles[value.slug] = '';
            this.meta_titles[value.slug] = '';
            this.meta_descriptions[value.slug] = '';
            return {
              id: value.id,
              language: value.language,
              slug: value.slug
            }
          });
      }
    });
  }

  validateForm() {

    this.error = false;
    this.errorMsg = {};

    // if (this.title == "") {
    //   this.error = true;
    //   this.errorMsg.title = this.titleRequired;
    // }
    // if (this.content == "" || this.content == "<p></p>") {
    //   this.error = true;
    //   this.errorMsg.content = this.contentRequired;
    // }
    if (this.slug == "") {
      this.error = true;
      this.errorMsg.slug = this.slugRequired;
    }
    // if (this.slug.includes(' ')) {
    //   this.error = true;
    //   this.errorMsg.slug = this.invalidSlug;
    // }

    // if (this.meta_title == "") {
    //   this.error = true;
    //   this.errorMsg.meta_title = this.metaTitleReruired;
    // }
    // if (this.meta_description == "") {
    //   this.error = true;
    //   this.errorMsg.meta_description = this.descriptionRequired;
    // }
    return this.error;
  }


  async getBlog(id: any): Promise<void> {
    this.isLoading = true;

    try {
      this.isLoading = true;
      this.blogApi.getBlogById(id).subscribe((response) => {
        if (response && response.status && response.data && response.data.blog) {

          this.blog = response.data.blog;
          this.blogIdToEdit = this.blog.id;

          this.titles = this.blog.title;
          this.allContent = this.blog.content;
          // this.selectedLang = Number(this.blog.lang_id);
          this.selectedLang = this.blog.lang_id;
          this.meta_titles = this.blog.meta_title;
          this.meta_descriptions = this.blog.meta_description;
          this.slug = this.blog.slug;
          // this.status = this.blog.status;
          this.isLoading = false;
        } else {
          this.blog = [];
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  createBlog(): any {
    let validForm: any = this.validateForm();
    if (validForm) {
      return false;
    }
  
    let formData = new FormData();

    // formData.append("language", this.selectedLang+1);
    formData.append("slug", this.slug);
    formData.append("status", "1");

    Object.entries(this.titles).forEach(([key, value]) => {
      formData.append(`title[${key}]`, value as string);
    });

    Object.entries(this.meta_titles).forEach(([key, value]) => {
      formData.append(`meta_title[${key}]`, value as string);
    });
    
    Object.entries(this.meta_descriptions).forEach(([key, value]) => {
      formData.append(`meta_description[${key}]`, value as string);
    });

    Object.entries(this.featuredImages).forEach(([key, value]) => {
      formData.append(`image[${key}]`, value);
    });

    Object.entries(this.allContent).forEach(([key, value]) => {
      formData.append(`content[${key}]`, value as string);
    });

    this.blogApi.addBlog(formData).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'blogAdded',
          message: response.message
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
        this.errorMsg = response.errors; // Assign API errors to the errorMsg object
      }
    },
      (error) => {
        if (error && error.errors) {
          this.errorMsg = error.errors; // Assign API errors to the errorMsg object
        } else {
          console.error('Unexpected error response:', error);
          this.errorMsg.general = "Something went wrong. Please try again.";
        }
      }

    );
  }

  updateBlog(): any {

    let validForm: any = this.validateForm();
    if (validForm) {
      return false;
    }

    // let params: any = {}
    // params.title = this.title;
    // params.content = this.content;
    // params.language = this.selectedLang;
    // params.featured_image = this.featured_image;
    // params.slug = this.slug;
    // params.meta_title = this.meta_title;
    // params.meta_description = this.meta_description;
    // // params.status  = 1;   
    // params.status = this.status;

    let formData = new FormData();

    formData.append("language", this.selectedLang+1);
    formData.append("slug", this.slug);
    formData.append("status", "1");

    Object.entries(this.titles).forEach(([key, value]) => {
      formData.append(`title[${key}]`, value as string);
    });

    Object.entries(this.meta_titles).forEach(([key, value]) => {
      formData.append(`meta_title[${key}]`, value as string);
    });
    
    Object.entries(this.meta_descriptions).forEach(([key, value]) => {
      formData.append(`meta_description[${key}]`, value as string);
    });

    Object.entries(this.featuredImages).forEach(([key, value]) => {
      formData.append(`featured_image[${key}]`, value);
    });

    Object.entries(this.allContent).forEach(([key, value]) => {
      formData.append(`content[${key}]`, value as string);
    });

    this.blogApi.updateBlog(this.blogIdToEdit, formData).subscribe((response) => {
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
    this.translateService.get(['titleRequired', 'contentRequired', 'slugRequired', 'invalidSlug', 'metaTitleReruired', 'descriptionRequired']).subscribe((translations) => {
      this.contentRequired = translations['contentRequired'];
      this.titleRequired = translations['titleRequired'];
      this.slugRequired = translations['slugRequired'];
      this.invalidSlug = translations['invalidSlug'];
      this.metaTitleReruired = translations['metaTitleReruired'];
      this.descriptionRequired = translations['descriptionRequired'];
    });
    // console.log('name error test : ', this.nameError)
  }

}
