import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { ToastrService } from 'ngx-toastr';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'edit-performance-details',
  templateUrl: './edit-performance-details.component.html',
  styleUrls: ['./edit-performance-details.component.scss']
})
export class EditPerformanceDetailsComponent implements OnInit {
  readonly date = new FormControl(moment());
  performance: any = {};
  teams: any[] = [];
  matches: any;
  goals: any;
  currentTeam: string = ''; // Initialize as empty string to avoid undefined issues
  currentTeamId: any;
  filterTeams: any[] = []; // Initialize as empty array to avoid undefined issues
  isLoading : boolean = false;
  from_date: FormControl = new FormControl(null);
  to_date: FormControl = new FormControl(null);

  constructor(
    public dialogRef: MatDialogRef<EditPerformanceDetailsComponent>,
    private talentService: TalentService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.performance = { ...this.data.performance };
    this.teams = [...this.data.teams];
    this.matches = this.performance.matches;
    this.goals = this.performance.goals;
    this.from_date = new FormControl(
      this.performance.from_date ? new Date(this.performance.from_date) : null
    );
    this.to_date = new FormControl(
      this.performance.to_date ? new Date(this.performance.to_date) : null
    );
    this.currentTeam =  this.performance.team_name; // Set the selected team's name to the input
    this.currentTeamId = this.performance.team_id;

    this.from_date.setValue(this.performance.from_date ? new Date(this.performance.from_date) : null);
    this.to_date.setValue(this.performance.to_date ? new Date(this.performance.to_date) : null);
  }

  onCancel(): void {
    this.dialogRef.close();
  }


  onSubmit(myForm: NgForm): void {
    if (myForm.valid) {
      this.isLoading = true; // Start loading indicator
      this.toastr.info('Updating performance...', 'Please wait', { disableTimeOut: true });
  
      // Prepare form data
      const formData = {
        ...myForm.value, // Include all form values
        team_id: this.currentTeamId, // Append the selected team ID
        from_date: this.from_date.value // Convert FormControl value to string (if necessary)
          ? moment(this.from_date.value).format('YYYY-MM-DD') 
          : null,
        to_date: this.to_date.value // Convert FormControl value to string (if necessary)
          ? moment(this.to_date.value).format('YYYY-MM-DD') 
          : null,
      };
  
      // API call to update performance
      this.talentService.updatePerformance(this.performance.id, formData).subscribe(
        (response: any) => {
          this.toastr.clear();
          if (response?.status) {
            this.toastr.success('Performance updated successfully!', 'Success');
            this.dialogRef.close(response.data); // Close dialog with updated data
          } else {
            this.toastr.error('Failed to update performance. Please try again.', 'Error');
            console.error('Unexpected API response:', response);
          }
          this.isLoading = false; // Stop loading indicator
        },
        (error: any) => {
          this.toastr.clear();
          this.toastr.error('Error updating performance. Please try again later.', 'Error');
          console.error('Error submitting the form:', error);
          this.isLoading = false; // Stop loading indicator
        }
      );
    } else {
            this.toastr.clear();
      this.toastr.warning('Please fill out all required fields before submitting.', 'Warning');
    }
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
    this.currentTeam = team.team_name +'-' +team.team_type; // Set the selected team's name to the input
    this.currentTeamId = team.id;
    this.filterTeams = []; // Clear the suggestion list
  }
}
