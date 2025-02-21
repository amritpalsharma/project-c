import { Component, Input } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'view-user-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrl: './transfer-details.component.scss'
})
export class TransferDetailsComponent {

  defaultDate: Date = new Date(2023, 4, 21); // May 21, 2023
  userId: any = '';
  userTransfers: any = [];
  editableId: string = "";
  teams:any = [];
  dataTOBeUpdated:any = {
    team_from: "",
    team_to: "",
    session: "",
    date_of_transfer: ""
  }
  seasons:any = [];
  constructor(private route: ActivatedRoute, private talentService: TalentService, private router: Router ,public dialog: MatDialog) { }
  @Input() isPremium: any;
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      if(this.isPremium){
        this.getUserTransfers(this.userId);
      }
    });
    this.getSeasonsOptions();
  }

  getSeasonsOptions() {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    // Populate the years array from startYear to currentYear
    for (let year = startYear; year <= currentYear; year++) {
      this.seasons.push(year);
    }
  }

  getUserTransfers(id:any){
    try {
      this.talentService.getViewTransferData(id).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.userTransfers = response.data.transferDetail;
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error); 
    }
  }


  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    let date = this.formatDate(selectedDate);
    this.updateRow('date_of_transfer',date);
  }

  onInputChange(event: Event, key:string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key,inputElement.value);
  }

  updateRow(key:any, value:any){
    this.dataTOBeUpdated[key] = value;

    console.log(this.dataTOBeUpdated);
  }

  formatDate(date:any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


