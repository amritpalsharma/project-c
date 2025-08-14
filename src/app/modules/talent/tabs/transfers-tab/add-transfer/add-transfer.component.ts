import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
import { FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../../services/webpages.service';


const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-add-transfer',
  templateUrl: './add-transfer.component.html',
  styleUrl: './add-transfer.component.scss'
})
export class AddTransferComponent {
  readonly date = new FormControl(moment());
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

  teams: any;  // Assume you get this data from a service
  transfer: any;  // Assume you get this data from a service
  errorTxt: string = '';
  showFormErrors: boolean = false;

  teamTo: string = ''; // Initialize as empty string to avoid undefined issues
  teamToId: any;
  teamFrom: string = ''; // Initialize as empty string to avoid undefined issues
  teamFromId: any;
  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  filterTeamsFrom: any[] = []; // Initialize as empty array to avoid undefined issues
  isLoading: boolean = false;
  date_of_transfer: FormControl = new FormControl(null);
  successTxt: string = '';
  Processing: string = '';
  pleaseWait: string = '';
  theme: any = localStorage.getItem('theme');
  noMoveToTeam: boolean = false;
  team_to_manual: string = '';
  team_to_m_country_id: number = 0;
  noMoveFromTeam: boolean = false;
  team_from_manual: string = '';
  countries: any = [];
  countries2: any = [];
  team_from_m_country_id: number = 0;

  countrySearch: FormControl = new FormControl(null);
  countrySearch2: FormControl = new FormControl(null);

  countriesFromArr: any = [];
  countriesToArr: any = [];
  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddTransferComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    public webPages: WebPages,
  ) {
    this.loadCountries();
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.getJsonTranslations();
    // You might want to load your teams from a service here
    this.teams = this.data.teams;
    this.transfer = this.data.transfer;
    console.log(this.teams)
    this.date_of_transfer = new FormControl(
      this.data.date_of_transfer ? new Date(this.data.date_of_transfer) : null
    );
    console.log('teams:', this.date_of_transfer);
    this.date_of_transfer.setValue(this.data.date_of_transfer ? new Date(this.data.date_of_transfer) : null);

    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    });

    this.countrySearch.valueChanges.subscribe(() => {
      const search = this.countrySearch.value?.toLowerCase() || '';
      if (!search) {
        this.countriesFromArr = this.countries;
      }
      this.countriesFromArr = this.countries.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });

    this.countrySearch2.valueChanges.subscribe(() => {
      const search = this.countrySearch2.value?.toLowerCase() || '';
      if (!search) {
        this.countriesToArr = this.countries;
      }
      this.countriesToArr = this.countries2.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });
  }
  // isFieldVisible: boolean = true;
  // toggleFieldVisibility() {
  //   if (!this.isFieldVisible) {
  //     this.form.removeControl('hiddenField');  // Remove the control from the form
  //   } else {
  //     this.form.addControl('hiddenField', new FormControl(''));  // Add the control back
  //   }
  // }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without saving
  }

  onSubmit(myForm: NgForm): void {
    this.showFormErrors = true;
    console.log(this.date_of_transfer.value)



    // if (myForm.valid) {
    console.info(myForm.value);
    let lang_id = localStorage.getItem('lang_id');
    let formData = {
      ...myForm.value,
      team_to: this.teamToId,
      team_from: this.teamFromId,
      date_of_transfer: this.date_of_transfer.value // Convert FormControl value to string (if necessary)
        ? moment(this.date_of_transfer.value).format('YYYY-MM-DD')
        : null,
      lang: lang_id
    };

    if (this.noMoveToTeam) {
      formData = {
        ...formData, // Spread the existing formData
        team_to_manual: this.team_to_manual, // Replace team_to with team_to_manual
        team_to_m_country_id: this.team_to_m_country_id, // Replace team_to with team_to_manual
        // team_to: undefined, // Remove the old team_to key if needed
        have_no_club_to: true
      };
    }

    if (this.noMoveFromTeam) {
      formData = {
        ...formData, // Spread the existing formData
        team_from_manual: this.team_from_manual, // Replace team_to with team_to_manual
        team_from_m_country_id: this.team_from_m_country_id, // Replace team_to with team_to_manual
        //  team_to: undefined, // Remove the old team_to key if needed
        have_no_club_from: true
      };
    }
    // Show loading notification
    const loadingToast = this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });

    this.talentService.addTransfer(formData).subscribe({
      next: (response: any) => {
        this.toastr.clear(loadingToast.toastId); // Clear loading notification
        if (response.status == true && response.message != '' && response.message != undefined) {
          this.toastr.success(response.message, this.successTxt); // Show success notification
          this.dialogRef.close(response.data);
        } else if (response.message != '' && response.message != undefined) {
          // this.toastr.error(response.message, this.errorTxt.toUpperCase()); // Show success notification
        } else {
          // this.toastr.success('Transfer added successfully!', 'Success'); // Show success notification
        }
        console.log('Form submitted successfully:', response);
        // Close dialog and return response data
      },
      error: (error: any) => {
        this.toastr.clear(loadingToast.toastId); // Clear loading notification
        this.toastr.error('Failed to submit transfer. Please try again.', 'Error'); // Show error notification
        console.error('Error submitting form:', error);
      }
    });
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
        if (response && response.data) {
          this.filterTeams = response.data.teams; // Update the list of filtered clubs based on search
          console.log('Filtered teams:', this.filterTeams);
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
        if (response && response.data) {
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
    this.translateService.get(['success!', 'Processing', 'pleaseWait', 'error!']).subscribe((translations) => {
      this.successTxt = translations['success!'];
      this.Processing = translations['Processing'];
      this.pleaseWait = translations['pleaseWait'];
      this.errorTxt = translations['error!'];
      console.log('Title fetch Function Fired');
    })
  }

  onNoMoveToTeam(value: boolean) {
    // console.log('onNoMoveToTeam', value);
    this.noMoveToTeam = value;
  }

  onNoMoveFromTeam(value: boolean) {
    console.log('onNoMoveFromTeam', value);
    this.noMoveFromTeam = value;
  }

  loadCountries(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getCountries(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
          this.countries2 = response.data.countries;
          this.countriesToArr = this.countries;
          this.countriesFromArr = this.countries;
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  openDatePicker(datepicker: MatDatepicker<any>) {
    datepicker.open();  // Opens the date picker
  }
}
