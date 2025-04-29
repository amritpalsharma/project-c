import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, NgForm } from '@angular/forms';
import { ScoutService } from '../../../services/scout.service';
import { ToastrService } from 'ngx-toastr';
import { TalentService } from '../../../services/talent.service';

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-edit-personal-details',
  templateUrl: './edit-personal-details.component.html',
  styleUrls: ['./edit-personal-details.component.scss'],
})
export class EditPersonalDetailsComponent implements OnInit {

  club_name: any;
  readonly date = new FormControl(moment());
  formation_date: FormControl = new FormControl(null);  // Initialize with null or the correct date format

  since: string = '';
  contactNumber: string = '';
  website: string = '';
  zipcode: string = '';
  address: string = '';
  social_facebook: string = '';
  social_instagram: string = '';
  social_tiktok: string = '';
  social_vimeo: string = '';
  social_x: string = ''; // assuming this is for Twitter (X)
  social_youtube: string = '';

  sm_x: any = "";
  sm_facebook: any = "";
  sm_instagram: any = "";
  sm_tiktok: any = "";
  sm_youtube: any = "";
  sm_vimeo: any = "";

  socialMediaPlatforms = [
    { id: 'x', name: 'X (Twitter)', placeholder: 'x.com/' },
    { id: 'facebook', name: 'Facebook', placeholder: 'facebook.com/' },
    { id: 'instagram', name: 'Instagram', placeholder: 'instagram.com/' },
    { id: 'tiktok', name: 'TikTok', placeholder: 'tiktok.com/' },
    { id: 'youtube', name: 'YouTube', placeholder: 'youtube.com/' },
    { id: 'vimeo', name: 'Vimeo', placeholder: 'vimeo.com/' },
  ];

  cities: string[] = ['City1', 'City2', 'City3']; // Example cities
  countries: any;
  leagueLevels: string[] = ['Amateur', 'Professional', 'Semi-Pro'];
  teams: any[] = [];
  selectedClub: string = '';
  user: any = localStorage.getItem('userData');
  loggedInUser: any = localStorage.getItem('userData');
  userId: any;
  userNationalities: any;

