import { Component, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';



const moment = _rollupMoment || _moment;
@Component({
  selector: 'app-add-performance',
  templateUrl: './add-performance.component.html',
  styleUrl: './add-performance.component.scss'
})

export class AddPerformanceComponent {
  readonly date = new FormControl(moment());
  countryControl = new FormControl('');
  filteredCities: any[] = [];
  performance: any = {};
  teams: any[] = [];
  matches: any;
  goals: any;
  isrequiredField: boolean = false;
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


  currentTeam: string = ''; // Initialize as empty string to avoid undefined issues
  formAllFieldsRequired: string = ''; // Initialize as empty string to avoid undefined issues
  errorTxt: string = ''; // Initialize as empty string to avoid undefined issues
  successTxt: string = ''; // Initialize as empty string to avoid undefined issues
  pleaseWait: string = ''; // Initialize as empty string to avoid undefined issues
  submittingPerformanceData: string = ''; // Initialize as empty string to avoid undefined issues
  currentTeamId: any;
  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  isLoading: boolean = false;
  from_date: FormControl = new FormControl(null);
  to_date: FormControl = new FormControl(null);
  currentTeamLogo: string = '';
  generalError: string = '';
  noClub: boolean = false;
  isHideTeamSection: boolean = false;
  teamName: string = '';
  theme: any = localStorage.getItem('theme');
  team_country_id: number = 0;
  countries: any = [];

  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddPerformanceComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) {

    this.countryControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      )
      .subscribe(filtered => this.filteredCities = filtered);
  }

  private _filter(value: string): string[] {
    // const filterValue = value.toLowerCase();
    return this.countries.filter((city: any) => city.country_name.toLowerCase().includes(value));
  }

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');

    this.performance = { ...this.data.performance };
    this.teams = { ...this.data.teams };
    this.matches = this.performance.matches;
    this.goals = this.performance.goals;

    this.from_date = new FormControl(
      this.performance.from_date ? new Date(this.performance.from_date) : null
    );
    this.to_date = new FormControl(
      this.performance.to_date ? new Date(this.performance.to_date) : null
    );

    this.from_date.setValue(this.performance.from_date ? new Date(this.performance.from_date) : null);
    this.to_date.setValue(this.performance.to_date ? new Date(this.performance.to_date) : null);
    this.getToasterMsg();
    this.translate.onLangChange.subscribe((event) => {
      this.getToasterMsg();
      // alert(`Language changed to: ${event.lang}`);
    });
    this.loadCountries();
    this.currentTeamLogo = this.performance.team_club_logo_path;
  }

  displayCountry(country: any): string { 
    this.team_country_id = country.id;
    // this.team_country_id
    console.log(country)
    console.warn(this.team_country_id);
    return country?.country_name || '';
  }

  onInputFocus() {
    if (!this.countryControl.value) {
      this.filteredCities = this.countries;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadTeams(): void {
    this.talentService.getTeams().subscribe(
      (response: any) => {
        if (response && response.status) {
          this.teams = response.data.clubs;
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }


  onSubmit(myForm: NgForm): void {



    this.isrequiredField = false;


    if (this.isHideTeamSection === true) {
      if (!this.team_country_id || this.team_country_id == 0) { 

        console.log('Need to select country please');
        return;
      }
      this.saveManuly(myForm);
    } else {
      this.saveDefault(myForm);
    }
  }

  saveManuly(myForm: NgForm): void {
    if (!myForm.value.session) {
      this.isrequiredField = true;
      this.toastr.warning(this.formAllFieldsRequired, this.errorTxt);
      console.log('session is empty');
      return;
    }



    const loadingToast = this.toastr.info(this.submittingPerformanceData, this.pleaseWait, { disableTimeOut: true });
    let lang_id = localStorage.getItem('lang_id');
    // Add currentTeamId to the form values
    const formData = {
      ...myForm.value, // Include all form values
      team_name: this.teamName, // Append the selected team ID
      from_date: this.from_date.value // Convert FormControl value to string (if necessary)
        ? moment(this.from_date.value).format('YYYY-MM-DD')
        : null,
      to_date: this.to_date.value // Convert FormControl value to string (if necessary)
        ? moment(this.to_date.value).format('YYYY-MM-DD')
        : null,
      lang: lang_id
    };

    this.talentService.addPerformanceManual(formData).subscribe({
      next: (response: any) => {
        // Close loading message
        this.toastr.clear(loadingToast.toastId);

        // Show success message
        if (response.message != '' && response.message != undefined) {
          this.toastr.success(response.message, this.successTxt);
        } else {
          this.toastr.success('Performance data submitted successfully!', 'Success');
        }

        this.dialogRef.close(response.data); // Close the dialog with response data
      },
      error: (error: any) => {
        // Close loading message
        this.toastr.clear(loadingToast.toastId);

        // Show error message
        this.toastr.error(this.generalError, this.errorTxt);

        console.error('Error submitting the form:', error);
      }
    });

  }

  saveDefault(myForm: NgForm): void {
    if (!myForm.value.session) {
      this.isrequiredField = true;
      this.toastr.warning(this.formAllFieldsRequired, this.errorTxt);
      console.log('session is empty in default functionality');
      return;
    }
    if (!this.currentTeamId) {
      this.isrequiredField = true;
      this.toastr.warning(this.formAllFieldsRequired, this.errorTxt);
      return;
    }
    const loadingToast = this.toastr.info(this.submittingPerformanceData, this.pleaseWait, { disableTimeOut: true });
    let lang_id = localStorage.getItem('lang_id');
    // Add currentTeamId to the form values
    const formData = {
      ...myForm.value, // Include all form values
      team_id: this.currentTeamId, // Append the selected team ID
      from_date: this.from_date.value // Convert FormControl value to string (if necessary)
        ? moment(this.from_date.value).format('YYYY-MM-DD')
        : null,
      to_date: this.to_date.value // Convert FormControl value to string (if necessary)
        ? moment(this.to_date.value).format('YYYY-MM-DD')
        : null,
      lang: lang_id
    };

    this.talentService.addPerformance(formData).subscribe({
      next: (response: any) => {
        // Close loading message
        this.toastr.clear(loadingToast.toastId);

        // Show success message
        if (response.message != '' && response.message != undefined) {
          this.toastr.success(response.message, this.successTxt);
        } else {
          this.toastr.success('Performance data submitted successfully!', 'Success');
        }

        this.dialogRef.close(response.data); // Close the dialog with response data
      },
      error: (error: any) => {
        // Close loading message
        this.toastr.clear(loadingToast.toastId);

        // Show error message
        this.toastr.error(this.generalError, this.errorTxt);

        console.error('Error submitting the form:', error);
      }
    });

  }



  // Function to handle dynamic fetching of clubs based on search input
  onSearchTeams(): void {
    if (this.currentTeam.length < 2) {
      // Don't search until the user has typed at least 2 characters
      this.filterTeams = [];
      return;
    }

    this.talentService.searchTeams(this.currentTeam).subscribe(
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

  // Function to handle the selection of a club
  onSelectTeam(team: any): void {
    this.currentTeam = team.team_name + '-' + team.team_type; // Set the selected team's name to the input
    this.currentTeamId = team.id;
    this.filterTeams = []; // Clear the suggestion list
    this.currentTeamLogo = team.team_club_logo_path;
  }

  getToasterMsg() {
    this.translate.get(['success!', 'submittingPerformanceData', 'pleaseWait', 'formAllFieldsRequired', 'error', 'forgotPassword.generalError']).subscribe((res: any) => {
      this.successTxt = res['success!'];
      this.submittingPerformanceData = res['submittingPerformanceData'];
      this.pleaseWait = res['pleaseWait'];
      this.formAllFieldsRequired = res['formAllFieldsRequired'];
      this.errorTxt = res['error'];
      this.generalError = res['forgotPassword.generalError'];
      // this.downloading = res['downloading'];
    });
  }

  onNoClubChange(value: boolean) {
    // alert(value); // true if checked, false if unchecked
    this.isHideTeamSection = value;
    this.team_country_id = 0;
  }

  loadCountries(): void {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    this.talentService.getCountries(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
          this.filteredCities = this.countries;
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  getTextBeforeDash(input: string): string {
    input = input.toLowerCase();
    return input.split('-')[0].trim();
  }

  getTextAfterDash(input: string): string {
    input = input.toLowerCase();
    return input.split('-')[1]?.trim() || '';
  }

}
