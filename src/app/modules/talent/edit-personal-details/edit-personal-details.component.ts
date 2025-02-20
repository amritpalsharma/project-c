import { Component, ElementRef, Inject, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { FormControl, NgForm } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { catchError, Observable, of, tap, fromEvent } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';

const moment = _rollupMoment || _moment;


// Declare google globally to avoid TypeScript errors
declare const google: any;

@Component({
  selector: 'app-edit-personal-details',
  templateUrl: './edit-personal-details.component.html',
  styleUrls: ['./edit-personal-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EditPersonalDetailsComponent implements OnInit {

  @ViewChild('placeOfBirthInput') placeOfBirthInput!: ElementRef;
  placeSuggestions: any[] = [];
  readonly date = new FormControl(moment());

  countries: any;
  leagueLevels: string[] = ['Amateur', 'Professional', 'Semi-Pro'];
  filteredClubs: any[] = [];  // To store filtered clubs based on search
  selectedClub: string = '';
  user: any = localStorage.getItem('userData');
  loggedInUser: any = localStorage.getItem('userData');
  userId: any;
  userNationalities: any;
  playerClub: any = "";

  // Declare individual properties for binding
  height: number = 0;
  heightUnit: string = 'cm';
  weight: number = 0;
  weightUnit: string = 'kg';
  leagueLevel: string = '';
  placeOfBirth: string = '';
  dominantFoot: string = 'Right'; // Set a default value for dominant foot
  currentClub: string = '';
  firstName: string = '';
  lastName: string = '';
  nationality: any[] = [];  // Ensure nationality is initialized as an array
  birthCountry: any;
  currentClubId: any;
  userData: any
  playerClubsListing: any;
  takenBy: any;

  dateOfBirth: FormControl = new FormControl(null);  // Initialize with null or the correct date format
  contractStart: FormControl = new FormControl(null);
  contractEnd: FormControl = new FormControl(null);

  constructor(
    public dialogRef: MatDialogRef<EditPersonalDetailsComponent>,
    private talentService: TalentService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  countriesLoaded: boolean = false;
  profileLoaded: boolean = false;

  ngOnInit(): void {
    this.userData = this.user = { ...this.data.user };

    this.countries = this.data.countries;
    // this.user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.loggedInUser = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = this.loggedInUser.id;

    this.getUserProfile(this.userId);
    // this.getClubsForPlayer();

    let clubsString = localStorage.getItem('clubs');
    if (clubsString) {
      this.playerClubsListing = JSON.parse(clubsString);
    } else {
      this.playerClubsListing = [];  // Default to empty array if no clubs in localStorage
    }

    if (this.user.meta) {
      this.dateOfBirth = new FormControl(
        this.user?.meta?.dateOfBirth ? new Date(this.user.meta.dateOfBirth) : null
      );

      this.contractStart = new FormControl(
        this.user?.meta?.contract_start ? new Date(this.user.meta.contract_start) : null
      );
      this.contractEnd = new FormControl(
        this.user?.meta?.contract_end ? new Date(this.user.meta.contract_end) : null
      );

      console.log('user', this.contractStart)
      this.height = this.user.meta.height || 0;
      this.heightUnit = this.user.meta.height_unit || 'cm';
      this.weight = this.user.meta.weight || 0;
      this.weightUnit = this.user.meta.weight_unit || 'kg';
      this.leagueLevel = this.user.meta.league_level || '';
      this.placeOfBirth = this.user.meta.place_of_birth || '';
      this.dominantFoot = this.user.meta.foot || 'Right';
      this.currentClub = this.user.pre_current_club_name || '';
      this.firstName = this.user.first_name || '';
      this.lastName = this.user.last_name || '';
      this.currentClubId = this.user.meta.pre_club_id || '';
      this.dateOfBirth.setValue(this.user.meta.date_of_birth ? new Date(this.user.meta.date_of_birth) : null);
      this.contractStart.setValue(this.user.meta.contract_start ? new Date(this.user.meta.contract_start) : null);
      this.contractEnd.setValue(this.user.meta.contract_end ? new Date(this.user.meta.contract_end) : null);

      this.userNationalities = JSON.parse(this.user.user_nationalities) || [];

      // Ensure userNationalities is parsed correctly as an array of IDs only
      this.userNationalities = JSON.parse(this.user.user_nationalities || '[]');
      this.nationality = Array.isArray(this.userNationalities) ? this.userNationalities.map(item =>
        String(item.country_id)
      ) : [];

      this.birthCountry = this.user.meta.birth_country || '3';

      // if (this.user.meta && this.user.meta.pre_club_id) {
      //   this.currentClubId = this.user.meta.pre_club_id;
      // }
    }

  }

  ngAfterViewInit(): void {
    // this.initGooglePlacesAutocomplete();
  }

  onSelectSuggestion(place: any): void {
    this.placeOfBirthInput.nativeElement.value = place.description;
    this.placeSuggestions = [];  // Clear suggestions
  }

  // After loading, mark countries as loaded and check if both are ready
  loadCountries(): Observable<any> {
    return this.talentService.getCountries().pipe(
      tap((response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
        }
      }),
      catchError(error => {
        console.error('Error fetching countries:', error);
        return of([]); // Return an empty array in case of an error
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getClubsForPlayer() {
    this.talentService.getClubsForPlayer().subscribe(
      response => {
        if (response.status) {
          this.playerClubsListing = response.data.clubs;
          console.log(this.playerClubsListing);

          let index = this.playerClubsListing.findIndex((x: any) => x.id == this.user.meta.pre_club_id);
          if (this.playerClubsListing[index]?.is_taken == "yes") {
            this.takenBy = this.playerClubsListing[index].taken_by;
          }

        } else {

        }
      },
      error => {
        console.error('Error publishing advertisement:', error);
      }
    );
  }

  // Function to handle dynamic fetching of clubs based on search input
  onSearchClubs(): void {
    if (this.currentClub.length < 2) {
      // Don't search until the user has typed at least 3 characters
      this.filteredClubs = [];
      return;
    }

    this.talentService.searchClubs(this.currentClub).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.filteredClubs = response.data.clubs;  // Update the list of filtered clubs based on search
          console.log('Filtered Clubs:', this.filteredClubs);
        }
      },
      (error: any) => {
        console.error('Error fetching clubs:', error);
      }
    );
  }

  // Function to handle the selection of a club
  onSelectClub(club: any): void {
    this.currentClub = club.club_name;  // Set the selected club's name to the input
    this.currentClubId = club.id;  // Set the selected club's name to the input
    //this.filteredClubs = [];  // Clear the suggestion list
  }

  getUserProfile(userId: any) {
    if (this.userData) {
      this.user = this.userData;

      if (this.user.meta) {
        this.dateOfBirth = this.user.meta.date_of_birth || '';
        this.height = this.user.meta.height || 0;
        this.heightUnit = this.user.meta.height_unit || 'cm';
        this.weight = this.user.meta.weight || 0;
        this.weightUnit = this.user.meta.weight_unit || 'kg';
        this.contractStart = this.user.meta.contract_start || '';
        this.contractEnd = this.user.meta.contract_end || '';
        this.leagueLevel = this.user.meta.league_level || '';
        this.placeOfBirth = this.user.meta.place_of_birth || '';
        this.dominantFoot = this.user.meta.foot || 'Right';
        this.currentClub = this.user.pre_current_club_name || '';
        this.firstName = this.user.first_name || '';
        this.lastName = this.user.last_name || '';
        this.userNationalities = JSON.parse(this.user.user_nationalities) || [];

        // Ensure userNationalities is parsed correctly as an array of IDs only
        this.userNationalities = JSON.parse(this.user.user_nationalities || '[]');
        this.nationality = Array.isArray(this.userNationalities) ? this.userNationalities.map((nation: any) => nation.country_id) : [];

        if (this.user.meta && this.user.meta.pre_club_id) {
          this.currentClubId = this.user.meta.pre_club_id;
        }
      }
    } else {
      console.error('Invalid API this.userData structure:', this.userData);
    }
  }

  onSubmit(form: NgForm) {
    console.log('Form:', form);

    // Manually validate only the required fields
    if (!this.dateOfBirth.value) {
      this.toastr.warning('Date of Birth is required.', 'Form Incomplete');
      return;
    }

    if (!this.nationality || this.nationality.length === 0) {
      this.toastr.warning('Nationality is required.', 'Form Incomplete');
      return;
    }

    if (!this.dominantFoot) {
      this.toastr.warning('Dominant Foot is required.', 'Form Incomplete');
      return;
    }

    // Enable loading state and notify user
    this.toastr.info('Submitting your profile...', 'Please wait', { disableTimeOut: true });

    const formData = new FormData();

    // Handling `current_club` and `pre_club_id`
    let index = this.playerClubsListing.findIndex((x: any) => x.id === this.currentClubId);
    if (this.playerClubsListing[index]?.is_taken === "yes") {
      this.takenBy = this.playerClubsListing[index].taken_by;
      formData.append('user[pre_club_id]', this.currentClubId);
      formData.append('user[current_club]', this.takenBy);
    } else {
      formData.append('user[pre_club_id]', this.currentClubId);
    }

    // Format and append required fields
    const formattedDateOfBirth = moment(this.dateOfBirth.value).format('YYYY-MM-DD');
    formData.append('user[date_of_birth]', formattedDateOfBirth);
    formData.append('user[foot]', this.dominantFoot);

    // Append Nationality array
    this.nationality.forEach((nation: any) => {
      formData.append('user[nationality][]', nation);
    });

    // Append optional fields only if they exist
    if (this.placeOfBirth) formData.append('user[place_of_birth]', this.placeOfBirth);
    if (this.height) formData.append('user[height]', this.height.toString());
    if (this.weight) formData.append('user[weight]', this.weight.toString());
    if (this.contractStart) {
      const formattedContractStart = moment(this.contractStart.value).format('YYYY-MM-DD');
      formData.append('user[contract_start]', formattedContractStart);
    }
    if (this.contractEnd) {
      const formattedContractEnd = moment(this.contractEnd.value).format('YYYY-MM-DD');
      formData.append('user[contract_end]', formattedContractEnd);
    }
    if (this.leagueLevel) formData.append('user[league_level]', this.leagueLevel);
    if (this.firstName) formData.append('user[first_name]', this.firstName);
    if (this.lastName) formData.append('user[last_name]', this.lastName);
    if (this.birthCountry) formData.append('user[birth_country]', this.birthCountry);

    formData.append('lang', 'en');

    // API call for submitting form data
    this.talentService.updateUserProfile(formData).subscribe(
      (response: any) => {
        if (response?.status) {
          this.toastr.clear();
          this.toastr.success('Profile updated successfully!', 'Success');
          this.dialogRef.close(response.data);
        } else {
          this.toastr.clear();
          this.toastr.error('Unexpected error occurred. Please try again.', 'Submission Failed');
          console.error('API response error:', response);
        }
      },
      (error: any) => {
        this.toastr.error('Failed to submit profile. Please try again.', 'Error');
        console.error('Error submitting the form:', error);
      },
    );
  }


  // onDateChange(event: MatDatepickerInputEvent<Date>, type:any): void {

  //   const selectedDate = event.value;
  //   let date = this.formatDate(selectedDate);

  //   if(type == 'dob'){
  //     this.dateOfBirth = date;
  //   }

  // }

  // formatDate(date:any) {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

}