  // Declare individual properties for binding
  dateOfBirth: string = '';
  height: number = 0;
  heightUnit: string = 'cm';
  weight: number = 0;
  weightUnit: string = 'kg';
  contractStart: string = '';
  contractEnd: string = '';
  leagueLevel: string = '';
  placeOfBirth: string = '';
  dominantFoot: string = 'Right'; // Set a default value for dominant foot
  currentClub: string = '';
  firstName: string = '';
  lastName: string = '';
  nationality: any = ''; // Ensure this is set correctly
  company_name: any;
  contact_number: any;
  cover_image: any;
  cover_image_path: any;
  designation: any;
  profile_image: any;
  profile_image_path: any;
  teamsArr: any;
  isPremium: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<EditPersonalDetailsComponent>,
    private scoutService: ScoutService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private talentService: TalentService,
  ) { }

  theme: any = localStorage.getItem('theme');

  ngOnInit(): void {
    if(this.data != '' && this.data.isPremium != ''){
      this.isPremium = this.data.isPremium;
    }
    console.info('dataArr',this.data)
    this.theme = localStorage.getItem('theme');
    this.user = JSON.parse(this.user);
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.userId = this.loggedInUser.id;
    this.loadTeams();
    this.loadCountries();
    this.getUserProfile(this.userId);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadTeams(): void {
    this.scoutService.getClubs().subscribe(
      (response: any) => {
        if (response && response.status) {
          this.teams = response.data.clubs;
          console.log(this.teams)
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  loadCountries(): void {
    this.scoutService.getCountries().subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
          console.log('countries', this.countries)
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  getUserProfile(userId: any) {
    this.scoutService.getProfileData(userId).subscribe((response: any) => {
      if (response && response.status && response.data && response.data.user_data) {
        this.user = response.data.user_data;
        // console.info('this.user',this.user);

        // Update component properties with user data
        if (this.user?.meta) {
          this.address = this.user.meta.address;
          this.since = this.user.meta.since;
          // this.club_name = this.user?.meta?.club_name;
          this.club_name = this.user.current_club_name;
          this.contact_number = this.user.meta.contact_number;
          this.cover_image = this.user.meta.cover_image;
          this.cover_image_path = this.user.meta.cover_image_path;
          this.designation = this.user.meta.designation;
          this.profile_image = this.user.meta.profile_image;
          this.profile_image_path = this.user.meta.profile_image_path;
          this.designation = this.user.meta.designation;
          this.sm_facebook = this.user.meta.sm_facebook;
          this.sm_instagram = this.user.meta.sm_instagram;
          this.sm_tiktok = this.user.meta.sm_tiktok;
          this.sm_vimeo = this.user.meta.sm_vimeo;
          this.sm_x = this.user.meta.sm_x;
          this.sm_youtube = this.user.meta.sm_youtube;
          this.website = this.user.meta.website;
          this.zipcode = this.user.meta.zipcode;
          // this.nationality = this.user.meta.nationality;
          this.userNationalities = JSON.parse(this.user.user_nationalities);
          // console.info(this.userNationalities)
          // if (this.userNationalities[0].country_id != '') {
          //   this.nationality = this.userNationalities[0].country_id;
          // }
          if (this.user.current_club_country && this.user.current_club_country != '') {
            this.nationality = this.getCountryIdByName(this.user.current_club_country);
          }
          this.formation_date = new FormControl(
            this.user?.meta?.formation_date
              ? this.formatDate(this.user.meta.formation_date)
              : null
          );
          console.log(this.formation_date)
        }
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  getCountryIdByName(countryName: string): string | null {
    let countries = this.countries;
    if (!countryName || !Array.isArray(countries)) return null;

    const match = countries.find(
      country => country.country_name?.toLowerCase().trim() === countryName.toLowerCase().trim()
    );

    return match ? match.id : null;
  }


  onSubmit(form: NgForm) {
    if (form.valid) {
      let lang_id = localStorage.getItem('lang_id');
      console.log('Form Data:', form.value);
      this.dialogRef.close(form.value);
      const formData = new FormData();
      console.log('Date From Modal ', this.formation_date);
      const formattedFormationDate = moment(this.formation_date.value).format('YYYY-MM-DD');
      console.log('Date After Convert ', this.formation_date);
      formData.append('user[address]', this.address);
      formData.append('user[since]', this.since);
      formData.append('user[club_name]', this.club_name);
      formData.append('user[contact_number]', this.contact_number);
      formData.append('user[formation_date]', formattedFormationDate);
      formData.append('user[sm_facebook]', this.sm_facebook);
      formData.append('user[sm_instagram]', this.sm_instagram);
      formData.append('user[sm_tiktok]', this.sm_tiktok);
      formData.append('user[sm_vimeo]', this.sm_vimeo);
      formData.append('user[sm_x]', this.sm_x);
      formData.append('user[sm_youtube]', this.sm_youtube);
      formData.append('user[website]', this.website);
      formData.append('user[zipcode]', this.zipcode);
      formData.append('lang', lang_id + '');
      formData.append('user[nationality][]', this.nationality);

      this.scoutService.updateUserProfile(formData).subscribe(
        (response: any) => {
          console.log('Form submitted successfully:', response);
          if (response.message != '') {
            this.toastr.success(response.message, '');
            this.dialogRef.close(response.message);
          } else {
            this.dialogRef.close(response.data);
          }
        },
        (error: any) => {
          console.error('Error submitting the form:', error);
        }
      );
    } else {
      this.dialogRef.close('all_field_required');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  onValueChange() {
    // console.log('Selected Value:', event.value);
    console.info('selected country is ', this.nationality)
    this.loadTeamsForCountry(this.nationality);
    // Your logic here
  }

  loadTeamsForCountry(club_id: any): void {


    this.talentService.getClubTeams(club_id).subscribe(
      (response: any) => {
        if (response.status) {
          this.teamsArr = response.data.teams;
        } else {
          this.teamsArr = [];
          // console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching leagues:', error);
      }
    );
  }

  

}
