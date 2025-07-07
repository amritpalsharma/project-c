import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { tap, catchError } from 'rxjs/operators'; // For storing data after fetching
import { UserRoleService } from '../../../../services/user-role.service';

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
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  logoBaseUrl: string = 'https://api.socceryou.ch/uploads/logos/';
  theme: string = localStorage.getItem('theme') || 'light';

  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  filterTeamsFrom: any[] = [];
  dataTOBeUpdated: any = {
    team_from: "",
    team_to: "",
    session: "",
    date_of_transfer: ""
  }
  seasons: any = [];
  movingTosearch: string = '';
  movingFromsearch: string = '';
  constructor(
    public userRoleService: UserRoleService,
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
    // this.getSeasonsOptions();
    // this.getAllTeams();
  }

  // getSeasonsOptions() {
  //   const startYear = 2000;
  //   const currentYear = new Date().getFullYear();

  //   // Populate the years array from startYear to currentYear
  //   for (let year = startYear; year <= currentYear; year++) {
  //     this.seasons.push(year);
  //   }
  // }
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
  searchKeyword: string = '';
  getAllTeams() {
    // if (this.searchKeyword.length < 2) {
    //   return;
    // }
    this.userService.getAllTeams().subscribe((response) => {
      if (response && response.status && response.data && response.data.teams) {
        this.teams = response.data.teams;
        // console.log(this.teams)
      }
    });
  }

  have_no_club_from: boolean = false;
  have_no_club_to: boolean = false;
  editPerformance(performanceId: any) {

    this.editableId = performanceId;
    let index = this.userTransfers.findIndex((x: any) => x.id == performanceId);
    let currentRow = this.userTransfers[index];
    console.log('currentRow', currentRow)
    if (currentRow.team_name_to && currentRow.team_name_to != '') {
      this.movingTosearch = currentRow.team_name_to;
    }


    this.movingFromsearch = '';

    if (currentRow.team_name_from && currentRow.team_name_from != '') {
      this.movingFromsearch = currentRow.team_name_from;
    }


    if (!currentRow.team_name_to && currentRow.team_to_manual != '') {
      this.have_no_club_to = true;
    }
    if (!currentRow.team_name_from && currentRow.team_from_manual != '') {
      this.have_no_club_from = true;
    }

    this.defaultDate = currentRow.date_of_transfer;
    this.dataTOBeUpdated = {
      team_from: currentRow.team_from,
      team_to: currentRow.team_to,
      session: currentRow.session,
      date_of_transfer: currentRow.date_of_transfer,
      have_no_club_to: this.have_no_club_to,
      have_no_club_from: this.have_no_club_from,
    }
    if (this.have_no_club_from && this.have_no_club_to) {
      this.dataTOBeUpdated = {
        team_from: currentRow.team_from,
        team_to: currentRow.team_to,
        session: currentRow.session,
        date_of_transfer: currentRow.date_of_transfer,
        have_no_club_to: this.have_no_club_to,
        have_no_club_from: this.have_no_club_from,
        team_from_manual: currentRow.team_from_manual,
        team_to_manual: currentRow.team_to_manual,
        team_to_m_country_id: currentRow.team_to_m_country_id,
        team_from_m_country_id: currentRow.team_from_m_country_id
      }
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
    this.updateRow(key, (selectElement.value));
  }

  onInputValueChange(event: any, key: string) {
    const value = event.target.value;
    // this.transferData[field] = value;
    this.updateRow(key, value);
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

  get reversedSeasons(): string[] {
    let sessionArr = [
      '25/26',
      '24/25',
      '23/24',
      '22/23',
      '21/22',
      '20/21',
      '19/20',
      '18/19',
      '17/18',
      '16/17',
      '15/16',
      '14/15',
      '13/14',
      '12/13',
      '11/12',
      '10/11',
      '09/10',
      '08/09',
      '07/08',
      '06/07',
      '05/06',
      '04/05',
      '03/04',
      '02/03',
      '01/02'
    ];
    return sessionArr;
  }
  selectedTeam: any;
  // selectTeam(team: any) {
  //   this.selectedTeam = team.team_name + ' - ' + team.team_type;
  //   console.log('Selected team:', this.selectedTeam); // This will log the full selected team object
  //   this.teams = [];
  // }

  filteredTeams: any;
  filteredTeamsMovingTo: any;
  filteredTeamsMovingFrom: any;
  suggestTeamsMovingTo() {
    this.suggestTeams(this.movingTosearch, 'moving_to');
  }
  suggestTeamsMovingFrom() {
    this.suggestTeams(this.movingFromsearch, 'moving_from');
  }
  suggestTeams(keyword: any, search_for: string): void {
    // let inputElement = event.target as HTMLInputElement;
    // let keyword = inputElement.value;
    if (keyword.length < 2) {
      return;
    }
    this.userService.searchTeams(keyword).subscribe((response) => {
      if (response && response.status && response.data && response.data.teams) {
        if (search_for == 'moving_to') {
          this.filteredTeamsMovingTo = response.data.teams;
        } else if (search_for == 'moving_from') {
          this.filteredTeamsMovingFrom = response.data.teams;
        }
      }
    });
  }
  inputValue: string = '';
  selectTeam(teamId: any, name: any, team_type: any, type: string) {
    if (type == 'moving_to') {
      this.updateRow('team_name_to', name + ' - ' + team_type);
      this.filteredTeamsMovingTo = [];
      this.movingTosearch = name + ' - ' + team_type;
    }

    if (type == 'moving_from') {
      this.updateRow('team_name_from', name + ' - ' + team_type);
      this.filteredTeamsMovingFrom = [];
      this.movingFromsearch = name + ' - ' + team_type;
    }
    // this.inputValue = name + ", " + country;
    // this.updateRow('team_id', teamId);
    // this.filteredTeams = [];
  }

}