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
  selector: 'app-add-about-page',
  templateUrl: './add-about-page.component.html',
  styleUrls: ['./add-about-page.component.scss']
})
export class AddAboutPageComponent implements OnInit {
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

  colorPresets: any = environment.colors;

  about_banner_bg_img: any;
  about_banner_img: any;
  country_section_banner_img: any;
  country_section_banner_img_dark: any;
  countriesArr: any;

  bannerBgimageLoaded: boolean = false;
  aboutBannerImagePreview: boolean = false;
  aboutCountryBannerImagePreview: boolean = false;
  aboutCountryBannerImagePreviewDark: boolean = false;

  dark_theme_banner_img: any;
  darkThemeImagePreview: boolean = false;

  formData: any = {
    meta_title: '',
    meta_description: '',
    about_banner_title: '',
    about_banner_desc: '',
    about_banner_bg_img: null,
    about_banner_img: null,
    country_section_title: '',
    about_country_names: [],
    country_section_banner_img: null,
    country_section_banner_img_dark: null,
    about_hero_heading:'',
    about_hero_heading_txt: '',
    about_hero_btn_txt: '',
    about_hero_btn_link: '',
    page_id: '',
    lang: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id'),
  };

  countries: string[] = ['Switzerland', 'France', 'Germany', 'Italy', 'Portugal'];
  editorConfig: any;
  lang: string = localStorage.getItem('lang') || 'de';
  isLoading:boolean=false;
  constructor(
    private configService: EditorConfigService,
    private webpages: WebPages,
     public dialogRef: MatDialogRef<AddAboutPageComponent>) { }

