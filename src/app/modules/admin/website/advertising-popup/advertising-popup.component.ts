import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AdvertisementService } from '../../../../services/advertisement.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../services/webpages.service';
@Component({
  selector: 'app-AdvertisingPopupComponent',
  templateUrl: './advertising-popup.component.html',
  styleUrl: './advertising-popup.component.scss'
})
export class AdvertisingPopupComponent {

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));

  typeOptions: any = [];

  pageOptions: any = [];
  idToEdit: any = '';
  name: any = "";
  redirect: any = "";
  type: any = "";
  page: any = "";
  startDate: any = new Date();
  endDate: any = null;
  noEndDate: any = false;
  disableEndDate: boolean = false;
  maxViews: any = "";
  maxClicks: any = "";
  imageToUpload: any = "";
  error: boolean = false
  errorMsg: any = {}


  nameRequired: string = '';
  typeRequired: string = '';
  pageRequired: string = '';
  imageRequired: string = '';
  endDateRequired: string = '';
  maxClicksRequired: string = '';
  maxViewsRequired: string = '';
  redirectrequired: string = '';


  today: Date = new Date();

  languages: any = localStorage.getItem('languages');
  selectedLanguage: any = "";

  typeForView: any = "";
  pageName: any = "";
  imageUrl: any = null;
  constructor(
    public dialogRef: MatDialogRef<AdvertisingPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private advertisementService: AdvertisementService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private webPages: WebPages
  ) { }

  ngOnInit(): void {

    this.startDate = this.formatDate(this.startDate);

    this._locale.set('fr');
    this._adapter.setLocale(this._locale());
    this.getAdvertisement();
    this.languages = JSON.parse(this.languages);

    if (this.data.action == "update" || this.data.action == "view") {
      console.log(this.data.ad);
      let existingRecord = this.data.ad;

      this.idToEdit = existingRecord.id;
      this.name = existingRecord.title;
      this.redirect = existingRecord.redirect_url;
      this.type = existingRecord.type;
      this.page = existingRecord.page_id;
      this.startDate = existingRecord.valid_from;
      this.endDate = existingRecord.valid_to;
      this.noEndDate = existingRecord.no_validity;
      this.imageUrl = existingRecord.featured_image;
      this.imageToUpload = existingRecord.featured_image;
      if (this.noEndDate == '0') {
        this.disableEndDate = false;
        this.noEndDate = false;
      } else {
        this.disableEndDate = true;
        this.noEndDate = true;
      }

      this.maxViews = existingRecord.views;
      this.maxClicks = existingRecord.clicks;




      /* for view only*/

      // this.typeForView = this.type.split('-')[0];
      // let index = this.pageOptions.findIndex((x:any) => x.id == this.page);
      // this.pageName = this.pageOptions[index].page;

    }

    // this.onChange();

    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getAdvertisement(): void {
    this.advertisementService.getPageAds().subscribe((response) => {
      let { pages } = response.data;
      console.log('pages', pages)

      this.pageOptions = pages.map((value: any) => {
        return {
          id: value.id,
          page: value.title
        }
      });

      this.onChange();
    });
  }

  onDateChange(dateType: any, event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    let date = this.formatDate(selectedDate);
    if (dateType == 'start') {
      this.startDate = date;
      this.endDate = null;
    } else if (dateType == 'end') {
      this.endDate = date;
    }
    console.log(date)
  }

  formatDate(date: any) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onNoEndDateChange(event: any): void {
    const checked = event.target.checked;
    this.endDate = null
    console.log(checked)
    if (checked) {
      this.disableEndDate = true;
    } else {
      this.disableEndDate = false;
    }

    console.log(this.startDate, this.endDate)
  }

  imagePreview: any = null;

  onImageChange(event: Event): void {
    this.error = false;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let fileToUpload = input.files[0];
      this.imageToUpload = fileToUpload;
      // console.log("fileToUpload", fileToUpload)

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(fileToUpload);
    }

    this.validateAdvertisementForm();
  }

  closeImage() {
    this.imagePreview = null;
    this.imageUrl = null;
    this.imageToUpload = '';
  }

  selectedDate() {
    const todayDate = new Date(this.today);
    const startDate = new Date(this.startDate);

    return todayDate > startDate ? this.today : this.startDate;
  }


  isValidURL(url : string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)" + // Protocol (http or https)
    "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // Domain name
    "localhost|" + // Allow localhost
    "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|" + // IP address
    "\\[?[a-fA-F\\d:]+\\]?)" + // IPv6
    "(\\:\\d+)?" + // Port
    "(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // Path
    "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // Query string
    "(\\#[-a-zA-Z\\d_]*)?$", // Fragment/hash
    "i"
  );

  return pattern.test(url);
}


