import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebPages } from '../../../services/webpages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})

export class ContactComponent implements OnInit {
  honeypot:string='';
  apiUrl: any = environment.url;
  disableSentButton: boolean = false;
  base_url: string = '';
  errorTxt: string = '';
  successTxt: string = '';
  phoneRequired: string = '';
  invalidPhoneNumber: string = '';
  requiredFieldsMessage: string = '';
  provideEmailAddress: string = '';
  address: string = '';
  semail: string = '';
  banner_title: string = '';
  club_label_txt: string = '';
  form_title: string = '';
  scout_label_txt: string = '';
  submit_btn_txt: string = '';
  talent_label_txt: string = '';
  txt_before_radio_btn: string = '';
  advertisementList: any;
  advertisemnet_base_url: string = '';
  advertisemnet_new_base_url: string = '';
  messageText: string = '';

  isLoading: boolean = true;
  btnLoading: boolean = false;
  countdown: number = 10;


  captchaKey: string = environment.captchaKey;
  selectedOption = 'option1'; // Default option for some dropdown/radio buttons
  contactForm!: FormGroup; // Form group for the contact form
  isChecked = false; // Checkbox state
  adVisible: boolean[] = [true, true, true, true]; // Array to manage ad visibility
  captchaResolved = false; // Track if captcha is resolved
  recaptchaToken: string | null = null; // Captcha token for backend validation
  responseMessage: string = '';
  messageType: string = '';
  name_placeholder: string = '';
  email_placeholder: string = '';
  phone_placeholder: string = '';
  message_placeholder: string = '';
  showcaptchaError: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private webPages: WebPages,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    // Initialize form with validation rules
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // phone: ['', [
      // Validators.required,
      // Validators.pattern(/^\+?(41|49|39|33|44|34|351|32|45|46)\d{7,}$/)
      // ]],
      // message: ['', Validators.required],
      domain: window.location.hostname,
      lang: localStorage.getItem('lang_id'),
    });
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data)
      this.getToasterMsg();
    });
  }


  isActive: any = {
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard: true,
    banner: true,
    square: true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }
  advertisementData: any = {
    skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    wide_skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    banner: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    small_square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    inline_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
  }

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('contact', languageId).subscribe((res) => {
      if (res.status) {
        this.address = res.data.pageData.address;
        this.banner_title = res.data.pageData.banner_title;
        this.club_label_txt = res.data.pageData.club_label_txt;
        this.form_title = res.data.pageData.form_title;
        this.scout_label_txt = res.data.pageData.scout_label_txt;
        this.submit_btn_txt = res.data.pageData.submit_btn_txt;
        this.talent_label_txt = res.data.pageData.talent_label_txt;
        this.txt_before_radio_btn = res.data.pageData.txt_before_radio_btn;
        this.semail = res.data.pageData.email;
        this.advertisementData = res.data.advertisementData;
        this.advertisementList = res.data.allAdsList;
        // this.advertisementData = [];


        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisemnet_new_base_url = res.data.advertisemnet_new_base_url;
        this.base_url = res.data.base_url;
        this.name_placeholder = res.data.pageData.name_placeholder;
        this.phone_placeholder = res.data.pageData.phone_placeholder;
        this.email_placeholder = res.data.pageData.email_placeholder;
        this.message_placeholder = res.data.pageData.message_placeholder;

        this.isLoading = false;
        this.startCountdown();
      }
    });
  }

  startCountdown() {
    this.countdown = 5; // Reset countdown
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.btnLoading = false; // Stop loading when countdown reaches 0
      }
    }, 1000);
  }

  // Form field getters for template validation
  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get phone() {
    return this.contactForm.get('phone');
  }

  get message() {
    return this.contactForm.get('message');
  }

  onBlur(event: FocusEvent) {
    // Access the value of the textarea and set it if needed
    const textarea = event.target as HTMLTextAreaElement;
    this.messageText = textarea.value; // This is optional since it's already bound via ngModel
  }

  // Handle captcha resolution
  resolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      this.captchaResolved = true;
      this.recaptchaToken = captchaResponse;
      console.log('Captcha resolved:', captchaResponse);
    } else {
      this.captchaResolved = false;
      this.recaptchaToken = null;
      console.log('Captcha not resolved');
    }
  }


  showValidationErrors() {
    Object.keys(this.contactForm.controls).forEach((key) => {
      const controlErrors = this.contactForm.get(key)?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach((errorKey) => {
          let errorMessage = this.getErrorMessage(key, errorKey);
          this.toastr.error(errorMessage, this.errorTxt); // Show each error in a toaster
        });
      }
    });
  }

  getErrorMessage(field: string, errorType: string): string {
    const errorMessages: { [key: string]: any } = {
      email: {
        required: this.provideEmailAddress,
        email: this.provideEmailAddress,
      },
      // phone: {
      //   required: this.phoneRequired,
      //   pattern: this.invalidPhoneNumber,
      // },
    };

    return errorMessages[field]?.[errorType] || this.requiredFieldsMessage;
  }

  // Handle form submission
  onSubmit(): void {
    // return false;
    let role;
    if (this.selectedOption === 'option1') {
      role = 1;
    }
    else if (this.selectedOption === 'option2') {
      role = 2;
    }
    else {
      role = 3;
    }
    if (!this.contactForm.valid) {
      console.log('toched');
      this.contactForm.markAllAsTouched();
    }
    if (this.contactForm.valid && this.captchaResolved && this.recaptchaToken) {

      const formData = { ...this.contactForm.value, captchaToken: this.recaptchaToken };
      const result = {};
      // Send the form data and captcha token to the server
      this.http.post('/api/verify-captcha', formData).subscribe(
        (response) => {

          // console.log('Form submitted successfully:', result);
        },
        (error) => {
          console.error('Error submitting form:', error);
        }
      );
      this.disableSentButton = true;
      const ContactformData = { ...this.contactForm.value, captchaToken: this.recaptchaToken, role: role, message: this.messageText };

      this.http.post<any>(this.apiUrl + '/frontend/save-contact-form', ContactformData).subscribe(
        (response) => {
          // console.log('Form submitted successfully:', response);
          if (response.message != '' && response.data.redirect_url != '') {
            this.setResponseMessage(response.message, response.data.class);
            this.router.navigate(['/' + response.data.redirect_url]);
          } else {
            console.log('something went wrong');
          }
          this.disableSentButton = false;
        },
        (error) => {
          console.error('Error submitting form:', error);
        }
      );

    } else {
      if (!this.captchaResolved) {
        this.showcaptchaError = true;
      }
      if (this.contactForm.invalid) {
        console.error('Form is invalid:', this.contactForm.invalid);
        this.showValidationErrors();
      }
    }
  }

  // Close specific ad
  setResponseMessage(message: string, type: string): void {
    this.responseMessage = message;
    this.messageType = type;

    // Clear message after 3 seconds (optional)
    setTimeout(() => {
      this.responseMessage = '';
      this.messageType = '';
    }, 10000);
  }

  closeAd(object: any) {

    this.isActive[object] = false;

  }

  isEmptyObject(obj: any) {
    if (typeof obj != 'undefined') {
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
  }
  openModal(modalId: string) {
    console.log(`Open modal: ${modalId}`);
    // Implement modal opening logic here
  }


  checkActive(obj: any) {
    if (this.isExists(obj) && this.isFeaturedImageExists(obj) && this.isActive[obj]) {
      return true;
    }
    return false;
  }


  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric input
    }
  }

  preventTextPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text');
    if (!pasteData || !/^\d+$/.test(pasteData)) {
      event.preventDefault(); // Block paste if it contains non-numeric characters
    }
  }

  getToasterMsg() {
    this.translateService.get(['pleaseWait', 'phoneRequired', 'success!', 'error', 'provideEmailAddress', 'invalidPhoneNumber', 'requiredFieldsMessage']).subscribe((translations) => {
      // this.pleaseWait = translations['pleaseWait'];
      this.phoneRequired = translations['phoneRequired'];
      this.provideEmailAddress = translations['provideEmailAddress'];
      this.invalidPhoneNumber = translations['invalidPhoneNumber'];
      this.requiredFieldsMessage = translations['requiredFieldsMessage'];
      // this.uploadingPhotos = translations['uploadingPhotos'];
      this.successTxt = translations['success!'];
      this.errorTxt = translations['errorTxt'];
    });
  }

  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
