import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TalentService } from '../../../../services/talent.service';
import { EditTransferDetailsComponent } from '../../edit-transfer-details/edit-transfer-details.component';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from '../../delete-popup/delete-popup.component';
import { AddTransferComponent } from './add-transfer/add-transfer.component';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GlobalSettingsService } from '../../../../services/global-settings.service';

@Component({
  selector: 'talent-transfers-tab',
  templateUrl: './transfers-tab.component.html',
  styleUrl: './transfers-tab.component.scss',
})
export class TransfersTabComponent {
  baseUrl: string = 'https://api.socceryou.ch/uploads/logos/';
  defaultDate: Date = new Date(2023, 4, 21); // May 21, 2023
  userId: any = '';
  userTransfers: any = [];
  editableId: string = "";
  teams: any = [];
  dataTOBeUpdated: any = {
    team_from: "",
    team_to: "",
    session: "",
    date_of_transfer: ""
  }
  theme: string = localStorage.getItem('theme') || 'light';
  seasons: any = [];
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private talentService: TalentService,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService,
    public globalSettings: GlobalSettingsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getUserTransfers();
    });
    this.translate.onLangChange.subscribe((event) => {
      this.getUserTransfers();
    });
    this.getSeasonsOptions();
    this.getAllTeams();

    this.themeChanged();

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });
  }

  getSeasonsOptions() {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    // Populate the years array from startYear to currentYear
    for (let year = startYear; year <= currentYear; year++) {
      this.seasons.push(year);
    }
  }

  getUserTransfers() {
    this.isLoading = true;
    try {
      this.talentService.getTransferData().subscribe((response) => {
        if (response && response.status && response.data) {
          this.userTransfers = response.data.transferDetail;
          this.isLoading = false;
        } else {
          this.userTransfers = [];
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }


  getAllTeams() {
    this.talentService.getTeams().subscribe((data) => {
      this.teams = data;
    });
  }

  editPerformance(performanceId: any) {
    this.editableId = performanceId;
    let index = this.userTransfers.findIndex((x: any) => x.id == performanceId);
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
        transfer: transfer,
        teams: this.teams
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserTransfers();
      } else {
        this.getUserTransfers();
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
        transfer: {
          "team_to": "",
          "team_from": "",
          "session": "",
          "date_of_transfer": ""
        },
        teams: limitedTeams
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Transfer updated:', result);
        this.getUserTransfers();
      } else {
        this.getUserTransfers();
        console.log('User canceled the edit');
      }
    });
  }

  deleteTransfer(transferId: number) {
    this.talentService.deleteTransfer(transferId).subscribe(
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


  openDeleteDialog(id: any) {
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

  onSelectChange(event: Event, key: string): void {
    const selectElement = event.target as HTMLSelectElement;
    this.updateRow(key, Number(selectElement.value));
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    let date = this.formatDate(selectedDate);
    this.updateRow('date_of_transfer', date);
  }

  onInputChange(event: Event, key: string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key, inputElement.value);
  }

  updateRow(key: any, value: any) {
    this.dataTOBeUpdated[key] = value;

    console.log(this.dataTOBeUpdated);
  }

  formatDate(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  navigatePlans() {
    this.router.navigate(['/talent/plans']);
  }

  showVerificationPopup() {
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
  }

  themeChanged() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    this.theme = currentTheme;
    if (this.theme == null || this.theme == undefined) {
      this.theme = 'light';
    }
  }
}
