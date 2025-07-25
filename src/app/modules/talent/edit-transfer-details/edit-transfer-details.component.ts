import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { WebPages } from '../../../services/webpages.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-edit-transfer-details',
  templateUrl: './edit-transfer-details.component.html',
  styleUrls: ['./edit-transfer-details.component.scss']
})
export class EditTransferDetailsComponent {
  teams: any;  // Assume you get this data from a service
  transfer: any;  // Assume you get this data from a service

  teamTo: string = ''; // Initialize as empty string to avoid undefined issues
  teamToId: any;
  teamFrom: string = ''; // Initialize as empty string to avoid undefined issues
  teamFromId: any;
  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  filterTeamsFrom: any[] = []; // Initialize as empty array to avoid undefined issues
  isLoading: boolean = false;
  readonly date = new FormControl(moment());
  date_of_transfer: FormControl = new FormControl(null);
  pleaseWait: string = '';
  Processing: string = '';
  successTxt: string = '';
  requiredFieldsMessage: string = '';
  isLoadingModel: boolean = true;

  sessionArr: any = [
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

  nationFilterCtrl = new FormControl('');
  nationFilterCtrl2 = new FormControl('');
  displayedCountries: any;
  displayedCountries2: any;
  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EditTransferDetailsComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    public webPages: WebPages,
  ) {
    this.loadCountries();
  }

  theme: any = localStorage.getItem('theme');
  countries: any = [];
  is_team_to_manual: boolean = false;
  is_team_from_manual: boolean = false;
  team_to_manual: string = '';
  team_from_manual: string = '';
  team_to_m_country_id: number = 0;
  team_from_m_country_id: number = 0;

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    // You might want to load your teams from a service here
    this.teams = this.data.teams;
    this.transfer = this.data.transfer;

    if (this.transfer.team_to_manual != '' && !this.transfer.team_to) {
      // this.is_team_to_manual = true;
      this.team_to_manual = this.transfer.team_to_manual;
      this.team_to_m_country_id = this.transfer.team_to_m_country_id;
      this.is_team_to_manual = true;
    }

    if (this.transfer.team_from_manual != '' && !this.transfer.team_from) {
      this.team_from_manual = this.transfer.team_from_manual;
      this.team_from_m_country_id = this.transfer.team_from_m_country_id;
      this.is_team_from_manual = true;
    }

    // if (this.transfer?.country_name_to_manual && this.transfer?.country_name_to_manual != '' && this.transfer?.team_to_manual && this.transfer?.team_to_manual != '') {
    //   this.is_team_to_manual = true;
    // } else {
    //   this.is_team_to_manual = false;
    // }




    this.date_of_transfer = new FormControl(
      this.transfer.date_of_transfer ? new Date(this.transfer.date_of_transfer) : null
    );
    this.date_of_transfer.setValue(this.transfer.date_of_transfer ? new Date(this.transfer.date_of_transfer) : null);
    console.log('transfer', this.transfer)
    if (this.transfer.team_name_to && typeof this.transfer.team_name_to != undefined && this.transfer.team_name_to != null && this.transfer.team_name_to != '') {
      // this.is_team_to_manual = true;
      this.teamTo = this.transfer.team_name_to + ' - ' + this.transfer.team_type_to; // Set the selected team's name to the input
    }
    if (this.transfer.team_name_from && typeof this.transfer.team_name_from != undefined && this.transfer.team_name_from != null && this.transfer.team_name_from != '') {
      this.teamFrom = this.transfer.team_name_from + ' - ' + this.transfer.team_type_from; // Set the selected team's name to the input
    }

    if (this.transfer?.team_to_manual && this.transfer?.team_to_manual != '' && this.transfer?.country_name_to_manual && this.transfer?.country_name_to_manual != '') {
      this.is_team_to_manual = true;
      // this.onNoMoveToTeam(this.is_team_to_manual);
    } else {
      this.is_team_to_manual = false;
    }



