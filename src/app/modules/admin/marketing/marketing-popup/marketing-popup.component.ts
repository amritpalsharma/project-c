import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import { Editor } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MarketingService } from '../../../../services/marketing.service';
@Component({
  selector: 'app-marketing-popup',
  templateUrl: './marketing-popup.component.html',
  styleUrls: ['./marketing-popup.component.scss']
})
export class MarketingPopupComponent {

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE)); 

  editor!: Editor;
  html = '';
  // selectedRole:number = 2;
  
  // roles:any = [];
  // langs:any = [];
  // locations:any = [];
  colorPresets :any = environment.colors;

  title:any = "";
  selectedRole: any = [];
  selectedLang:any = 1;
  selectedLocation:any = 1;
  selectedFrequency:any = 'Once a day';
  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  popupIdToEdit: any = '';
  options: any[] = [];
  langs:any = environment.langs;
  locations:any = environment.domains;
  frequency:any = ['Once a day', 'Once a week', 'Once 2 Hrs', 'Twice a day', 'Once a month', 'One time only'];
  startDate:any = "";
  endDate:any = "";
  error:boolean = false
  errorMsg:any = {}
  constructor(
    public dialogRef: MatDialogRef<MarketingPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private marketingApi: MarketingService
  ) {

  } 

  ngOnInit(): void {

    this._locale.set('fr');
    this._adapter.setLocale(this._locale());
    
    this.editor = new Editor();

    this.marketingApi.getRolePaymentTypes().subscribe((response)=>{
      if (response && response.status) {
        this.options = response.data.userTypes;
        // let allOption:any = [{id:'0', role_name:'All'}];
        // this.options = [...allOption, ...this.options];  // Merges both arrays
        if(!this.data){
          this.selectedRole = [this.options[0].id];
        }
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });     
    
    console.log(this.data)
    if(this.data){
      this.popupIdToEdit = this.data.id;
      this.title = this.data.title
      this.html = this.data.description
      this.selectedLang = parseInt(this.data.language)
      this.selectedLocation = parseInt(this.data.location)
      this.selectedFrequency = this.data.frequency
      this.startDate = this.data.start_date
      this.endDate = this.data.end_date;
      // this.selectedRole = [this.data.popupfor]

      let selectedRoleData = JSON.parse(this.data.popupfor);
      for(let row of selectedRoleData){
        if(row.user_role){
          this.selectedRole.push(String(row.id))
        }
      }
    }

    
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  close() {
    console.log('Close button clicked');
    this.dialogRef.close();
  }

  onClickOutside() {
    // console.log('Clicked outside the dialog');
   // this.dialogRef.close();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>, type:any): void {
    const selectedDate = event.value;
    console.log(selectedDate)
    let date = this.formatDate(selectedDate);
    if(type == "startDate"){
      this.startDate = date;
    }else if(type == "endDate"){
      this.endDate = date;
    }
  }

  formatDate(date:any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validateForm(){

    this.error = false;
    this.errorMsg = {};
    
    if(this.title == ""){
      this.error = true;
      this.errorMsg.title = "Title is required";
    }
    if(this.html == "" || this.html == "<p></p>"){
      this.error = true;
      this.errorMsg.html = "Content is required";
    }
    if(this.startDate == "" || this.endDate == ""){
      this.error = true;
      this.errorMsg.dateRange = "Date range is required";
    }
    return this.error;
  }

  createPopup():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }

    let params:any = {}

    params.title = this.title;
    params.description = this.html;
    params.popup_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.frequency = this.selectedFrequency;
    params.start_date = this.startDate;
    params.end_date = this.endDate;
    params.status  = 1; // 1 for active, 2 for inactive
    

    this.marketingApi.addPopups(params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'popupAdded'
        });
        // this.popups = response.data.popups;
        // this.paginator.length = response.data.totalCount;
        // this.isLoading = false;
        
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }
 
  updatePopup():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }

    let params:any = {}

    params.title = this.title;
    params.description = this.html;
    params.popup_for = this.selectedRole;
    params.language = this.selectedLang;
    params.location = this.selectedLocation;
    params.frequency = this.selectedFrequency;
    params.start_date = this.startDate;
    params.end_date = this.endDate;
    params.status  = 1; // 1 for active, 2 for inactive
    
    this.marketingApi.updatePopups(this.popupIdToEdit, params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'popupUpdated'
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }

  onSelectionChange(event: any) {
    console.log('Selected roles:', this.selectedRole);  // Updated values
    console.log('Change event:', event);  // Full event details
  }
}
