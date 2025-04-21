import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { TalentService } from '../../../services/talent.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { ScoutService } from '../../../services/scout.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';
import { lang } from 'moment';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { TitleService } from '../../../title.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'shared-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private talentService: TalentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService,
    private translateService: TranslateService,
    public webPages: WebPages,
    private globalSettings: GlobalSettingsService,
    private titleService: TitleService,
    private userService: UserService,
  ) {
    this.language = translateService.currentLang || 'en';  // Get current language
    this.loadRoles(this.language);  // Load Roles based on selected language
    this.getJsonTranslations();
    translateService.onLangChange.subscribe(() => {
      this.language = translateService.currentLang;
      console.log(this.language);
      this.loadRoles(this.language);
      this.getJsonTranslations();
    });
  }
  pageTitle: string = '';
  generalError: string = '';
  errorText: string = '';
  userDomain: number = this.globalSettings.getdomainId();
  players: any[] = [];
  pageSize = 15; // Default page size
  totalItems: number = 0;
  currentPage: number = 1;
  pageSizeOptions: number[] = [5, 10, 15, 20]; // Added page size options
  userNationalities: any = [];
  nation: any = [];
  ageRange: number[] = [];

  roles: any = [];

  positions: any[] = [];
  countries: any;
  clubs: any;
  leagues: any;

  // Filters
  selectedRole: number | null = null;
  selectedCountry: number | null = null;
  selectedPositions: any;
  selectedAge: any;
  selectedFoot: any;
  selectedTopSpeed: string | null = null;
  selectedLeague: number | null = null;
  selectedClub: number | null = null;
  loggedInUser: any = localStorage.getItem('userData');
  language: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filters and UI variables (other code omitted for brevity)
  viewsTracked: { [profileId: string]: { viewed: boolean, clicked: boolean } } = {}; // Track view and click per profile
  isLoading: boolean = false;
  noUsersFound: boolean = false;

  // roles_en = [
  //   { role: 'Clubs', id: 2 },
  //   { role: 'Scouts', id: 3 },
  //   { role: 'Talents', id: 4 },
  //   // { role: 'League', id: 5 }
  // ];

  // roles_de = [
  //   { role: 'Verein', id: 2 },
  //   { role: 'Scout', id: 3 },
  //   { role: 'Talent', id: 4 },
  //   { role: 'Liga', id: 5 }
  // ];

  // roles_dk = [
  //   { role: 'Klub', id: 2 },
  //   { role: 'Spejder', id: 3 },
  //   { role: 'Talent', id: 4 },
  //   { role: 'Liga', id: 5 }
  // ];

  // roles_es = [
  //   { role: 'Club', id: 2 },
  //   { role: 'Ojeador', id: 3 },
  //   { role: 'Talento', id: 4 },
  //   { role: 'Liga', id: 5 }
  // ];

  // roles_fr = [
  //   { role: 'Club', id: 2 },
  //   { role: 'Recruteur', id: 3 },
  //   { role: 'Talent', id: 4 },
  //   { role: 'Ligue', id: 5 }
  // ];

  // roles_it = [
  //   { role: 'Club', id: 2 },
  //   { role: 'Osservatore', id: 3 },
  //   { role: 'Talento', id: 4 },
  //   { role: 'Lega', id: 5 }
  // ];

  // roles_pt = [
  //   { role: 'Clube', id: 2 },
  //   { role: 'Olheiro', id: 3 },
  //   { role: 'Talento', id: 4 },
  //   { role: 'Liga', id: 5 }
  // ];

  // roles_se = [
  //   { role: 'Klubb', id: 2 },
  //   { role: 'Scout', id: 3 },
  //   { role: 'Talang', id: 4 },
  //   { role: 'Liga', id: 5 }
  // ];

  totalPagesCount: number = 1;
  itemsPerPage: number = 15;

  baseUrl:string='';

  ngOnInit(): void {

    this.loggedInUser = JSON.parse(this.loggedInUser);

    this.loadPositions();
    // this.loadLeagues();
    // this.loadClubs();
    this.loadCountries();
    this.getUsers();

    // Populate ageRange with numbers from 15 to 50
    this.ageRange = Array.from({ length: 50 - 15 + 1 }, (_, i) => i + 15);
    // Initialize viewsTracked from sessionStorage
    this.loadTrackedViews();

    this.webPages.languageId$.subscribe((data) => {
      this.loadPositions();
      // this.loadLeagues();
      // this.loadClubs();
      this.loadCountries();
      this.getUsers();
    });

  }

  private loadTrackedViews() {
    const views = sessionStorage.getItem('viewsTracked');
    if (views) {
      this.viewsTracked = JSON.parse(views);
    }
  }

  loadRoles(lang: string) {
    const currentRole: { [key: string]: any } = {
      // en: this.roles_en,
      // de: this.roles_de,
      // dk: this.roles_dk,
      // es: this.roles_es,
      // fr: this.roles_fr,
      // it: this.roles_it,
      // pt: this.roles_pt,
      // se: this.roles_se
    };

    // this.roles = currentRole[lang] || this.roles_en;

    this.userService.getRoles().subscribe((response) => {
      this.roles = response.data.roles;
      // this.roles.forEach((role: any) => {
      //   this.setDynamicRoles(role);
      // });
      // console.log(this.roles)
      let updatedRoles = this.roles.filter((role: any) => role.id !== "1");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "5");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "6");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "7");
      this.roles = updatedRoles;
    });
  }

  private trackBoostedProfileViews(players: any[]) {
    // Collect all profile IDs that need to be tracked
    const profilesToTrack = players
      .filter(player => player.package_name === 'Booster')
      .filter(profile => !this.viewsTracked[profile.id]?.viewed && this.loggedInUser.id !== profile.id)
      .map(profile => profile.id); // Collect profile IDs into an array

    // Check if we have profiles to track
    if (profilesToTrack.length > 0) {
      // Send the array of profile IDs in a single API call
      this.talentService.trackProfiles(this.loggedInUser.id, profilesToTrack, 'view').subscribe(
        (response) => {
          console.log(`Views tracked for profiles: ${profilesToTrack.join(', ')}`);

          // Update the local viewsTracked object
          profilesToTrack.forEach(profileId => {
            this.viewsTracked[profileId] = { ...this.viewsTracked[profileId], viewed: true };
          });

          // Save the updated viewsTracked state
          this.saveTrackedViews();
        },
        // error: (error) => console.error('Error tracking profile views', error)
      );
    }
  }

  private saveTrackedViews() {
    sessionStorage.setItem('viewsTracked', JSON.stringify(this.viewsTracked));
  }

  // Track profile click only once per session
  private trackProfileClick(profileId: number) {
    const id: any[] = [profileId];  // Create an array of profileId

    if (!this.viewsTracked[profileId]?.clicked) {
      this.talentService.trackProfiles(this.loggedInUser.id, id, 'click').subscribe(
        (response) => {
          console.log(`Click tracked for profile ${profileId}`);
          this.viewsTracked[profileId] = { ...this.viewsTracked[profileId], clicked: true };
          this.saveTrackedViews();  // Save the updated viewsTracked
        },
        // error: (error) => console.error('Error tracking profile click', error)
      );
    }
  }

  exploreUser(slug: string, id: number): void {
    this.trackProfileClick(id); // Track the click before navigation

    slug = slug.toLowerCase();

    if (slug == 'späher' || slug == 'spähervertreter' || slug == 'scout representator' || slug == 'Rappresentante Scout' || slug == 'Représentant Éclaireur' || slug == 'Representante de Explorador' || slug == 'Representante do Escoteiro' || slug == 'Spejderrepræsentant' || slug == 'Scoutrepresentant') {
      slug = 'scout';
    }

    if (slug == 'vereinsvertreter' || slug == 'Rappresentante del Club' || slug == 'Représentant du Club' || slug == 'Representante del Club' || slug == 'verein' || slug == 'Klub' || slug == 'Klubb' || slug == 'vereinsvertreter' || slug == 'club representator') {
      slug = 'club';
    }

    if (slug == 'talento' || slug == 'Talang') {
      slug = 'talent';
    }
    const pageRoute = 'view/' + slug.toLowerCase();
    //console.log(pageRoute);
    this.router.navigate([pageRoute, id], { state: { role: slug } });

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    this.socketService.emit("profileViewed", { senderId: userId, receiverId: id })
  }

  flag: boolean = true;

  // Event handler for page change in paginator
  getUsers() {
    this.isLoading = true; // Start loading

    const pageIndex = this.currentPage;
    // const pageSize = this.pageSize;
    const pageSize = this.itemsPerPage;
    let offset = (this.currentPage - 1) * this.itemsPerPage;
    if (offset < 5) {
      offset = 0; // when first time API HIT
    }
    // Construct the params object with complex whereClause and metaQuery logic
    let params: any = {
      // offset: pageIndex * pageSize,
      offset: offset,
      limit: pageSize,
      whereClause: {
        role: this.selectedRole,
        location: this.selectedCountry,
        age: this.selectedAge,
        position: this.selectedPositions,
        user_domain: this.userDomain
      },
      metaQuery: [],
      lang: localStorage.getItem('lang_id')
    };

    // Add other filters if they are selected
    if (this.selectedFoot) {
      params.metaQuery.push({
        meta_key: 'foot',
        meta_value: this.selectedFoot,
        operator: '='
      });
    }

    if (this.selectedTopSpeed) {
      params.metaQuery.push({
        meta_key: 'top_speed',
        meta_value: this.selectedTopSpeed,
        operator: '='
      });
    }

    if (this.selectedLeague) {
      params.metaQuery.push({
        meta_key: 'league',
        meta_value: this.selectedLeague,
        operator: '='
      });
    }

    if (this.selectedClub) {
      params.metaQuery.push({
        meta_key: 'club',
        meta_value: this.selectedClub,
        operator: '='
      });
    }

    // Clean null or empty filters from whereClause
    Object.keys(params.whereClause).forEach(key => {
      if (params.whereClause[key] === null || params.whereClause[key] === undefined || params.whereClause[key]?.length === 0) {
        delete params.whereClause[key];
      }
    });


    // Call service to fetch filtered data
    this.noUsersFound = true;
    this.talentService.getExploresData(params).subscribe({
      next: (response) => {
        if (response?.status && response?.data) {
          this.players = response.data.userData.users;
          this.totalItems = response.data.userData.totalCount;
          this.totalPagesCount = Math.ceil(response.data.userData.totalCount / this.itemsPerPage);
          this.noUsersFound = false;
          this.baseUrl = response.data.userData.imagePath;
          if (this.totalItems < 0 || this.totalItems == 0) {
            this.noUsersFound = true;
          }
          if (this.flag) {
            this.trackBoostedProfileViews(this.players); // Track views if necessary
            this.flag = false;
          }
          setTimeout(() => this.cdr.detectChanges(), 0);
        } else {
          this.toastr.error(this.generalError, this.errorText);
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.toastr.error(this.generalError, this.errorText);
      },
      complete: () => {
        this.isLoading = false; // End loading
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getUsers();
  }

  // Apply filter function to refresh the data when filters change
  applyFilter() {
    this.currentPage = 0; // Reset to first page when applying new filters
    this.getUsers();
    if (this.selectedCountry != 0 && this.selectedCountry != undefined) {
      this.loadLeagues();
      // this.loadClubs();
    }
  }

  loadCountries(): void {
    // Prepare query parameters

    let lang = localStorage.getItem('lang_id');
    // old getDomains 

    this.talentService.getExploreDomains(lang).subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.domains;
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  loadPositions(): void {

    // Prepare query parameters
    let params: any = {
      lang: localStorage.getItem('lang_id'),
    };
    let lang = localStorage.getItem('lang_id');
    this.talentService.getPositionswithLang(lang).subscribe(
      (response: any) => {
        if (response.status) {
          this.positions = response.data.positions;
        } else {
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching positions:', error);
      }
    );
  }

  loadLeagues(): void {

    // Prepare query parameters
    let params: any = {
      lang: localStorage.getItem('lang_id'),
    };
    if (this.selectedCountry != 0 && this.selectedCountry != undefined) {

      let getCountryById = this.countries.find((val: any) => {
        return val.id == this.selectedCountry;
      });
      if (getCountryById && getCountryById.country_id != '' && getCountryById.country_id != undefined) {
        params = {
          lang: localStorage.getItem('lang_id'),
          country_id: getCountryById.country_id,
        }
      }
    }

    this.talentService.getLeagues(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.leagues = response.data.leagues;
        } else {
          this.leagues = [];
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching leagues:', error);
      }
    );
  }

  leagueFilter() {
    this.loadClubs();
  }
  loadClubs(): void {
    // Prepare query parameters
    let params: any = {
      lang: localStorage.getItem('lang_id'),
    };

    if (this.selectedCountry != 0 && this.selectedCountry != undefined) {
      let getCountryById = this.countries.find((val: any) => {
        return val.id == this.selectedCountry;
      });
      if (getCountryById && getCountryById.country_id != '' && getCountryById.country_id != undefined) {
        params = {
          lang: localStorage.getItem('lang_id'),
          country: getCountryById.country_id,
          is_taken: 'no'
        }
      }
    }
    this.talentService.getClubs(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.clubs = response.data.clubs;
        } else {
          this.clubs = [];
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching clubs:', error);
      }
    );
  }

  // Get the nationality flag (assuming userNationalities is a JSON string)
  getNationality(userNationalities: string): string {
    const parsedNationalities = JSON.parse(userNationalities);
    return parsedNationalities.length > 0 ? parsedNationalities[0].flag_path : '';
  }

  getSelectedFilters() {

    const filters = [];
    if (this.selectedRole) {
      filters.push({ label: 'category', value: this.selectedRole });
    }
    if (this.selectedCountry) {
      let getCountryById = this.countries.find((val: any) => {
        return val.id == this.selectedCountry;
      });
      filters.push({ label: 'country', value: getCountryById.location });
    }
    if (this.selectedPositions) {
      let positionLabel = (this.selectedPositions.length > 0) ? 'position' : '';
      filters.push({ label: positionLabel, value: this.selectedPositions.join(', ') });
      // console.warn(this.selectedPositions)
    }
    if (this.selectedAge) {
      let ageLabel = (this.selectedAge.length > 0) ? 'age' : '';
      filters.push({ label: ageLabel, value: this.selectedAge.join(', ') });
    }
    if (this.selectedFoot) {
      let footLabel = (this.selectedFoot.length > 0) ? 'foot' : '';
      filters.push({ label: footLabel, value: this.selectedFoot.join(', ') });
    }
    if (this.selectedTopSpeed) {
      let selectedTopSpeed: any = {
        '15': '15-20 Km/hr',
        '20': '20-25 Km/hr',
        '25': '25-30 Km/hr',
        '30': '30-35 Km/hr',
        '35': '35-40 Km/hr',
      }
      filters.push({ label: 'topSpeed', value: selectedTopSpeed[this.selectedTopSpeed] });
    }
    if (this.selectedLeague) {
      filters.push({ label: 'league', value: this.selectedLeague });
    }
    if (this.selectedClub) {
      filters.push({ label: 'club', value: this.selectedClub });
    }
    // Repeat for other filters
    return filters;
  }

  // Example method to remove a filter
  removeFilter(label: string) {
    // Logic to remove the selected filter and update the filter array
    switch (label) {
      case 'category':
        this.selectedRole = null;
        break;
      case 'country':
        this.selectedCountry = null;
        break;
      case 'position':
        this.selectedPositions = null;
        break;
      case 'age':
        this.selectedAge = null;
        break;
      case 'foot':
        this.selectedFoot = null;
        break;
      case 'topSpeed':
        this.selectedTopSpeed = null;
        break;
      case 'league':
        this.selectedLeague = null;
        break;
      case 'club':
        this.selectedClub = null;
        break;
    }

    if (label == 'country' || label == 'league') {
      this.countryAndLeauge(label);
    }

    // Refresh data after removing filter
    this.getUsers();
  }

  // Generic method to get names by ID
  getNameById(label: string, id: string): string {
    console.warn('label is ' + label + ' id is ' + id)
    switch (label) {
      case 'country':
        const country = this.countries.find((count: any) => count.id === id);
        return country ? country.country_name : id;

      case 'category':
        const role = this.roles.find((role: any) => role.id === id);
        return role ? role.role_name : id;

      case 'position':
        // Handle multiple position IDs
        const positionIds = id.split(",").map(position => position.trim());
        const positionNames = positionIds
          .map(posId => {
            const position = this.positions.find(pos => pos.id === posId);
            return position ? position.position : posId; // Use the ID if not found
          });
        return positionNames.join(", "); // Return a comma-separated string of positions

      case 'league':
        const league = this.leagues.find((pos: any) => pos.id === id);
        return league ? league.league_name : id;

      case 'club':
        const club = this.clubs.find((pos: any) => pos.id === id);
        return club ? club.club_name : id;

      default:
        return id; // Return ID as fallback
    }
  }

  // Method to check if the label is empty
  empty(label: string): boolean {
    return !label || label.trim() === '';
  }

  getJsonTranslations() {
    this.translateService.get(['explore','forgotPassword.generalError','error']).subscribe((translations) => {
      this.pageTitle = translations['explore'];
      this.errorText = translations['error'];
      this.generalError = translations['forgotPassword.generalError'];
      setTimeout(() => {
        this.titleService.setTitle(this.pageTitle);
      }, 100);
    })
  }

  countryAndLeauge(input_type: any) {

    if (input_type == 'country') {
      this.leagues = [];
      this.clubs = [];
      this.selectedLeague = null;
      // this.selectedCountry = null;
    } else if (input_type == 'league') {
      this.clubs = [];
      this.selectedClub = null;
      this.loadClubs();
    }


    // 
  }


  pagesToShow(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage); // 👈 Fix here
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }


  goToPage(page: number) {
    if (page >= 1 && page <= this.totalItems) {
      this.currentPage = page;
    }
    this.getUsers();
    // this.fetchData(this.selectedTab);
  }

  nextPrevious(event: string) {
    // alert(this.currentPage);
    if (this.currentPage == 0 && event == 'next') {
      this.currentPage = 1;
    }else if(event == 'next'){
      this.currentPage = this.currentPage + 1;
    }else if(event == 'previous'){
      this.currentPage = this.currentPage - 1;
    }
    // console.info('event is ', event);
    this.getUsers();
  }
   
  changeItemsPerPage(){
    this.itemsPerPage = this.itemsPerPage;
    this.currentPage = 1;
    this.getUsers();
  }


  get lastPage(): number {
    return this.pagesToShow().length;  // Assuming last page is the length of the pagesToShow array
  }

}