import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ScoutService } from '../../../../services/scout.service';
import { EditTransferDetailsComponent } from '../../edit-transfer-details/edit-transfer-details.component';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from '../../delete-popup/delete-popup.component';
import { AddTransferComponent } from './add-transfer/add-transfer.component';

@Component({
  selector: 'scout-transfers-tab',
  templateUrl: './transfers-tab.component.html',
  styleUrl: './transfers-tab.component.scss',
})
export class TransfersTabComponent {
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
  constructor(private route: ActivatedRoute, private scoutService: ScoutService, private router: Router ,public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      this.getUserTransfers();
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

  getUserTransfers(){
    try {
      this.scoutService.getTransferData().subscribe((response)=>{
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

  
  getAllTeams(){
    this.scoutService.getTeams().subscribe((data) => {
      this.teams = data;
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

  openEditDialog(transfer: any) {  
    
    const dialogRef = this.dialog.open(EditTransferDetailsComponent, {
      width: '800px',
      data: {
        transfer : transfer,
        teams : this.teams
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Transfer updated:', result);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  openAddDialog() {  
    // Get only the first 200 teams
    const limitedTeams = this.teams.slice(0, 100);
    const dialogRef = this.dialog.open(AddTransferComponent, {
      width: '800px',
      data: {
        transfer : {
          "team_to": "",
          "team_from": "",
          "session": "",
          "date_of_transfer": ""
      },
        teams : limitedTeams
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Transfer updated:', result);
        this.getUserTransfers();
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  deleteTransfer(transferId: number) {
    this.scoutService.deleteTransfer(transferId).subscribe(
      response => {
        console.log('Transfer Deleted successfully:', response);
        // Refresh the transfers list or take other actions
        this.getUserTransfers();
      },
      error => {
        console.error('Error Deleting transfer:', error);
      }
    );
  }
  
  
  openDeleteDialog(id:any) {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If result is true, proceed with deletion logic
        this.deleteTransfer(id);
      } else {
        console.log('User canceled the delete');
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
