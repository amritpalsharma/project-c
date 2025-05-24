import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-transfers-tab',
  templateUrl: './transfers-tab.component.html',
  styleUrl: './transfers-tab.component.scss',
})
export class TransfersTabComponent {
  isLoading: boolean = false;
  defaultDate: Date = new Date(2023, 4, 21); // May 21, 2023
  userId: any = '';
  userTransfers: any = [];
  editableId: string = "";
  teams: any = [];
  baseUrl:string='https://api.socceryou.ch/uploads/';
  logoBaseUrl:string='https://api.socceryou.ch/uploads/logos/';
  theme:string=localStorage.getItem('theme') || 'light';

  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  filterTeamsFrom: any[] = [];
  dataTOBeUpdated: any = {
    team_from: "",
    team_to: "",
    session: "",
    date_of_transfer: ""
  }
  seasons: any = [];
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserTransfers(this.userId);
    });
    this.translate.onLangChange.subscribe((event) => {
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
  getUserTransfers(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getTransferData(userId).subscribe((response) => {
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

  // onSearchTeams(): void {

  //   if (this.teamTo.length < 2) {
  //     // Don't search until the user has typed at least 2 characters
  //     this.filterTeams = [];
  //     return;
  //   }

  //   this.talentService.searchTeams(this.teamTo).subscribe(
  //     (response: any) => {
  //       if (response && response.data) {
  //         this.filterTeams = response.data.teams; // Update the list of filtered clubs based on search
  //         console.log('Filtered teams:', this.filterTeams);
  //       }
  //     },
  //     (error: any) => {
  //       console.error('Error fetching teams:', error);
  //     }
  //   );
  // }

  // // Function to handle dynamic fetching of clubs based on search input
  // onSearchTeamsFrom(): void {

  //   if (this.teamFrom.length < 2) {
  //     // Don't search until the user has typed at least 2 characters
  //     this.filterTeamsFrom = [];
  //     return;
  //   }

  //   this.talentService.searchTeams(this.teamFrom).subscribe(
  //     (response: any) => {
  //       if (response && response.data) {
  //         this.filterTeamsFrom = response.data.teams; // Update the list of filtered clubs based on search
  //         console.log('Filtered teams:', this.filterTeamsFrom);
  //       }
  //     },
  //     (error: any) => {
  //       console.error('Error fetching teams:', error);
  //     }
  //   );
  // }

  getAllTeams() {
    this.userService.getAllTeams().subscribe((response) => {
      if (response && response.status && response.data && response.data.teams) {
        this.teams = response.data.teams;
        console.log(this.teams)
      }
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

  updateTransfer(transferId: any) {
    this.userService.updateTransfer(transferId, this.dataTOBeUpdated).subscribe((response) => {
      // console.log(response)
      this.editableId = "";
      if (response.status) {
        this.getUserTransfers(this.userId);
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
}