    this.teamToId = this.transfer.team_to;
    this.teamFromId = this.transfer.team_from;
    this.getJsonTranslations();
    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    });

    setTimeout(() => {
      this.cdr.detectChanges();
      this.isLoadingModel = false;
    }, 500);
    // }



    this.nationFilterCtrl.valueChanges.subscribe(() => {
      const search = this.nationFilterCtrl.value?.toLowerCase() || '';
      this.displayedCountries = this.countries.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });


    this.nationFilterCtrl2.valueChanges.subscribe(() => {
      const search = this.nationFilterCtrl2.value?.toLowerCase() || '';
      this.displayedCountries2 = this.countries.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });

  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without saving
  }

  onSubmit(myForm: NgForm): void {
    if (myForm.valid) {
      this.isLoading = true; // Start loading indicator
      this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });
      let lang_id = localStorage.getItem('lang_id') + '';
      // Prepare formData with additional properties
      const formData = {
        ...myForm.value,
        team_to: this.teamToId,
        team_from: this.teamFromId,
        date_of_transfer: this.date_of_transfer.value // Convert date to string if necessary
          ? moment(this.date_of_transfer.value).format('YYYY-MM-DD')
          : null,
        lang: lang_id,
        have_no_club_to: this.is_team_to_manual,
        have_no_club_from: this.is_team_from_manual
      };

      this.talentService.updateTransfer(this.transfer.id, formData).subscribe(
        (response: any) => {
          if (response?.status) {
            this.toastr.clear();
            if (response.message != '' && response.message != undefined) {
              this.toastr.success(response.message, this.successTxt);
            } else {
              this.toastr.success('Transfer information updated successfully!', 'Success');
            }
            this.dialogRef.close(response.data); // Close dialog and pass data
          } else {
            this.toastr.clear();
            this.toastr.error('Failed to update transfer. Please try again.', 'Error');
            console.error('Unexpected API response:', response);
          }
          this.isLoading = false; // Stop loading indicator
        },
        (error: any) => {
          this.toastr.clear();
          this.toastr.error('Error updating transfer. Please try again later.', 'Error');
          console.error('Error submitting the form:', error);
          this.isLoading = false; // Stop loading indicator
        }
      );
    } else {
      this.toastr.clear();
      this.toastr.warning(this.requiredFieldsMessage, 'Warning');
    }
  }

  // Function to handle dynamic fetching of clubs based on search input
  onSearchTeams(): void {

    if (this.teamTo.length < 2) {
      // Don't search until the user has typed at least 2 characters
      this.filterTeams = [];
      return;
    }

    this.talentService.searchTeams(this.teamTo).subscribe(
      (response: any) => {
        if (response && response.data && response.data.teams) {
          this.filterTeams = response.data.teams; // Update the list of filtered clubs based on search
          console.log('Filtered teams:', this.filterTeams, response.data.teams);
        } else {
          this.filterTeams = [];
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // Function to handle dynamic fetching of clubs based on search input
  onSearchTeamsFrom(): void {

    if (this.teamFrom.length < 2) {
      // Don't search until the user has typed at least 2 characters
      this.filterTeamsFrom = [];
      return;
    }

    this.talentService.searchTeams(this.teamFrom).subscribe(
      (response: any) => {
        if (response && response.data && response.data.teams) {
          this.filterTeamsFrom = response.data.teams; // Update the list of filtered clubs based on search
          console.log('Filtered teams:', this.filterTeamsFrom);
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // Function to handle the selection of a club
  onSelectTeamTo(team: any): void {
    this.teamTo = team.team_name + '-' + team.team_type; // Set the selected team's name to the input
    this.teamToId = team.id;
    this.filterTeams = []; // Clear the suggestion list
  }

  // Function to handle the selection of a club
  onSelectTeamFrom(team: any): void {
    this.teamFrom = team.team_name + '-' + team.team_type; // Set the selected team's name to the input
    this.teamFromId = team.id;
    this.filterTeamsFrom = []; // Clear the suggestion list
  }

  getJsonTranslations() {
    this.translateService.get(['pleaseWait', 'Processing', 'success!', 'requiredFieldsMessage']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.Processing = translations['Processing'];
      this.successTxt = translations['success!'];
      this.requiredFieldsMessage = translations['requiredFieldsMessage'];
      // this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

  loadCountries(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getCountries(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
          this.displayedCountries = response.data.countries;
          this.displayedCountries2 = response.data.countries;
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  onNoMoveToTeam(value: boolean) {
    this.is_team_to_manual = value;
  }

  onNoMoveFromTeam(value: boolean) {
    this.is_team_from_manual = value;
  }

  ngAfterViewChecked() {
    // this.cdr.detectChanges();
  }


}
