import { Component, ElementRef, Inject, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { FormControl, NgForm } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
import { catchError, Observable, of, tap, fromEvent } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';

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
  isTeamSelectError: boolean = false;
  countries: any;
  teamsArr: any[] = [];
  leagueLevels: any[] = [];
  // filteredClubs: any[] = [];  // To store filtered clubs based on search
  selectedClub: string = '';
  user: any = localStorage.getItem('userData');
  loggedInUser: any = localStorage.getItem('userData');
  userId: any;
  userNationalities: any;
  playerClub: any = "";
  // team_id: any = 0;
  team_id: number = 0;

  // Declare individual properties for binding
  height: number = 0;
  heightUnit: string = 'cm';
  weight: number = 0;
  weightUnit: string = 'kg';
  leagueLevel: any = 1;
  placeOfBirth: string = '';
  dominantFoot: string = ''; // Set a default value for dominant foot
  currentClub: string = '';
  firstName: string = '';
  lastName: string = '';
  nationality: any[] = [];  // Ensure nationality is initialized as an array
  birthCountry: any;
  // currentClubId: any;
  userData: any
  playerClubsListing: any;
  takenBy: any;
  CurrentTeamId: any = 0;
  FirstTimeSelectedTeam: any;

  dateOfBirth: FormControl = new FormControl(null);  // Initialize with null or the correct date format
  contractStart: FormControl = new FormControl(null);
  contractEnd: FormControl = new FormControl(null);
  successTxt: string = '';
  teamControl = new FormControl(null);
  errorTxt: string = '';
  nationalityRequired: string = '';
  dobRequired: string = '';
  dominantFootRequired: string = '';
  Processing: string = '';
  pleaseWait: string = '';
  // selectedLeagueId:number=16;

  clubSearch: string = '';
  nationSearch: string = '';
  custom_club_search: string = '';
  filteredClubs: any[] = [];

  // playerClubsListing = [
  //   { id: 1, club_name: 'Club A' },
  //   { id: 2, club_name: 'Club B' },
  //   // other clubs
  // ];
  currentClubId: any;
  searchedClubs: any = [];
  filterCountriesArr: any = [];
  displayedCountries: any[] = [];

  custom_club_country: any = 0;
  custom_club_country_name: string = '';
  custom_club: string = '';
  custom_team: string = '';
  isCustomClubTeam: boolean = false;

  team_type: string = 'm';
  userHasNoClub: boolean = false;
  // nationControl = new FormControl([]);
  nationControl = new FormControl<string[]>([]);

  nationFilterCtrl = new FormControl('');
  clubSearching = new FormControl('');
  customClubCountrySearch = new FormControl('');
  userHasCustomClub: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<EditPersonalDetailsComponent>,
    private talentService: TalentService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    public webPages: WebPages,
    private cdr: ChangeDetectorRef
  ) { }

  countriesLoaded: boolean = false;
  profileLoaded: boolean = false;
  isHideClubSection: boolean = false;


  theme: any = localStorage.getItem('theme');
  teamNameDefault: string = '';
  isreadOnlyContract: boolean = false;

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.userData = this.user = { ...this.data.user };

    // Code By Amrit When Club Add Talent Into Team
    if (typeof this.user?.current_club_info !== undefined && this.user?.current_club_info != '' && this.user?.current_club_info != null) {
      let registedClubArr = JSON.parse(this.user?.current_club_info);
      this.team_type = registedClubArr.team_group;
      this.currentClubId = String(registedClubArr.club_id);
      this.isreadOnlyContract = true;
      setTimeout(() => {
        this.currentClubId = String(registedClubArr.club_id);
        const idToSelect = String(registedClubArr.team_id); // Convert to string since your IDs are strings
        const matchingTeam = this.teamsArr.find(t => t.id === idToSelect);

        if (matchingTeam) {
          this.CurrentTeamId = (idToSelect);
          this.previousTeamId = Number(idToSelect);
          // console.log('Match found. Selected:', matchingTeam);
        } else {
          console.warn('No matching team found for:', idToSelect);
        }

        this.cdr.detectChanges();
      }, 500);
    }

    this.countries = this.data.countries;
    // this.user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.loggedInUser = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = this.loggedInUser.id;
    this.loadLeagues();
    this.getUserProfile(this.userId);
    // this.getClubsForPlayer();

    let clubsString = localStorage.getItem('clubs');
    if (clubsString) {
      this.playerClubsListing = JSON.parse(clubsString);
      // console.info('this.playerClubsListing',this.playerClubsListing)
      if (Array.isArray(this.playerClubsListing) && this.playerClubsListing.length > 0) {
        this.playerClubsListing.sort((a, b) =>
          a.club_name.localeCompare(b.club_name)
        );
      }
    } else {
      this.playerClubsListing = [];  // Default to empty array if no clubs in localStorage
    }

    if (this.user?.meta?.have_registered_club == 1 && this.user?.registered_club_info != '') {
      let registedClubArr = JSON.parse(this.user?.registered_club_info);
      this.team_type = registedClubArr.team_group;
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
      if (typeof this.currentClubId === undefined) {

      }
      this.talentService.getClubTeamsByGroup(this.currentClubId, this.team_type).subscribe((response) => {
        if (response.status && Array.isArray(response.data.teams) && response.data.teams.length > 0) {
          this.teamsArr = [...response.data.teams]; // Ensure a new reference for change detection
        } else {
          this.teamsArr = []; // Clear teamsArr if no teams are available
        }
        if (this.user?.meta?.have_registered_club == 1 && this.user?.registered_club_info != '') {
          let registedClubArr = JSON.parse(this.user?.registered_club_info);
          this.team_type = registedClubArr.team_group;
          setTimeout(() => {
            const idToSelect = String(registedClubArr.team_id); // Convert to string since your IDs are strings
            const matchingTeam = this.teamsArr.find(t => t.id === idToSelect);

            console.log('All team IDs:', this.teamsArr.map(t => t.id));
            console.log('Trying to set CurrentTeamId to:', idToSelect);

            if (matchingTeam) {
              this.CurrentTeamId = (idToSelect);
              console.log('Match found. Selected:', matchingTeam);
            } else {
              console.warn('No matching team found for:', idToSelect);
            }

            this.cdr.detectChanges();
          }, 500);


        }

        console.info('Received Teams:', this.teamsArr);


      });
      console.log('user', this.contractStart)
      this.height = this.user.meta.height || 0;
      this.heightUnit = this.user.meta.height_unit || 'cm';
      this.weight = this.user.meta.weight || 0;
      this.weightUnit = this.user.meta.weight_unit || 'kg';
      this.leagueLevel = this.user.meta.league_level || 1;
      this.placeOfBirth = this.user.meta.place_of_birth || '';
      this.dominantFoot = this.user.meta.foot || '';
      this.currentClub = this.user.pre_current_club_name || '';
      this.firstName = this.user.first_name || '';
      this.lastName = this.user.last_name || '';

      this.dateOfBirth.setValue(this.user.meta.date_of_birth ? new Date(this.user.meta.date_of_birth) : null);
      this.contractStart.setValue(this.user.meta.contract_start ? new Date(this.user.meta.contract_start) : null);
      this.contractEnd.setValue(this.user.meta.contract_end ? new Date(this.user.meta.contract_end) : null);

      this.userNationalities = JSON.parse(this.user.user_nationalities) || [];

      // Ensure userNationalities is parsed correctly as an array of IDs only
      // this.userNationalities = JSON.parse(this.user.user_nationalities || '[]');
      // this.nationality = Array.isArray(this.userNationalities) ? this.userNationalities.map(item =>
      //   String(item.country_id)
      // ) : [];

      this.birthCountry = this.user.meta.birth_country || '3';

    }
    this.getJsonTranslations();
    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    });
    this.filteredClubs = [...this.playerClubsListing];

    if (Array.isArray(this.countries) && this.countries.length > 0) {
      this.countries.sort((a, b) =>
        a.country_name.localeCompare(b.country_name)
      );
    }

    this.displayedCountries = [...this.countries];

    console.log(this.displayedCountries);
    // console.log(typeof this.displayedCountries[0].id);
    this.displayedCountries2 = this.countries;
    if (this.user?.custom_club_info && this.user?.custom_club_info != '') {
      let custom_club_info = JSON.parse(this.user?.custom_club_info);
      // console.info('custom_club_info', custom_club_info);
      this.custom_club_country = String(custom_club_info.country_id);
      this.custom_club_country_name = custom_club_info.country_name;
    }

    if (this.user?.meta?.have_custom_club == 1) {
      this.isCustomClubTeam = true;
      this.userHasCustomClub = true;
      if (this.user?.custom_club_info && this.user?.custom_club_info != '' && typeof this.user?.custom_club_info !== undefined) {
        let customClubArr = JSON.parse(this.user?.custom_club_info);
        this.custom_club_country = String(customClubArr.country_id);
        this.custom_club = customClubArr.club_name;
        this.custom_team = customClubArr.team_name;
        this.userHasCustomClub = true;
      }
    }

    if (this.user?.meta?.have_registered_club == 1) {
      this.isCustomClubTeam = false;
    }


    this.nationFilterCtrl.valueChanges.subscribe(() => {
      const search = this.nationFilterCtrl.value?.toLowerCase() || '';
      this.displayedCountries = this.countries.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });

    this.clubSearching.valueChanges.subscribe(() => {
      const search = this.clubSearching.value?.toLowerCase() || '';
      this.searchedClubs = this.playerClubsListing.filter(
        (club: any) => club.club_name.toLowerCase().includes(search)
      );
    });

    this.customClubCountrySearch.valueChanges.subscribe(() => {
      const search = this.customClubCountrySearch.value?.toLowerCase() || '';
      this.displayedCountries2 = this.countries.filter(
        (country: any) => country.country_name.toLowerCase().includes(search)
      );
    });


    // this.nationControl.setValue(['10', '2']); // or ['10', '2'] if your country.id is string
    try {
      // Step 1: Parse the API response string into an array
      const parsedNationalities = JSON.parse(this.user?.user_nationalities);

      // Step 2: Validate that the parsed object is an array of objects and contains 'country_id'
      if (Array.isArray(parsedNationalities)) {
        // Step 3: Extract only the country_id's
        const countryIds = parsedNationalities.map(item => item.country_id.toString());

        // Step 4: Set the extracted country_ids into the form control
        this.nationControl.setValue(countryIds);
      } else {
        console.error('Parsed data is not in expected array format.');
      }
    } catch (error) {
      console.error('Error parsing nationalities:', error);
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

  setTeamType(teamType: string) {
    this.team_type = teamType;
    this.loadTeams(this.currentClubId, this.team_type)
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

  nationError: boolean = false;
  registredClubArr: any;
  customClubArr: any;
  previousTeamId: number = 0;
  getUserProfile(userId: any) {
    if (this.userData) {
      this.user = this.userData;
      console.info('this.user', this.user)
      if (this.user?.user_nationalities && this.user?.user_nationalities != null) {
        let userNationalitiesRaw = this.user?.user_nationalities;
        try {
          // If it's already an object (parsed), skip JSON.parse
          if (typeof userNationalitiesRaw === 'string') {
            userNationalitiesRaw = JSON.parse(userNationalitiesRaw);
          }

          const selectedIds = userNationalitiesRaw.map((item: any) => item.country_id);
          this.nationControl.setValue(selectedIds);

        } catch (error) {
          console.error('Failed to parse user_nationalities:', error);
        }
      }

      // this.nationControl.setValue(['10', '2']);
      if (this.user.meta) {
        if (this.user.meta.have_no_club == '1') {
          this.isHideClubSection = true;
          this.userHasNoClub = true;
        } else if (this.user.meta.have_no_club == '0') {
          this.isHideClubSection = false;
          this.userHasNoClub = false;
        }
        // console.info('this.user.meta',this.user.meta)
        this.dateOfBirth = this.user.meta.date_of_birth || '';
        this.height = this.user.meta.height || 0;
        this.heightUnit = this.user.meta.height_unit || 'cm';
        this.weight = this.user.meta.weight || 0;
        this.weightUnit = this.user.meta.weight_unit || 'kg';
        this.contractStart = this.user.meta.contract_start || '';
        this.contractEnd = this.user.meta.contract_end || '';
        this.leagueLevel = this.user.meta.league_level || 1;
        this.placeOfBirth = this.user.meta.place_of_birth || '';
        this.dominantFoot = this.user.meta.foot || '';
        this.currentClub = this.user.pre_current_club_name || '';
        this.firstName = this.user.first_name || '';
        this.lastName = this.user.last_name || '';
        this.userNationalities = JSON.parse(this.user.user_nationalities) || [];
        if (this.user.current_club_id && this.user.current_club_id != undefined && this.user.current_club_id != '') {
          this.currentClubId = this.user.current_club_id;
        }



        if (this.user.team_id && this.user.team_id != '' && this.user.team_id != undefined) {
          this.team_id = this.user.team_id;
        }

        // this.userNationalities = JSON.parse(this.user.user_nationalities || '[]');
        // const selectedIds = this.userNationalities.map((item: any) => item.country_id); // extract only IDs

        // this.nationControl.setValue(selectedIds); // set the values to your mat-select
        // this.nationality = Array.isArray(this.userNationalities) ? this.userNationalities.map((nation: any) => nation.country_id) : [];


        if (this.user.meta && this.user.meta.league_level) {
          this.leagueLevel = this.user.meta.league_level;
          console.warn('this.leagueLevel ', this.leagueLevel);
        }




      }

      if (this.user?.meta?.have_registered_club == 1 && this.user?.registered_club_info != '') {
        this.registredClubArr = JSON.parse(this.user?.registered_club_info);
        this.currentClubId = this.registredClubArr.club_id + '';
        this.team_type = this.registredClubArr.team_group;
        this.CurrentTeamId = this.registredClubArr.team_id;
      }
      if (this.user?.meta?.have_custom_club == 1 && this.user?.custom_club_info != '') {
        this.customClubArr = JSON.parse(this.user?.custom_club_info);
      }

      // console.log(typeof this.displayedCountries[0].id);
    }
  }

  onSubmit(form: NgForm) {
    console.info('this.userHasCustomClub', this.userHasCustomClub);
    console.info('this.userHasNoClub', this.userHasNoClub);
    // console.log('Form:', this.nationControl.value);
    // return;

    // Manually validate only the required fields
    if (!this.dateOfBirth.value) {
      this.toastr.warning(this.dobRequired, this.errorTxt);
      return;
    }

    if (!this.CurrentTeamId && this.currentClubId && !this.userHasCustomClub) {
      this.isTeamSelectError = true;
      if (!this.userHasNoClub) {
        return;
      }
    } else {
      this.isTeamSelectError = false;
    }


    // return team ? team.team_type : "Team ID not found.";
    // console.log('Team',team.team_type)

    const formData = new FormData();
    if (!this.userHasNoClub) {
      // if (!this.nationControl.value || this.nationControl.value.length === 0) {
      //   this.nationError = true;
      //   this.toastr.warning(this.nationalityRequired, this.errorTxt);
      //   return;
      // }

      // Append Nationality array
      // this.nationality.forEach((nation: any) => {
      //   formData.append('user[nationality][]', nation);
      // });



    }

    if (!this.nationControl.value || this.nationControl.value.length === 0) {
      this.nationError = true;
      this.toastr.warning(this.nationalityRequired, this.errorTxt);
      return;
    }

    const selectedNations = this.nationControl.value || [];
    if (selectedNations) {
      selectedNations.forEach((nation: any) => {
        formData.append('user[nationality][]', nation);
      });
    }
    if (!this.dominantFoot) {
      this.toastr.warning(this.dominantFootRequired, this.errorTxt);
      return;
    }

    // Enable loading state and notify user
    this.toastr.info(this.Processing, this.pleaseWait, { disableTimeOut: true });


    formData.append('user[team_type]', this.team_type);

    // Format and append required fields
    const formattedDateOfBirth = moment(this.dateOfBirth.value).format('YYYY-MM-DD');
    formData.append('user[date_of_birth]', formattedDateOfBirth);
    formData.append('user[foot]', this.dominantFoot);


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
    if (this.leagueLevel) formData.append('user[league_level]', this.leagueLevel + '');
    if (this.firstName) formData.append('user[first_name]', this.firstName);
    if (this.lastName) formData.append('user[last_name]', this.lastName);
    if (this.birthCountry) formData.append('user[birth_country]', this.birthCountry);
    let lang = localStorage.getItem('lang_id') + '';
    formData.append('lang', lang);

    let details;

    if (this.userHasCustomClub === true) {
      formData.append('user[have_custom_club]', '1');
      formData.append('user[have_registered_club]', '0');
      formData.append('user[have_no_club]', '0');
      formData.append('user[custom_club]', this.custom_club);
      formData.append('user[custom_team]', this.custom_team);
      formData.append('user[custom_club_country]', this.custom_club_country + '');
      // details = 'You Have Custom Club With Name ' + this.custom_club + ' And Team is ' + this.custom_team;
    } else {
      formData.append('user[have_custom_club]', '0');
      formData.append('user[have_registered_club]', '1');
      formData.append('user[have_no_club]', '0');
      formData.append('user[registered_club]', this.currentClubId);
      formData.append('user[registered_club_team_type]', this.team_type);
      formData.append('user[registered_club_team]', this.CurrentTeamId + '');
      // details = 'You Have registered Club With id ' + this.currentClubId + ' And Team ID is ' + this.CurrentTeamId;
    }

    if (this.userHasNoClub === true) {
      details = 'You Have no club no registred no custom';
      formData.append('user[have_no_club]', '1');
      formData.append('user[have_custom_club]', '0');
      formData.append('user[have_registered_club]', '0');
    } else {
      formData.append('user[have_no_club]', '0');
    }

    if (this.CurrentTeamId != this.previousTeamId && !this.isreadOnlyContract && !this.userHasCustomClub && !this.userHasNoClub) {
      formData.append('user[current_club_removed]', String(this.previousTeamId));
    }

    console.info('details', details)


    // API call for submitting form data
    this.talentService.updateUserProfile(formData).subscribe(
      (response: any) => {
        if (response?.status) {
          this.toastr.clear();
          if (response?.message != '' && response?.message != undefined) {
            this.toastr.success(response?.message, this.successTxt);
          } else {
            this.toastr.success('Profile updated successfully!', 'Success');
          }
          this.dialogRef.close(response.data);
        } else {
          this.toastr.clear();
          this.toastr.error('Unexpected error occurred. Please try again.', this.errorTxt);
          console.error('API response error:', response);
        }
      },
      (error: any) => {
        this.toastr.error('Failed to submit profile. Please try again.', 'Error');
        console.error('Error submitting the form:', error);
      },
    );
  }

  loadLeagues(): void {

    // Prepare query parameters
    let params: any = {
      lang: localStorage.getItem('lang_id'),
    };

    this.talentService.getLeagues(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.leagueLevels = response.data.leagues;
          //this.setSeletedValue();
        } else {
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching leagues:', error);
      }
    );
  }
  trackById(index: number, club: any): number {
    return club.id;
  }
  setSeletedValue() {
    setTimeout(() => {
      // this.selectedLeagueId = this.user.meta.league_level || 1;
      alert('done')
    }, 500);
  }

  getJsonTranslations() {
    this.translateService.get(['success!', 'error', 'nationalityRequired', 'dobRequired', 'dominantFootRequired', 'Processing', 'pleaseWait']).subscribe((translations) => {
      this.successTxt = translations['success!'];
      this.errorTxt = translations['error'];
      this.nationalityRequired = translations['nationalityRequired'];
      this.dobRequired = translations['dobRequired'];
      this.dominantFootRequired = translations['dominantFootRequired'];
      this.Processing = translations['Processing'];
      this.pleaseWait = translations['pleaseWait'];
      console.log('Title fetch Function Fired');
    })
  }
  clubUpdated() {
    console.warn('Function called');
    this.loadTeams(this.currentClubId, this.team_type)
    this.isreadOnlyContract = false;
  }

  loadTeams(club_id: any, teamType: string): void {
    this.teamsArr = [];
    this.talentService.getClubTeamsByGroup(club_id, teamType).subscribe(
      (response: any) => {
        if (response.status) {
          this.teamsArr = response.data.teams;
          this.cdr.detectChanges();
        } else {
          this.teamsArr = [];
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching leagues:', error);
      }
    );
  }
  onDropdownOpen() {
    this.clubSearch = '';
    this.searchedClubs = [...this.playerClubsListing];
  }

  filterClubs(event: KeyboardEvent) {

    let query = this.clubSearch.toLowerCase(); // no trim()
    console.info('query is ', query);

    console.log(event.key);  // This will print the key being pressed, e.g., " " for space
    // if (!query) {
    //   this.filteredClubs = [];
    //   return;
    // }
    // console.warn(this.playerClubsListing)
    // Special handling for space
    // console.log('query is ', query);
    if (event.key === ' ' || event.key === 'Spacebar') {
      query = query + '';
    }

    // this.searchedClubs = this.playerClubsListing.filter((club: any) =>
    //   club.club_name.toLowerCase().includes(query.toLowerCase())
    // );

    this.searchedClubs = this.playerClubsListing.filter((club: any) => {
      // Normalize the spaces in the search query
      const normalizedQuery = query.trim().replace(/\s+/g, ' ').toLowerCase();

      // Check if the club name contains the normalized query
      return club.club_name.toLowerCase().includes(normalizedQuery);
    });


  }



  filterCountries(event: any) {
    const keyword = event.target.value.toLowerCase();
    this.nationSearch = keyword;

    if (keyword === '') {
      this.displayedCountries = [...this.countries];
    } else {
      // First, get countries that start with the keyword
      const startsWith = this.countries.filter((c: any) =>
        c.country_name.toLowerCase().startsWith(keyword)
      );

      // Then, get countries that contain the keyword but not start with it
      const contains = this.countries.filter((c: any) =>
        !c.country_name.toLowerCase().startsWith(keyword) &&
        c.country_name.toLowerCase().includes(keyword)
      );

      // Combine them: startsWith first, then contains
      const matched = [...startsWith, ...contains];

      // Always keep already selected countries in the list
      const selected = this.countries.filter((c: any) =>
        this.nationality.includes(c.id)
      );

      // Merge matched + selected and remove duplicates
      const combined = [...matched, ...selected];
      const unique = combined.filter((value, index, self) =>
        index === self.findIndex((t) => t.id === value.id)
      );

      this.displayedCountries = unique;
    }
  }


  displayedCountries2: any = [];
  filterCountries2(event: any) {
    const keyword = event.target.value.toLowerCase();
    this.custom_club_search = keyword;

    if (keyword === '') {
      this.displayedCountries2 = [...this.countries];
    } else {
      // First, get countries that start with the keyword
      this.displayedCountries2 = this.countries.filter((club: any) =>
        club.country_name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
  }


  trackByCountryId(index: number, country: any): number {
    return country.id;
  }


  onNoClubChange(value: boolean) {
    this.isHideClubSection = value;
    this.userHasNoClub = value;
    if (this.userHasNoClub) {
      this.onChnageCustomClubTeam(false);
    }
  }



  onChnageCustomClubTeam(value: boolean) {
    this.isCustomClubTeam = value;
    if (value === true) {
      this.isHideClubSection = false;
      this.userHasNoClub = false;
      this.isreadOnlyContract = false;
    } else {
      this.isreadOnlyContract = true;
    }
    this.userHasCustomClub = value;
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.stopPropagation(); // Prevent event from reaching mat-select
    }

  }

  onKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Prevent non-numeric characters
    }
  }
  openDatePicker(datepicker: MatDatepicker<any>) {
    datepicker.open();  // Opens the date picker
  }
}
