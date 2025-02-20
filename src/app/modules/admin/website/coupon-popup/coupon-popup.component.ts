import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import { CouponService } from '../../../../services/coupon.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CommonDataService } from '../../../../services/common-data.service';
@Component({
  selector: 'app-templates',
  templateUrl: './coupon-popup.component.html',
  styleUrl: './coupon-popup.component.scss'
})
export class CoupenPopupComponent   {

  startDate: Date | null = null;
  endDate: Date | null = null;

  type: any = "";
  name: any = "";
  code: any = "";
  discount: any = "";
  validBetween: any = "";
  noEndDate: boolean = false;
  isLimitedUse: boolean = false;
  limit: any = ""
  isSingleUsePerCustomer: boolean = false;
  disableEndDate:boolean = false;
  error:boolean = false
  errorMsg:any = {}
  discountInputs: Array<{ discount: string; currency: string }> = []; // For $ Discounts
  currencies: string[] = []; // Add more currencies as needed

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE)); 

  constructor(
    public dialogRef: MatDialogRef<CoupenPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private couponService: CouponService,private commonService:CommonDataService
  ) {}

  ngOnInit(): void {
    this.resetDiscountInputs(); // Initialize inputs

    this._locale.set('fr');
    this._adapter.setLocale(this._locale()); 

    if(this.data.action == "update"){

      let existingRecord = this.data.couponData;
      if(existingRecord.discount_type == "amount_off"){
        this.type = 'amount';
      }else if(existingRecord.discount_type == "percent_off"){
        this.type = 'percent';
      }
      
      this.name = existingRecord.title; 
      this.code = existingRecord.coupon_code;
      this.discount = existingRecord.discount;
      // this.validBetween =
      this.isLimitedUse = existingRecord.is_limit;
      this.limit = existingRecord.limit;
      this.isSingleUsePerCustomer = existingRecord.limit_per_user;
      this.startDate = existingRecord.valid_from;
      this.endDate = existingRecord.valid_to;
    }
    this.getCurrencies();
  }

  getCurrencies(){
    this.commonService.getAllCurrencies().subscribe(
      response => {
        if (response.status) {
          if(response.data?.currencies){
            this.currencies = response.data?.currencies;
          }
        }
      },
      error => {
        console.error('Error publishing coupon:', error);
      }
    );
  }

  resetDiscountInputs(): void {
    if (this.type === 'amount') {
      this.discountInputs = [{ discount: '', currency: 'USD' }];
    } else {
      this.discount = '';
    }
  }

  addDiscountInput(): void {
    this.discountInputs.push({ discount: '', currency: 'USD' });
  }

  removeDiscountInput(index: number): void {
    if (this.discountInputs.length > 1) {
      this.discountInputs.splice(index, 1);
    }
  }


  validateCouponForm(): boolean {
    this.error = false;
    this.errorMsg = {};

    if (!this.type) {
      this.error = true;
      this.errorMsg.type = "Type is required";
    }

    if (this.type === 'percent' && !this.discount) {
      this.error = true;
      this.errorMsg.discount = "Discount (%) is required";
    }

    if (this.type === 'amount') {
      const hasValidDiscount = this.discountInputs.some(d => d.discount && d.currency);
      if (!hasValidDiscount) {
        this.error = true;
        this.errorMsg.discountInputs = "At least one $ Discount with currency is required";
      }
    }

    if (!this.name) {
      this.error = true;
      this.errorMsg.name = "Name is required";
    }

    if (!this.code) {
      this.error = true;
      this.errorMsg.code = "Code is required";
    }

    if (!this.startDate) {
      this.error = true;
      this.errorMsg.startDate = "Start date is required";
    }

    if (this.isLimitedUse && !this.limit) {
      this.error = true;
      this.errorMsg.limit = "Limit is required";
    }
    console.log(this.errorMsg); // Debug: Check the final payload structure

    return this.error;
  }


  // createCoupon(): any {
  //   const validForm: any = this.validateCouponForm();
  //   if (validForm) {
  //     return false;
  //   }

  //   console.log(this.discountInputs)
  //   const params: any = {
  //     title: this.name,
  //     coupon_code: this.code,
  //     discount_type: this.type === "amount" ? "amount_off" : "percent_off",
  //     discount: this.type === "percent" ? Number(this.discount) : undefined,
  //     discount_inputs: this.type === "amount" ? this.discountInputs : undefined,
  //     valid_from: this.startDate,
  //     valid_to: this.noEndDate ? null : this.endDate,
  //     no_validity: this.noEndDate ? 1 : 0,
  //     status: 'published',
  //     is_limit: this.isLimitedUse ? 1 : 0,
  //     limit: this.limit,
  //     limit_per_user: this.isSingleUsePerCustomer ? 1 : 0
  //   };

  //   this.couponService.addPopups(params).subscribe(
  //     response => {
  //       if (response.status) {
  //         this.dialogRef.close({ action: 'popupAdded' });
  //       } else {
  //         this.errorMsg = response.data.error;
  //       }
  //     },
  //     error => {
  //       console.error('Error publishing coupon:', error);
  //     }
  //   );
  // }

  createCoupon(): any {
    const validForm: any = this.validateCouponForm();
    if (validForm) {
      return false;
    }

    // Transform discountInputs into the amounts array
    const amounts = this.discountInputs.map((input: any, index: number) => ({
      [`amounts[${index}][currency]`]: input.currency.toLowerCase(),
      [`amounts[${index}][discount]`]: input.discount,
    }));

    console.log(amounts); // Debug: Check the final payload structure

    // Construct the params in the required format
    const params: any = {
      title: this.name,
      description: `${this.name} description`, // Adding description field
      coupon_code: this.code,
      discount: this.type === "percent" ? Number(this.discount) : undefined,
      discount_type: this.type === "amount" ? "amount_off" : "percent_off",
      valid_from: this.formatDate(this.startDate), // Format as YYYY-MM-DD
      valid_to: this.noEndDate ? undefined : this.formatDate(this.endDate),
      no_validity: this.noEndDate ? 1 : 0,
      status: 'published',
      is_limit: this.isLimitedUse ? 1 : 0,
      limit: this.isLimitedUse ? Number(this.limit) : undefined,
      limit_per_user: this.isSingleUsePerCustomer ? 1 : 0,
      duration: 'forever',
      ...amounts.reduce((acc, curr) => ({ ...acc, ...curr }), {}) // Flatten amounts array
    };

    console.log(params); // Debug: Check the final payload structure

    this.couponService.addPopups(params).subscribe(
      response => {
        if (response.status) {
          this.dialogRef.close({ action: 'popupAdded' });
        } else {
          this.errorMsg = response.data.error;
        }
      },
      error => {
        console.error('Error publishing coupon:', error);
      }
    );
  }

  // Helper function to format dates
  formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  close(): void {
    console.log('Close button clicked');
    this.dialogRef.close();
  }

  // validateCouponForm(){

  //   this.error = false;
  //   this.errorMsg = {};
    
  //   if(this.type == ""){
  //     this.error = true;
  //     this.errorMsg.type = "Type is required";
  //   }
  //   if(this.name == ""){
  //     this.error = true;
  //     this.errorMsg.name = "Name is required";
  //   }
  //   if(this.code == ""){
  //     this.error = true;
  //     this.errorMsg.code = "Code is required";
  //   }
  //   if(this.discount == ""){
  //     this.error = true;
  //     this.errorMsg.discount = "Discount is required";
  //   }
  //   if(this.startDate == ""){
  //     this.error = true;
  //     this.errorMsg.startDate = "Start date is required";
  //   }
  //   if(this.isLimitedUse && this.limit == ""){
  //     this.error = true;
  //     this.errorMsg.limit = "Limit is required";
  //   }
  //   return this.error;

  // }

  // createCoupon():any{

  //   let validForm:any = this.validateCouponForm();
  //   if(validForm){
  //     return false;
  //   }

  //   let params:any = {}
  //   params.title = this.name;
  //   params.coupon_code = this.code;
  //   if(this.type == "amount"){
  //     params.discount_type = 'amount_off';
  //   }else if(this.type == "percent"){
  //     params.discount_type = 'percent_off';
  //   }
  //   params.discount = Number(this.discount);
    
  //   params.valid_from = this.startDate;

  //   if(this.noEndDate){
  //     params.no_validity = 1;
  //   }else{
  //     params.valid_to = this.endDate;
  //   }
  //   params.status = 'published';
    
  //   if(this.isLimitedUse){
  //     params.is_limit = 1;
  //     params.limit = this.limit;
  //   }

  //   if(this.isSingleUsePerCustomer){
  //     params.limit_per_user = 1;
  //   }

  //   // console.log(params)
    
  //   this.couponService.addPopups(params).subscribe(
  //     response => {
  //       if(response.status){
  //         this.dialogRef.close({
  //           action: 'popupAdded'
  //         });
  //       }else{
  //         this.errorMsg = response.data.error
  //       }
  //     },
  //     error => {
  //       console.error('Error publishing coupon:', error);
  //     }
  //   );
  // }

  // onDateChange(dateType: string, event: MatDatepickerInputEvent<Date>): void {
  //   const selectedDate = event.value; // event.value should be a Date
  //   if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
  //     const date = this.formatDate(selectedDate);
  //     if (dateType === 'start') {
  //       this.startDate = date;
  //     } else if (dateType === 'end') {
  //       this.endDate = date;
  //     }
  //     console.log(date);
  //   } else {
  //     console.error('Invalid date:', selectedDate);
  //   }
  // }

  // formatDate(date: any): string {
  //   if (!(date instanceof Date) || isNaN(date.getTime())) {
  //     console.error('Invalid date provided to formatDate:', date);
  //     return '';
  //   }
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }


  onDateChange(field: 'start' | 'end', event: MatDatepickerInputEvent<Date>): void {
    if (field === 'start') {
      this.startDate = event.value;
    } else {
      this.endDate = event.value;
    }
  }

  onNoEndDateChange(event: Event): void {
    this.noEndDate = (event.target as HTMLInputElement).checked;
    if (this.noEndDate) {
      this.endDate = null; // Reset end date
    }
  }

  validateCurrencySelection(index: number): void {
    const selectedCurrency = this.discountInputs[index].currency;
    const otherCurrencies = this.discountInputs
      .filter((_, i) => i !== index)
      .map(input => input.currency);

    if (otherCurrencies.includes(selectedCurrency)) {
      this.errorMsg.duplicateCurrency = `The currency ${selectedCurrency} is already selected.`;
      this.discountInputs[index].currency = ''; // Reset to prevent duplication
    } else {
      this.errorMsg.duplicateCurrency = null;
    }
  }

}
