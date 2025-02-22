import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { WebPages } from '../../../../../services/webpages.service';

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
  selector: 'app-add-pricing-page',
  templateUrl: './add-pricing-page.component.html',
  styleUrls: ['./add-pricing-page.component.scss']
})
export class AddPricingPageComponent implements OnInit, OnDestroy {
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
    banner_img: null,
    page_content: '',
    page_id: '',
    page_type: '',
    pricing_title: ['PRICING'],
    pricing_tabs_title: ['Membership Plans'],
    first_tab: {
      monthly_label: ['Billed Monthly'],
      yearly_label: ['Billed Yearly'],
      plan_name: ['Premium'],
      monthly_price: ['47'],
      monthly_price_currency: ['CHF/Month'],
      yearly_price: ['470'],
      yearly_price_currency: ['CHF/Year'],
      free_features_title: ['Talent Features'],
      free_features_sub_title: ['Free Features'],
      free_features_desc: [['Create a personal profile showcasing abilities, performance data, and achievements.']],
      premium_features_title: ['Premium Features'],
      premium_features_desc: [['Full display of the complete talent profile with career stages and performance data.']],
      btn_txt: ['Join Today']
    },
    sec_tab: {
      monthly_label: ['Billed Monthly'],
      yearly_label: ['Billed Yearly'],
      plan_name: ['Multi-Country'],
      monthly_price: ['11'],
      monthly_price_currency: ['CHF/Month'],
      yearly_price: ['110'],
      yearly_price_currency: ['CHF/Yearly'],
      features_title: ['Club/Scout Features'],
      free_features_sub_title: ['Free Features:'],
      free_features_desc: [['Create a personal profile showcasing history, players and sighting information.']],
      premium_features_title: ['Premium Features:'],
      premium_features_desc: [['Access to the complete talent profiles with detailed performance data.']],
      btn_txt: ['Join Today']
    },
    third_tab: {
      monthly_label: ['Billed Monthly'],
      yearly_label: ['Billed Yearly'],
      plan_name: ['Multi-Country'],
      monthly_price: ['11'],
      monthly_price_currency: ['CHF/Month'],
      yearly_price: ['110'],
      yearly_price_currency: ['CHF/Yearly'],
      features_title: ['Club/Scout Features'],
      free_features_sub_title: ['Free Features:'],
      free_features_desc: [['Create a personal profile showcasing history, players and sighting information.']],
      premium_features_title: ['Premium Features:'],
      premium_features_desc: [['Access to the complete talent profiles with detailed performance data.']],
      btn_txt: ['Join Today']
    },
    language: localStorage.getItem('lang'),
    lang_id: localStorage.getItem('lang_id')
  };
  imageLoaded: boolean = false;

  bannerImagePreview: string | ArrayBuffer | null = null;

  constructor(
    private webpages: WebPages,
    public dialogRef: MatDialogRef<AddPricingPageComponent>
  ) {}

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
    console.log(this.formData);  // Log the data to check its structure
  
    for (const key in this.formData) {
      if (Array.isArray(this.formData[key])) {
        // For arrays, append each item with the key as 'key[]'
        this.formData[key].forEach((item: string, index: number) => {
          formData.append(`${key}[]`, item);
        });
      } else if (typeof this.formData[key] === 'object') {
        // For nested objects, iterate through each property and append them with the desired format
        for (const nestedKey in this.formData[key]) {
          if (Array.isArray(this.formData[key][nestedKey])) {
            // If it's an array, append each item with the proper index
            this.formData[key][nestedKey].forEach((item: string, index: number) => {
              formData.append(`${key}[${nestedKey}][]`, item);
            });
          } else {
            // If it's not an array, just append it as a regular key-value pair
            formData.append(`${key}[${nestedKey}]`, this.formData[key][nestedKey]);
          }
        }
      } else {
        // For primitive types, append them directly
        formData.append(key, this.formData[key]);
      }
    }
    
    // Append lang_id to FormData
    formData.append('lang', String(localStorage.getItem('lang_id')));
    
    // Submit the form data
    this.webpages.addPricingPage(formData).subscribe((response) => {
      this.dialogRef.close({ 
        action: "page-added-successfully",
        message: response.message 
      });
    });
  }
  

  getPageById(id: number): void {
    this.webpages.getPageById(id).subscribe((response: any) => {
      if (response.status) {
        const pageData = response.data.pageData;
  
        this.formData = {
          ...this.formData,
          banner_title: pageData.banner_title || 'Default Banner Title', // Example default value if undefined
          page_content: pageData.page_content || 'Default Page Content',
          meta_title: response.data.meta_title || 'Default Meta Title',
          meta_description: response.data.meta_description || 'Default Meta Description',
          slug: response.data.slug || 'default-slug',
          pricing_title: pageData.pricing_title,
          pricing_tabs_title: pageData.pricing_tabs_title,
          first_tab: {
            monthly_label: pageData.first_tab_monthly_label,
            yearly_label: pageData.first_tab_yearly_label,
            plan_name: pageData.first_tab_plan_name,
            monthly_price: pageData.first_tab_monthly_price,
            monthly_price_currency: pageData.first_tab_monthly_price_currency,
            yearly_price: pageData.first_tab_yearly_price,
            yearly_price_currency: pageData.first_tab_yearly_price_currency,
            free_features_title: pageData.first_tab_free_features_title,
            free_features_sub_title: pageData.first_tab_free_features_sub_title,
            free_features_desc: pageData.first_tab_free_features_desc,
            btn_txt: pageData.first_tab_btn_txt,
            premium_features_title: pageData.first_tab_premium_features_title || 'Premium Features', // Add missing field
            premium_features_desc: pageData.first_tab_premium_features_desc || [], // Default to empty array
          },
          sec_tab: {
            monthly_label: pageData.sec_tab_monthly_label,
            yearly_label: pageData.sec_tab_yearly_label,
            plan_name: pageData.sec_tab_plan_name,
            monthly_price: pageData.sec_tab_monthly_price,
            monthly_price_currency: pageData.sec_tab_monthly_price_currency,
            yearly_price: pageData.sec_tab_yearly_price,
            yearly_price_currency: pageData.sec_tab_yearly_price_currency,
            free_features_sub_title: pageData.sec_tab_free_features_sub_title,
            free_features_desc: pageData.sec_tab_free_features_desc,
            btn_txt: pageData.sec_tab_btn_txt,
            features_title: pageData.sec_tab_features_title || 'Features', // Add missing field
            premium_features_title: pageData.sec_tab_premium_features_title || 'Premium Features', // Add missing field
            premium_features_desc: pageData.sec_tab_premium_features_desc || [], // Default to empty array
          },
          third_tab: {
            monthly_label: pageData.third_tab_monthly_label,
            yearly_label: pageData.third_tab_yearly_label,
            plan_name: pageData.third_tab_plan_name,
            monthly_price: pageData.third_tab_monthly_price,
            monthly_price_currency: pageData.third_tab_monthly_price_currency,
            yearly_price: pageData.third_tab_yearly_price,
            yearly_price_currency: pageData.third_tab_yearly_price_currency,
            free_features_sub_title: pageData.third_tab_free_features_sub_title,
            free_features_desc: pageData.third_tab_free_features_desc,
            btn_txt: pageData.third_tab_btn_txt,
            features_title: pageData.third_tab_features_title || 'Features', // Add missing field
            premium_features_title: pageData.third_tab_premium_features_title || 'Premium Features', // Add missing field
            premium_features_desc: pageData.third_tab_premium_features_desc || [], // Default to empty array
          },
          page_type: response.data.page_type,
        };

        console.log(this.formData)
        // Update banner image preview
        this.bannerImagePreview = response.data.base_url + pageData.banner_img;
      }
    });
  }
  

  // Add feature for the second tab (premium features)
  addSecTabPremiumFeature() {
    if (!this.formData.sec_tab.premium_features_desc) {
      this.formData.sec_tab.premium_features_desc = []; // Ensure it's initialized
    }
    this.formData.sec_tab.premium_features_desc.push('');
  }

  // Remove a feature from the second tab (premium features)
  removeSecTabPremiumFeature(index: number) {
    this.formData.sec_tab.premium_features_desc.splice(index, 1);
  }

  // Add feature for the first tab (free features)
  addSecTabDescFeature() {
    if (!this.formData.sec_tab.free_features_desc) {
      this.formData.sec_tab.free_features_desc = []; // Ensure it's initialized
    }
    this.formData.sec_tab.free_features_desc.push('');
  }

  // Remove a feature from the first tab (free features)
  removeSecTabDescFeature(index: number) {
    this.formData.sec_tab.free_features_desc.splice(index, 1);
  }

  addFirstTabDescFeature(): void {
    this.formData.first_tab.free_features_desc.push([]);
  }

  removeFirstTabDescFeature(index: number): void {
    this.formData.first_tab.free_features_desc.splice(index, 1);
  }

  add_premium_features_desc(): void {
    this.formData.first_tab.premium_features_desc.push([]);
  }

  remove_premium_features_desc(index: number): void {
    this.formData.first_tab.premium_features_desc.splice(index, 1);
  }


  // Add feature for the second tab (premium features)
  addThirdTabPremiumFeature() {
    if (!this.formData.third_tab.premium_features_desc) {
      this.formData.third_tab.premium_features_desc = []; // Ensure it's initialized
    }
    this.formData.third_tab.premium_features_desc.push('');
  }

  // Remove a feature from the thirdond tab (premium features)
  removeThirdTabPremiumFeature(index: number) {
    this.formData.third_tab.premium_features_desc.splice(index, 1);
  }

  // Add feature for the first tab (free features)
  addThirdTabDescFeature() {
    if (!this.formData.third_tab.free_features_desc) {
      this.formData.third_tab.free_features_desc = []; // Ensure it's initialized
    }
    this.formData.third_tab.free_features_desc.push('');
  }

  // Remove a feature from the first tab (free features)
  removeThirdTabDescFeature(index: number) {
    this.formData.third_tab.free_features_desc.splice(index, 1);
  }
}
