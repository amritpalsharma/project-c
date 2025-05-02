import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {

  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    private userServices: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  theme : any = localStorage.getItem('theme');
  role: string = '';
  paymentType: string = '';

  popupData: any;
  title : string = '';
  description: any;

  ngOnInit(){
    this.theme = localStorage.getItem('theme');
    this.title = this.data.title;
    this.description = this.data.description;
    // this.getUserPopups();
  }


  getUserPopups(){
    try {
      // let params = {
      //   lang: localStorage.getItem('lang_id')
      // };

      let data = {
        role : this.role,
        payment_type: this.paymentType
      }
      this.userServices.getUserPopups(data).subscribe((response) => {
        if (response && response.status) {
          console.info('this.popups', response.data);
          this.popupData = response.data.popups[0];
          this.title = this.popupData.title;
          this.description = this.popupData.description;
        } else {
          // this.highlights = [];
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  close(){
    this.dialogRef.close();
  }
}