validateAdvertisementForm(){

  this.error = false;
  this.errorMsg = {};

  if (this.name == "") {
    this.error = true;
    // this.errorMsg.name = "Name is required";
    this.errorMsg.name = this.nameRequired;
  }
  if (this.redirect == "" || !this.isValidURL(this.redirect)) {
    this.error = true;
    this.errorMsg.redirect = this.redirectrequired;
  }

  if (this.type == "") {
    this.error = true;
    // this.errorMsg.type = "Type is required";
    this.errorMsg.type = this.typeRequired;
  }

  if (this.page == "") {
    this.error = true;
    // this.errorMsg.page = "Page is required";
    this.errorMsg.page = this.pageRequired;
  }

  if (this.imageToUpload == "" && !this.imagePreview) {
    this.error = true;
    // this.errorMsg.image = "image is required";
    this.errorMsg.image = this.imageRequired;
  }

  if ((this.endDate == "0000-00-00" || !this.endDate) && !this.disableEndDate) {
    this.error = true;
    // this.errorMsg.endDate = "enter the end date or check the box";
    this.errorMsg.endDate = this.endDateRequired;
  }

  if (this.maxViews == "") {
    this.error = true;
    // this.errorMsg.maxViews = "Max views is required";
    this.errorMsg.maxViews = this.maxViewsRequired;
  }

  if (this.maxClicks == "") {
    this.error = true;
    // this.errorMsg.maxClicks = "Max clicks is required";
    this.errorMsg.maxClicks = this.maxClicksRequired;
  }
  return this.error;

}

createAd():any {

  let validForm: any = this.validateAdvertisementForm();
  if (validForm) {
    return false;
  }
  let formdata = new FormData();
  if (this.imageToUpload != "") {
    formdata.append("featured_image", this.imageToUpload);
  }
  formdata.append("title", this.name);
  formdata.append("redirect_url", this.redirect);
  formdata.append("type", this.type);
  formdata.append("page_id", this.page);
  formdata.append("valid_from", this.startDate);

  if (this.noEndDate) {
    formdata.append("no_validity", '1');
  } else {
    formdata.append("valid_to", this.endDate);
  }
  formdata.append("status", '2');
  formdata.append("views", this.maxViews);
  formdata.append("clicks", this.maxClicks);

  this.advertisementService.createAd(formdata).subscribe(
    response => {
      if (response.status) {
        this.dialogRef.close({
          action: 'added',
          message: response.message
        });
      } else if (response.data?.error) {
        this.errorMsg = response.data.error
      } else {
        this.toastr.error(response.message, 'Ad Not Created');
      }
    },
    error => {
      console.error('Error publishing coupon:', error);
    }
  );
}

updateAd():any {

  // if(this.imageToUpload == '' && this.imageUrl){
  //   this.dialogRef.close();
  //   return;
  // }


  let validForm: any = this.validateAdvertisementForm();
  if (validForm) {
    return false;
  }
  let formdata = new FormData();
  if (this.imageToUpload != "") {
    formdata.append("featured_image", this.imageToUpload);
  }
  formdata.append("title", this.name);
  formdata.append("redirect_url", this.redirect);
  formdata.append("type", this.type);
  formdata.append("page_id", this.page);
  formdata.append("valid_from", this.startDate);

  if (this.noEndDate) {
    formdata.append("no_validity", '1');
  } else {
    formdata.append("valid_to", this.endDate);
  }
  formdata.append("status", '2');
  formdata.append("views", this.maxViews);
  formdata.append("clicks", this.maxClicks);

  this.advertisementService.updateAd(this.idToEdit, formdata).subscribe(
    response => {
      if (response.status) {
        console.log(response.message);
        this.toastr.success(response.message, 'Ad Updated');
        this.dialogRef.close({
          action: 'updated',
          message: response.message
        });
      } else {
        this.errorMsg = response.message
        this.toastr.error(response.message, 'Error');
      }
    },
    error => {
      console.error('Error publishing ad:', error);
      this.toastr.error(error, 'Error');
    }
  );
}

onChange(){
  // if(this.page && this.selectedLanguage){
  if (this.page) {
    console.log("updated page", this.page, this.typeOptions);
    this.advertisementService.getAdvertisementType(this.page).subscribe((response) => {
      let adsTypes = response.data.ad_types;
      if (adsTypes) {
        this.typeOptions = adsTypes;
      } else {
        this.typeOptions = [];
      }
    });
  }
  else {
    this.typeOptions = [];
  }
}

getToasterMsg() {
  this.translateService.get(['nameRequired', 'typeRequired', 'pageRequired', 'imageRequired', 'endDateRequired', 'maxViewsRequired', 'maxClicksRequired', 'redirectrequired']).subscribe((translations) => {
    this.nameRequired = translations['nameRequired'];
    this.typeRequired = translations['typeRequired'];
    this.pageRequired = translations['pageRequired'];
    this.imageRequired = translations['imageRequired'];
    this.endDateRequired = translations['endDateRequired'];
    this.maxViewsRequired = translations['maxViewsRequired'];
    this.maxClicksRequired = translations['maxClicksRequired'];
    this.redirectrequired = translations['redirectrequired'];
  });
}
}


