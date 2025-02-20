import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-transfers-tab',
  templateUrl: './transfers-tab.component.html',
  styleUrl: './transfers-tab.component.scss',
})
export class TransfersTabComponent {
  isLoading:boolean = false;
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
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserTransfers(this.userId);
    });
    this.getSeasonsOptions();
    this.getAllTeams();
  }

  getSeasonsOptions() {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    // Populate the years array from startYear to currentYear
    for (let year = startYear; year <= currentYear; year++) {
      this.seasons.push(year);
    }
  }
  getUserTransfers(userId:any){
    this.isLoading = true;
    try {
      this.userService.getTransferData(userId).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.userTransfers = response.data.transferDetail;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error); 
    }
  }

  getAllTeams(){
    this.userService.getAllTeams().subscribe((response)=>{
      if (response && response.status && response.data && response.data.teams) {
        this.teams = response.data.teams;
        console.log(this.teams)
      }
    });
  }

  editPerformance(performanceId:any){
    this.editableId = performanceId;
    let index = this.userTransfers.findIndex((x:any) => x.id == performanceId);
    let currentRow = this.userTransfers[index];
    this.defaultDate = currentRow.date_of_transfer;
    this.dataTOBeUpdated = {
      team_from: currentRow.team_from,
      team_to: currentRow.team_to,
      session: currentRow.session,
      date_of_transfer: currentRow.date_of_transfer
    }

    console.log(this.dataTOBeUpdated);
  }

  updateTransfer(transferId:any){
    this.userService.updateTransfer(transferId, this.dataTOBeUpdated).subscribe((response)=>{
      // console.log(response)
      this.editableId = "";
      if(response.status){
        this.getUserTransfers(this.userId);
      }
    }); 
  }

  onSelectChange(event: Event, key:string): void {
    const selectElement = event.target as HTMLSelectElement;
    this.updateRow(key,Number(selectElement.value));
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