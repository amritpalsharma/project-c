import { Component } from '@angular/core';
import { TalentService } from '../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCountryComponent } from './add-country/add-country.component';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'shared-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']  // Corrected here
})
export class CountriesComponent {
  countries: any ;
  selectedCategory: string = 'all';
  countriesPerPage: number = 4;
  currentPage: number = 0;
  flag_path:any;
  filteredImages: any[] = [];  // Fixed: explicitly set as an array
  paginatedImages: any[] = [];
  defaultCountry : any;
  loggedInUser:any = localStorage.getItem('userData');
  premium : any =[];
  country: any=[];
  booster: any=[];
  demo: any=[];
  userInfo : any=[];
  filteredCountries:any;

  constructor( private talentService: TalentService ,public dialog: MatDialog,public webPages : WebPages)  {}

  ngOnInit() {
    this.userInfo = localStorage.getItem('userInfo');
    this.userInfo = JSON.parse(this.userInfo);

    this.loggedInUser = JSON.parse(this.loggedInUser);

    this.loadCountries();


    this.webPages.languageId$.subscribe((data) => {
      this.loadCountries();
    });
  }
  
  loadCountries(): void {

    let params:any = {};
    params.lang  = localStorage.getItem('lang_id');

    this.talentService.getUserDomains(params).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.domains;
          this.flag_path = response.data.logo_path;

          // Filter the countries where is_package_active == 'active'
          this.filteredCountries = this.countries.filter((country:any) => country.is_package_active == 'active');

        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  selectedCountries: string[] = []; // Store selected country names here

  toggleCountrySelection(country: any) {
    if(country.is_default==1 || country.is_package_active=='active'){
      return
    }
    this.addCountryPopup(country);
  }

  addCountryPopup(country:any){
    const dialogRef = this.dialog.open(AddCountryComponent, {
      width: '600px',
      data: { 
        country: country ,
      }
    });
  }

  
  
  // Fetch purchases from API with pagination parameters
  getUserPlans(): void {
    this.talentService.getUserPlans().subscribe(
      response => {
        if (response?.status && response?.data) {
          const userPlans = response.data.packages;

          // Use optional chaining and nullish coalescing to handle undefined/null
          this.premium = Array.isArray(userPlans?.premium) && userPlans.premium.length > 0 ? userPlans.premium : [];
          this.demo = Array.isArray(userPlans?.demo) && userPlans.demo.length > 0 ? userPlans.demo : [];
          this.booster = Array.isArray(userPlans?.booster) && userPlans.booster.length > 0 ? userPlans.booster : [];

          // Assign the last index of premium and booster arrays
          this.premium = this.premium.length > 0 ? this.premium[0] : null;
          this.booster = this.booster.length > 0 ? this.booster[0] : null;
          this.demo = this.demo.length > 0 ? this.demo[0] : null;

          this.country = userPlans?.country || ''; // Default to empty string if country is undefined

          console.log('userPlans', userPlans);
        } else {
          console.error('Invalid API response:', response);
        }
      },
      error => {
        console.error('Error fetching user purchases:', error);
      }
    );
  }
}
