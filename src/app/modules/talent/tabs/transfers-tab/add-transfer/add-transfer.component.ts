import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TalentService } from '../../../../../services/talent.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  teams: any;  // Assume you get this data from a service
  transfer: any;  // Assume you get this data from a service

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
  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddTransferComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    public webPages: WebPages,
  ) { }

  ngOnInit(): void {
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
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without saving
  }

  onSubmit(myForm: NgForm): void {

    if (myForm.valid) {
      let lang_id = localStorage.getItem('lang_id');
      const formData = {
        ...myForm.value,
        team_to: this.teamToId,
        team_from: this.teamFromId,
        date_of_transfer: this.date_of_transfer.value // Convert FormControl value to string (if necessary)
          ? moment(this.date_of_transfer.value).format('YYYY-MM-DD')
          : null,
        lang: lang_id
      };

      // Show loading notification
      const loadingToast = this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });

      this.talentService.addTransfer(formData).subscribe({
        next: (response: any) => {
          this.toastr.clear(loadingToast.toastId); // Clear loading notification
          if (response.message != '' && response.message != undefined) {
            this.toastr.success(response.message, this.successTxt); // Show success notification
          } else {
            this.toastr.success('Transfer added successfully!', 'Success'); // Show success notification
          }
          console.log('Form submitted successfully:', response);
          this.dialogRef.close(response.data); // Close dialog and return response data
        },
        error: (error: any) => {
          this.toastr.clear(loadingToast.toastId); // Clear loading notification
          this.toastr.error('Failed to submit transfer. Please try again.', 'Error'); // Show error notification
          console.error('Error submitting form:', error);
        }
      });
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
    this.translateService.get(['success!', 'Processing','pleaseWait']).subscribe((translations) => {
      this.successTxt = translations['success!'];
      this.Processing = translations['Processing'];
      this.pleaseWait = translations['pleaseWait'];
      console.log('Title fetch Function Fired');
    })
  }
}
