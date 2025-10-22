import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';
import { BlogService } from '../../../../../services/blog.service';
import { WebPages } from '../../../../../services/webpages.service';
import { TranslateService } from '@ngx-translate/core';
import { EditorConfigService } from '../../../../../services/editor-config.service';
import tinymce from 'tinymce';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { ImageCropperComponent2 } from '../../../../shared/image-cropper/image-cropper.component';
import { AdminCropperComponent } from '../../../admin-cropper/admin-cropper.component';
// import { TemplateService } from '../../../../../services/template.service';

@Component({
  selector: 'app-blog-popup',
  templateUrl: './blog-popup.component.html',
  styleUrl: './blog-popup.component.scss'
})
export class BlogPopupComponent implements OnInit, OnDestroy {
  // id = 0;
  baseUrl: string = environment.baseUrl;
  UploadedfeaturedImage: string = '';
  editor!: Editor;
  editorEn!: Editor;
  editorDe!: Editor;
  editorIt!: Editor;
  editorFr!: Editor;
  editorEs!: Editor;
  editorPt!: Editor;
  editorDa!: Editor;
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
  imagePreview: { [key: string]: string } = {};
  imageUrl: { [key: string]: string } = {};
  deletedFeaturedImage: { [key: string]: string } = {};
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
  allContent: any = { en: '', de: '', it: '', fr: '', es: '', pt: '', da: '', sv: '', }
  isLoading: boolean = false;
  isBtnLoading: boolean = false;
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
  editorConfig: any;
  editors: any;
  lang: string = localStorage.getItem('lang') || 'de';

  theme: any = localStorage.getItem('theme');
  constructor(
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<BlogPopupComponent>, private blogApi: BlogService,
    private webpages: WebPages,
    private translateService: TranslateService,
    private configService: EditorConfigService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public blog: any
  ) {
    if (blog) {
      this.getBlog(blog.id)
    }

    let envRoles: any = environment.roles;

    this.roles = envRoles;
    // this.langs = environment.langs;
    this.langs = this.getAllLanguages();
    console.log('languages', this.langs)
    this.locations = environment.domains;
    this.theme = localStorage.getItem('theme');
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.editorEn = new Editor();
    this.editorDe = new Editor();
    this.editorIt = new Editor();
    this.editorFr = new Editor();
    this.editorEs = new Editor();
    this.editorPt = new Editor();
    this.editorDa = new Editor();
    this.editorSv = new Editor();

    this.editors = {
      en: this.editorEn,
      de: this.editorDe,
      it: this.editorIt,
      fr: this.editorFr,
      es: this.editorEs,
      pt: this.editorPt,
      da: this.editorDa,
      sv: this.editorSv
    };

    this.getToasterMsg();
    this.webpages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });

    this.editorConfig = this.configService.getConfig(this.lang);

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
        this.imagePreview[key] = reader.result as string;
      };
      reader.readAsDataURL(fileToUpload);
    }

    console.log("fileToUpload", this.featured_image)
  }


  closeImage(key: string, imageName: string = ''): void {
    delete this.imagePreview[key];
    delete this.imageUrl[key];
    delete this.featuredImages[key];

    if (imageName) {
      this.deletedFeaturedImage[key] = imageName;
    }
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

        console.log("lang", this.langs)
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
          this.imageUrl = this.blog.featured_image;
          this.UploadedfeaturedImage = this.blog.featured_image.en;
          // this.status = this.blog.status;
          this.isLoading = false;
          this.cdr.detectChanges();
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

    this.isBtnLoading = true;
    let formData = new FormData();

    // formData.append("language", this.selectedLang+1);
    formData.append("slug", this.slug);
    formData.append("status", "1");

    Object.entries(this.titles).forEach(([key, value]) => {
      formData.append(`title[${key}]`, value as string);

      if (this.featuredImage) {
        // formData.append(`featured_image[${key}]`, this.featuredImage as string);
        formData.append(`image[${key}]`, this.dataURItoBlob(this.featuredImage));
      }
    });

    Object.entries(this.meta_titles).forEach(([key, value]) => {
      formData.append(`meta_title[${key}]`, value as string);
    });

    Object.entries(this.meta_descriptions).forEach(([key, value]) => {
      formData.append(`meta_description[${key}]`, value as string);
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
      this.isBtnLoading = false;
    },
      (error) => {
        if (error && error.errors) {
          this.errorMsg = error.errors; // Assign API errors to the errorMsg object
        } else {
          console.error('Unexpected error response:', error);
          this.errorMsg.general = "Something went wrong. Please try again.";
        }
        this.isBtnLoading = false;
      }

    );
  }

  updateBlog(): any {

    let validForm: any = this.validateForm();
    if (validForm) {
      return false;
    }

    this.isBtnLoading = true;

    let formData = new FormData();

    formData.append("language", this.selectedLang + 1);
    formData.append("slug", this.slug);
    formData.append("status", "1");

    Object.entries(this.titles).forEach(([key, value]) => {
      formData.append(`title[${key}]`, value as string);
      if (this.featuredImage) {
        formData.append(`featured_image[${key}]`, this.dataURItoBlob(this.featuredImage));
      }
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

    Object.entries(this.deletedFeaturedImage).forEach(([key, value]) => {
      formData.append(`deleted_featured_image[${key}]`, value as string);
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
      this.isBtnLoading = false;
    });
  }

  imageRequired: string = '';
  getToasterMsg() {
    this.translateService.get(['titleRequired', 'contentRequired', 'slugRequired', 'invalidSlug', 'metaTitleReruired', 'descriptionRequired', 'imageRequired']).subscribe((translations) => {
      this.contentRequired = translations['contentRequired'];
      this.titleRequired = translations['titleRequired'];
      this.slugRequired = translations['slugRequired'];
      this.invalidSlug = translations['invalidSlug'];
      this.metaTitleReruired = translations['metaTitleReruired'];
      this.descriptionRequired = translations['descriptionRequired'];
      this.imageRequired = translations['imageRequired'];
    });
    // console.log('name error test : ', this.nameError)
  }


  featuredImage: any;
  onProfileFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      if (!selectedFile.type.startsWith('image/')) {

        return;
      }

      const maxSizeInBytes = 15 * 1024 * 1024; // 5 MB
      if (selectedFile.size > maxSizeInBytes) {

        //return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const imageData = reader.result as string;

        const dialogRef = this.dialog.open(AdminCropperComponent, {
          width: '850px',
          data: { imageUrl: imageData, action: 'profile_image' },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe((croppedImage) => {
          if (croppedImage) {
            console.log('Cropped Image:', croppedImage);
            // this.uploadCroppedImage(croppedImage);
            this.featuredImage = croppedImage;
            // const formData = new FormData();
            // formData.append('profile_image', blob, 'cropped-image.png');
          } else {
            console.log('No cropped image returned');
          }
        });
      };

      reader.readAsDataURL(selectedFile);
    } else {
      console.error('No file selected');
    }
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  closeUploadedfeaturedImage() {
    this.UploadedfeaturedImage = '';
  }

  closefeaturedImage() {
    this.featuredImage = null;
  }
}
