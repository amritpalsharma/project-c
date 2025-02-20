// Angular Component
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WebPages } from '../../../../../services/webpages.service';
import { MatDialogRef } from '@angular/material/dialog';
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
  selector: 'app-add-talent-page',
  templateUrl: './add-talent-page.component.html',
  styleUrls: ['./add-talent-page.component.scss']
})
export class AddTalentPageComponent implements OnInit {
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
  colorPresets :any = environment.colors;

  imageLoaded: boolean = false;

  formData: any = {
    slug: '',
    meta_title: '',
    meta_description: '',
    banner_title: '',
    banner_bg_img: null,
    banner_desc: '',
    banner_btn_txt: '',
    banner_imgs: [],
    talent_section_title: '',
    talent_section: {
      first_tab: [],
      sec_tab: [],
      third_tab: [],
    },
    feature_sctn: [
      { title: '', desc: '', icon: null },
    ],
    feature_sctn_imgs: [], // Correctly added the 'imgs' array for feature section
    feature_sctn_title: '',
    pricing_tab: [],
    page_content: '',
    page_id: '',
    page_type: '',
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id'),
  };

  bannerBgImagePreview: string | ArrayBuffer | null = null;
  bannerImagesPreviews: string[] = [];
  bannerImagePreview: string | ArrayBuffer | null = null;

