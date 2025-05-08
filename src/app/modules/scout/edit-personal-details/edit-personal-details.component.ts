import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, NgForm } from '@angular/forms';
import { ScoutService } from '../../../services/scout.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket.service';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-edit-personal-details',
  templateUrl: './edit-personal-details.component.html',
  styleUrls: ['./edit-personal-details.component.scss'],
})
export class EditPersonalDetailsComponent implements OnInit {

  clubName: string = '';
  readonly date = new FormControl(moment());

  formationDate: string = '';
  city: string = '';
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
  scoutNation: number = 0;
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
  nationality: string = '';
  company_name: any;
  contact_number: any;
  cover_image: any;
  cover_image_path: any;
  country: any;
  profile_image: any;
  profile_image_path: any;

  // Json KeyWords
  successTxt: string = '';
  errorTxt: string = '';
  enterYourCompanyName: string = '';
  dobRequired: string = '';
  dominantFootRequired: string = '';
  Processing: string = '';
  pleaseWait: string = '';
  requiredFieldsMessage: string = '';
  phoneRequired: string = '';
  designation: any;
  isPremium: boolean = false;
  isUserVerified: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<EditPersonalDetailsComponent>,
    private scoutService: ScoutService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    public webPages: WebPages,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog,
    private socketService: SocketService,
  ) { }

  theme: any = localStorage.getItem('theme');

  ngOnInit(): void {

    if (this.data != '' && this.data.isPremium != '') {
      this.isPremium = this.data.isPremium;
    }
    this.theme = localStorage.getItem('theme');
    this.user = JSON.parse(this.user);
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.userId = this.loggedInUser.id;
    this.loadTeams();
    this.loadCountries();
    this.getUserProfile(this.userId);

    this.getJsonTranslations();
    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
    });
    this.getUserStatus();
  }
  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      if (result == 2) {
        this.isUserVerified = true;
      } else {
        this.isUserVerified = false;
      }
    });
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

        // Update component properties with user data
        if (this.user.meta) {
          this.address = this.user.meta.address;
          this.city = this.user.meta.city;
          this.company_name = this.user.meta.company_name;
          this.contact_number = this.user.meta.contact_number;
          this.cover_image = this.user.meta.cover_image;
          this.cover_image_path = this.user.meta.cover_image_path;
          this.designation = this.user.meta.designation;
          this.country = this.user.meta.user_nationalities;
          this.profile_image = this.user.meta.profile_image;
          this.profile_image_path = this.user.meta.profile_image_path;
          this.sm_facebook = this.user.meta.sm_facebook;
          this.sm_instagram = this.user.meta.sm_instagram;
          this.sm_tiktok = this.user.meta.sm_tiktok;
          this.sm_vimeo = this.user.meta.sm_vimeo;
          this.sm_x = this.user.meta.sm_x;
          this.sm_youtube = this.user.meta.sm_youtube;
          this.website = this.user.meta.website;
          this.zipcode = this.user.meta.zipcode;

          // scoutNation
        }
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  onSubmit(form: NgForm) {
    // if (!this.company_name) {
    //   this.toastr.error(this.enterYourCompanyName, this.errorTxt);
    //   return;
    // }
    // if (!this.contact_number) {
    //   this.toastr.error(this.phoneRequired, this.errorTxt);
    //   return;
    // }
    // if (form.valid) {

    console.log('Form Data:', form.value);
    this.dialogRef.close(form.value);
    const formData = new FormData();

    formData.append('user[address]', this.address);
    formData.append('user[city]', this.city);
    formData.append('user[company_name]', this.company_name);
    formData.append('user[contact_number]', this.contact_number);
    // formData.append('user[cover_image]' , this.cover_image);
    // formData.append('user[cover_image_path]' , this.cover_image_path);
    formData.append('user[designation]', this.designation);
    formData.append('user[nationality][]', this.country);
    // user[nationality][]
    // formData.append('user[profile_image]' , this.profile_image);
    // formData.append('user[profile_image_path]' , this.profile_image_path);
    formData.append('user[sm_facebook]', this.sm_facebook);
    formData.append('user[sm_instagram]', this.sm_instagram);
    formData.append('user[sm_tiktok]', this.sm_tiktok);
    formData.append('user[sm_vimeo]', this.sm_vimeo);
    formData.append('user[sm_x]', this.sm_x);
    formData.append('user[sm_youtube]', this.sm_youtube);
    formData.append('user[website]', this.website);
    formData.append('user[zipcode]', this.zipcode);

    this.scoutService.updateUserProfile(formData).subscribe(
      (response: any) => {
        console.log('Form submitted successfully:', response);
        if (response.stats == true && response.message != '') {
          this.toastr.success(response.message);
        }
        this.dialogRef.close(response);
        // this.dialogRef.close(response.data);
      },
      (error: any) => {
        console.error('Error submitting the form:', error);
      }
    );
    // }
  }


  getJsonTranslations() {
    this.translateService.get(['success!', 'error', 'enterYourCompanyName', 'dobRequired', 'dominantFootRequired', 'Processing', 'pleaseWait', 'requiredFieldsMessage', 'phoneRequired']).subscribe((translations) => {
      this.successTxt = translations['success!'];
      this.errorTxt = translations['error'];
      this.enterYourCompanyName = translations['enterYourCompanyName'];
      this.dobRequired = translations['dobRequired'];
      this.dominantFootRequired = translations['dominantFootRequired'];
      this.Processing = translations['Processing'];
      this.pleaseWait = translations['pleaseWait'];
      this.requiredFieldsMessage = translations['requiredFieldsMessage'];
      this.phoneRequired = translations['phoneRequired'];
      console.log('Title fetch Function Fired');
    })
  }

  navigatePlans() {
    this.dialogRef.close();
    setTimeout(() => {
      this.router.navigate(['/scout/plans']);
    }, 500);
  }

  showVerificationPopup() {
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
  }

}