  ngOnInit(): void {
    this.editor = new Editor();

    if (this.pageId) {
      this.formData.page_id = this.pageId;
      this.getPagebyId(this.pageId);
    }

    this.editorConfig = this.configService.getConfig(this.lang);
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getPagebyId(id: number): void {
    this.webpages.getPageById(id).subscribe(response => {
      if (response.status) {
        // console.warn(response.data.pageData.about_country_names)
        // convertToArray
        // if (response.data.pageData.about_country_names && response.data.pageData.about_country_names != '') {
        //   this.countriesArr = this.convertToArray(response.data.pageData.about_country_names);
        //   console.warn(this.countriesArr)
        // }
        if (response.data.pageData.about_country_names && response.data.pageData.about_country_names !== '') {
          if (Array.isArray(response.data.pageData.about_country_names)) {
            this.formData.about_country_names = response.data.pageData.about_country_names;
          } else {
            this.formData.about_country_names = this.convertToArray(response.data.pageData.about_country_names);
          }
        } else {
          this.formData.about_country_names = []; // Initialize empty array
        }
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.formData.about_banner_title = response.data.pageData.about_banner_title;
        this.formData.country_section_title = response.data.pageData.country_section_title;
        this.formData.about_hero_heading_txt = response.data.pageData.about_hero_heading_txt;
        this.formData.about_hero_heading = response.data.pageData.about_hero_heading;
        this.formData.about_hero_btn_txt = response.data.pageData.about_hero_btn_txt;
        this.formData.about_hero_btn_link = response.data.pageData.about_hero_btn_link;
        this.formData.about_banner_desc = response.data.pageData.about_banner_desc;
        if (response.data.pageData.about_banner_bg_img != '') {
          this.about_banner_bg_img = response.data.base_url + response.data.pageData.about_banner_bg_img;
          this.bannerBgimageLoaded = true;
        }
        if (response.data.pageData.about_banner_img != '') {
          this.about_banner_img = response.data.base_url + response.data.pageData.about_banner_img;
          this.aboutBannerImagePreview = true;
        }
        if (response.data.pageData.country_section_banner_img != '') {
          this.country_section_banner_img = response.data.base_url + response.data.pageData.country_section_banner_img;
          this.aboutCountryBannerImagePreview = true;
        }
        if (response.data.pageData.country_section_banner_img_dark != '') {
          this.country_section_banner_img_dark = response.data.base_url + response.data.pageData.country_section_banner_img_dark;
          this.aboutCountryBannerImagePreviewDark = true;
        }
        const editor = tinymce.get('aboutPageEditor');
        if (editor && this.formData.about_banner_desc) {
          editor.setContent(this.formData.about_banner_desc);
        }
      }
    });
  }
  // Update the `removeImage` method to reset the `imageLoaded` property.
  removeImage(fieldName: string): void {
    this.formData[fieldName] = 'remove_image';
    if (fieldName == 'about_banner_bg_img') {
      this.about_banner_bg_img = 'remove_image';
      this.bannerBgimageLoaded = false;
    } else if (fieldName == 'about_banner_img') {
      this.about_banner_img = 'remove_image';
      this.aboutBannerImagePreview = false;
    } else if (fieldName == 'country_section_banner_img') {
      this.country_section_banner_img = 'remove_image';
      this.aboutCountryBannerImagePreview = false;
    } else if (fieldName === 'dark_theme_banner_img') {
      this.dark_theme_banner_img = 'remove_image';
      this.darkThemeImagePreview = false;
    }
    else if (fieldName == 'country_section_banner_img_dark') {
      this.country_section_banner_img_dark = 'remove_image';
      this.aboutCountryBannerImagePreviewDark = false;
    }
    //this.about_banner_bg_img = null;
    //this.bannerBgimageLoaded = false;
  }

  onFileChange(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;

        // Assign the preview URL to the corresponding field
        if (fieldName === 'about_banner_bg_img') {
          this.about_banner_bg_img = imageUrl;
          this.bannerBgimageLoaded = true;
        } else if (fieldName === 'about_banner_img') {
          this.about_banner_img = imageUrl;
          this.aboutBannerImagePreview = true;
        } else if (fieldName === 'country_section_banner_img') {
          this.country_section_banner_img = imageUrl;
          this.aboutCountryBannerImagePreview = true;
        } else if (fieldName === 'dark_theme_banner_img') {
          this.dark_theme_banner_img = imageUrl;
          this.darkThemeImagePreview = true;
        } else if (fieldName === 'country_section_banner_img_dark') {
          this.country_section_banner_img_dark = imageUrl;
          this.aboutCountryBannerImagePreviewDark = true;
        }
      };
      reader.readAsDataURL(file);

      // Update formData
      this.formData[fieldName] = file;
    }
  }

  submitForm(): void { 
    this.isLoading = true;
    // return ;
    // const formData = new FormData();
    const formData = new FormData();
    const editor = tinymce.get('aboutPageEditor');
    if (editor) {
      this.formData.about_banner_desc = editor.getContent();
    }
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

    console.log(this.formData, 'submit-form');
    this.webpages.addAboutPage(formData).subscribe(response => {
      this.isLoading = false;
      this.dialogRef.close({
        action: 'page-added-successfully',
        message: response.message
      });
    });
    this.isLoading = false;
  }

  // convertToArray(inputString: any) {
  //   return inputString
  //     .split(",") // Split by comma
  //     .map((country: any) => country.trim()) // Trim spaces
  //     .filter((country: any) => country !== "") // Remove empty values
  //     .filter((country: any, index: any, self: any) => self.indexOf(country) === index); // Remove duplicates
  // }
  convertToArray(inputString: string | null | undefined): string[] {
    if (!inputString) return []; // Return an empty array if input is null/undefined/empty

    return inputString
      .split(",") // Split by comma
      .map(country => country.trim()) // Trim spaces
      .filter(country => country !== "") // Remove empty values
      .filter((country, index, self) => self.indexOf(country) === index); // Remove duplicates
  }
  // removeField(str: number) {
  //   alert(str)
  // }
  addField() {
    this.formData.about_country_names.push('');
  }
  

  // Function to remove an input field
  removeField(index: number) {
    if (this.formData.about_country_names.length > 1) {
      this.formData.about_country_names.splice(index, 1);
    }
  }
  
  trackByFn(index: number, item: any): number {
    return index; // Tracks items by index to prevent re-rendering
  }
}