  constructor(private webpages: WebPages, public dialogRef: MatDialogRef<AddTalentPageComponent>,private cdr: ChangeDetectorRef) {}

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
  }

  handleFileInput(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {

        if (fieldName === 'banner_bg_img') {
          this.bannerBgImagePreview = reader.result; // Preview for the background image
        }
      };
      reader.readAsDataURL(file);
      this.formData[fieldName] = file;

    }
  }

  removeImage(fieldName: string): void {
    if (fieldName === 'banner_bg_img') {
      this.formData.banner_bg_img = 'remove_image';
      this.bannerBgImagePreview = null; // Clear the preview
    }
    this.imageLoaded = false; // Reset the image loaded state
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.bannerImagesPreviews.push(reader.result as string); // Add preview
        };
        reader.readAsDataURL(file);
        this.formData.banner_imgs.push(file); // Add file to formData
      });
    }
  }

  removeSingleImage(index: number): void {
    this.formData.banner_imgs.splice(index, 1); // Remove file from formData
    this.bannerImagesPreviews.splice(index, 1); // Remove preview
  }

  removeImages(fieldName: string): void {
    if (fieldName === 'banner_imgs') {
      this.formData.banner_imgs = []; // Clear all files
      this.bannerImagesPreviews = []; // Clear all previews
    }
    this.imageLoaded = false; // Reset the image loaded state
  }

  submitForm(): void {
    const formData = new FormData();

    // Helper function to append nested objects to FormData
    const appendNestedObject = (prefix: string, obj: any) => {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any, index: number) => {
            if (typeof item === 'object' && item !== null) {
              appendNestedObject(`${prefix}[${key}][${index}]`, item);
            } else {
              formData.append(`${prefix}[${key}][${index}]`, item);
            }
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          appendNestedObject(`${prefix}[${key}]`, obj[key]);
        } else if (key !== 'iconPreview') {
          // Exclude `iconPreview`
          formData.append(`${prefix}[${key}]`, obj[key]);
        }
      }
    };

    // Iterate over this.formData and append fields
    for (const key in this.formData) {
      if (key == 'banner_bg_img' || key == 'banner_imgs' || key == 'talent_section' ||   key == 'feature_sctn') continue;
      if (Array.isArray(this.formData[key])) {
        this.formData[key].forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            appendNestedObject(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else if (typeof this.formData[key] === 'object' && this.formData[key] !== null) {
        appendNestedObject(key, this.formData[key]);
      } else {
        formData.append(key, this.formData[key]);
      }
    }

    // Append specific talent_section values (if they exist)
    const talentSection = this.formData?.talent_section;
    if (talentSection) {
      ['first_tab', 'sec_tab', 'third_tab'].forEach(tab => {
        if (talentSection[tab]?.txt) {
          formData.append(`talent_section[${tab}][txt]`, talentSection[tab].txt);
        }
        if (talentSection[tab]?.icon) {
          formData.append(`talent_section[${tab}][icon]`, talentSection[tab].icon);
        }
      });
    }

    // Append feature section images and icons, excluding iconPreview
    this.formData.feature_sctn.forEach((feature: any, index: number) => {
      if (feature.icon) {
        formData.append(`feature_sctn[${index}][icon]`, feature.icon);
      }
      if (feature.img) {
        formData.append(`feature_sctn[imgs][]`, feature.img);
      }
      if (feature.title) {
        formData.append(`feature_sctn[${index}][title]`, feature.title);
      }
      if (feature.desc) {
        formData.append(`feature_sctn[${index}][desc]`, feature.desc);
      }
    });

    formData.append(`banner_bg_img`, this.formData.banner_bg_img);
    for (const key in this.formData.banner_imgs) {
      formData.append('banner_imgs[]', this.formData.banner_imgs[key]);
    }

    console.log(formData)
    // Send the formData
    this.webpages.addTalentPage(formData).subscribe(
      response => {
        console.log('Page added successfully:', response);
        this.dialogRef.close({
          action: 'page-added-successfully',
        });
      },
      error => {
        console.error('Error adding page:', error);
        // Optional: Show an error message to the user
      }
    );
  }

  getPageById(id: number): void {
    this.webpages.getPageById(id).subscribe((response) => {
      if (response.status) {
        const pageData = response.data.pageData;

        // Map general fields
        this.formData.page_type = response.data.page_type;
        this.formData.slug = response.data.slug;
        // this.formData.page_content = pageData.page_content || '';
        this.formData.meta_title = response.data.meta_title;
        this.formData.meta_description = response.data.meta_description;
        this.formData.banner_title = pageData.banner_title || '';
        this.formData.banner_desc = pageData.banner_desc;
        this.formData.banner_btn_txt = pageData.banner_btn_txt;
        this.bannerBgImagePreview = response.data.base_url + pageData.banner_bg_img;

        // Map banner images if any
        if (pageData.banner_imgs) {
          this.formData.banner_imgs = pageData.banner_imgs;
          this.bannerImagesPreviews = pageData.banner_imgs.map((img: string) => response.data.base_url + img);
        }

        // Map talent_section
        if (pageData.talent_section) {
          ['first_tab', 'sec_tab', 'third_tab'].forEach(tab => {
            if (pageData.talent_section[tab]) {
              this.formData.talent_section[tab].txt = pageData.talent_section[tab].txt;
              this.formData.talent_section[tab].iconPreview = response.data.base_url + pageData.talent_section[tab].icon;
            }
          });
        }

        // Map feature_sctn
        if (pageData.feature_sctn) {
          this.formData.feature_sctn = pageData.feature_sctn.map((feature: any) => ({
            title: feature.title,
            desc: feature.desc,
            iconPreview: response.data.base_url + feature.icon,
          }));
        }

        // Map pricing_tab
        if (pageData.pricing_tab) {
          this.formData.pricing_tab = pageData.pricing_tab.map((plan: any) => ({
            monthly_label: plan.monthly_label || '',
            yearly_label: plan.yearly_label || '',
            plan_name: plan.plan_name,
            monthly_plan_price: plan.monthly_plan_price,
            yearly_plan_price: plan.yearly_plan_price,
            monthly_plan_label: plan.monthly_plan_label,
            yearly_plan_label: plan.yearly_plan_label,
            monthly_plan_price_currency: plan.monthly_plan_price_currency,
            yearly_plan_price_currency: plan.yearly_plan_price_currency,
            plan_feature_title: plan.plan_feature_title || '',
            plan_feature_desc: plan.plan_feature_desc || [],
          }));
        }

        // Map section titles
        this.formData.talent_section_title = pageData.talent_section_title || '';
        this.formData.feature_sctn_title = pageData.feature_sctn_title || '';
        this.formData.pricing_sctn_title = pageData.pricing_sctn_title || '';

        // Trigger change detection after assigning data
        this.cdr.detectChanges();
      }
    });
  }


  addFeature(): void {
    this.formData.feature_sctn.push({ title: '', desc: '', icon: '' });
  }

  removeFeature(index: number): void {
    this.formData.feature_sctn.splice(index, 1);
  }

  addPricingPlan(): void {
    this.formData.pricing_tab.push({
      plan_name: '',
      monthly_plan_price: '',
      yearly_plan_price: '',
      monthly_plan_price_currency: '',
      yearly_plan_price_currency: '',
      plan_feature_desc: []
    });
  }

  removePricingPlan(index: number): void {
    this.formData.pricing_tab.splice(index, 1);
  }

  addPricingFeature(planIndex: number): void {
    this.formData.pricing_tab[planIndex].plan_feature_desc.push('');
  }

  removePricingFeature(planIndex: number, featureIndex: number): void {
    this.formData.pricing_tab[planIndex].plan_feature_desc.splice(featureIndex, 1);
  }

  onIconFileChange(event: any, tabName: string): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.formData.talent_section[tabName].iconPreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.formData.talent_section[tabName].icon = file; // Save the file
    }
  }

  removeIcon(tabName: string): void {
    this.formData.talent_section[tabName].icon = 'remove_image'; // Reset the icon file
    this.formData.talent_section[tabName].iconPreview = null; // Reset the preview
  }

  removeFeatureIcon(index: number): void {
    this.formData.feature_sctn[index].icon = 'remove_image';
    this.formData.feature_sctn[index].iconPreview = null;
  }

  onFeatureIconFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.formData.feature_sctn[index].iconPreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.formData.feature_sctn[index].icon = file; // Save the file
    }
  }



  onFeatureFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Assign preview for the feature image
        this.formData.feature_sctn[index].imgPreview = reader.result;
      };
      reader.readAsDataURL(file);
      // Save the file
      this.formData.feature_sctn[index].img = file;
    }
  }

  removeFeatureImage(index: number): void {
    this.formData.feature_sctn[index].img = 'remove_image'; // Mark for removal
    this.formData.feature_sctn[index].imgPreview = null; // Clear the preview
  }


}