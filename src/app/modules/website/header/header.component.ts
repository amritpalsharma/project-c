import { Component,HostListener, ViewChild, ElementRef, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { environment } from '../../../../environments/environment';
import { ConfirmPasswordComponent } from '../SetPassword/confirmPassword.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonDataService } from '../../../services/common-data.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared.service';
declare var bootstrap: any; // Declare bootstrap
declare var google: any; // Declare google
import { WebPages } from '../../../services/webpages.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('invalidCredMessage') invalidCredMessage!: ElementRef;
  @ViewChild('registerForm') registerForm!: NgForm;
  
  //default language
  slug: string = 'en'; 
  lang_id:any = 1;
  isUserLoggedIn: boolean = false;
  LoggedInUserDashboardLink: string = ''; 
  isNavbarExpanded = false;
  isDarkMode: boolean = false;
  activeIndex: number = 1; // Default active tab
  role: number = 4; // Initialize role to 4 (Player)
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  language: string = '1';
  newsletter: boolean = false;
  userDomain: string = '1';
  confirmPassword: string = '';
  privacyPolicy: boolean = false;
  loginButtonClicked: boolean = false;
  invalidCred: string = '';
  registerFormSubmitted: boolean = false;
  registerError: string = '';
  forgotPasswordEmail: string = '';
  forgotPasswordMessage: string = '';
  lang: string = '';
  token: string = '';
  tokenVerified: boolean = false;
  languages:any = environment.langs;
  selectedClub: number | null = null;
  selectedCountry: string = '';
  selectedTeam: number | null = null;
  companyName: string = '';
  verifyToken:any = null;
  verifyTime:any = null;
 //this is get by the domain
 countries: Array<{ code: string; name: string }> = [];
 clubs: Array<{ id: number; name: string }> = [];
 langs: any = environment.langs;


  allLanguage = [];
  selectedLanguageId = null;
    //clubs
    // clubs = [
    //   { id: 1, name: 'Club A' },
    //   { id: 2, name: 'Club B' },
    //   { id: 3, name: 'Club C' },
    //   { id: 4, name: 'Club D' },
    //   { id: 5, name: 'Club E' },
    // ];

    teams = [
      { id: 1, name: 'Team Alpha' },
      { id: 2, name: 'Team Bravo' },
      { id: 3, name: 'Team Charlie' },
      { id: 4, name: 'Team Delta' },
      { id: 5, name: 'Team Echo' },
    ];
    countrie: any[] = [];

  // English Country Names
  countrie_en = [
    { name: 'Switzerland', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Germany', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italy', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'France', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spain', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgium', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Denmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // German Country Names
  countrie_de = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Deutschland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankreich', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dänemark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Schweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // Italian Country Names
  countrie_it = [
    { name: 'Svizzera', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Germania', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italia', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Francia', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inghilterra', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spagna', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portogallo', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgio', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danimarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Svezia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // French Country Names
  countrie_fr = [
    { name: 'Suisse', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Allemagne', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italie', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'France', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Angleterre', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Suède', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgique', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danemark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suède', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // Spanish Country Names
  countrie_es = [
    { name: 'Suiza', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Alemania', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italia', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Francia', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inglaterra', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'España', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Bélgica', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dinamarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suecia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // Portuguese Country Names
  countrie_pt = [
    { name: 'Suíça', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Alemanha', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Itália', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'França', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inglaterra', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Espanha', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Bélgica', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dinamarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suécia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  
  // Danish Country Names
  countrie_dk = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Tyskland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankrig', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sverige', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];
  
  // Swedish Country Names
  countrie_se = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Tyskland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankrike', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'ch', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sverige', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
  ];


    customOptions: OwlOptions = {
      loop: true,
      mouseDrag: false,
      touchDrag: false,
      pullDrag: false,
      dots: false,
      navSpeed: 700,
      navText: ['', ''],
      responsive: {
        0: { items: 1 },
        400: { items: 2 },
        740: { items: 3 },
        940: { items: 6 }
      },
      nav: true
    };

    constructor(
      private sharedservice:SharedService,
      private themeService: ThemeService,
      private authService: AuthService,
      private route: ActivatedRoute,
      private router: Router,
      private translateService: TranslateService,
      public dialog: MatDialog,
      private commonDataService: CommonDataService,
      private http: HttpClient,
      private toastr : ToastrService,
      private webpage: WebPages,
      private socketService: SocketService
    ) {
      this.language = translateService.currentLang || 'en';  // Get current language
      this.loadCountries();  // Load countries based on selected language
      translateService.onLangChange.subscribe(() => {
        this.language = translateService.currentLang;
        this.loadCountries();
      });
    }

    loadCountries() {
      if (this.language === 'en') {
      this.countrie = this.countrie_en;
    } else if (this.language === 'de') {
      this.countrie = this.countrie_de;
    } else if (this.language === 'it') {
      this.countrie = this.countrie_it;
    } else if (this.language === 'fr') {
      this.countrie = this.countrie_fr;
    } else if (this.language === 'es') {
      this.countrie = this.countrie_es;
    } else if (this.language === 'pt') {
      this.countrie = this.countrie_pt;
    } else if (this.language === 'dk') {
      this.countrie = this.countrie_dk;
    } else if (this.language === 'se') {
      this.countrie = this.countrie_se;
    } 
    }

    isScrolled = false;
    serverBusy = false;
    @HostListener('window:scroll', [])

  onWindowScroll() {
    this.isScrolled = window.scrollY > 50; // Adjust the scroll value as needed
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.token = params['confirm-token'] || '';
      if (this.token) {
        this.toastr.info('Processing...', 'Please Wait!');

        this.authService.magicLogin(this.token).subscribe(
          response => {
            if (response.status && response.data) {
              const token = response.data.token;
              const userData = response.data.user;
              const userRole = userData.role;

              localStorage.setItem('authToken', token);
              localStorage.setItem('userRole', userRole);
              localStorage.setItem('userData', JSON.stringify(userData));
              this.tokenVerified = true;
              this.openModal();

            } else {
              this.tokenVerified = false;
              this.router.navigate(['/expired-link']);
            }
          },
          error => {
            console.error('Error verifying token:', error);
            this.tokenVerified = false;
            this.router.navigate(['/expired-link']);
          }
        );
      }

      this.verifyToken = params['token'];
      this.verifyTime = params['time'];

      if (this.verifyToken && this.verifyTime) {
        this.toastr.info('Processing...', 'Please Wait!');

        this.authService.verifyEmail(this.verifyToken,this.verifyTime).subscribe(
          response => {
            if (response.status) {
              this.toastr.clear();

              this.toastr.success('Email is verified. You can login now...', 'Email Verified!');

              const loginModal = new bootstrap.Modal(document.getElementById('exampleModal-login'));
              loginModal.show();

            } else {
              this.toastr.clear();

              this.router.navigate(['/expired-link']);
            }
          },
          error => {
            this.toastr.clear();

            this.router.navigate(['/expired-link']);
          }
        );
      }


    });
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.LoggedInUserDashboardLink = this.authService.getDashboardLink();
    // Ensure language is set to 'en' if it's not already in localStorage
    this.lang = localStorage.getItem('lang') || 'en'; // Default to 'en' if no language is set
    this.slug = this.lang;
    // Set default language to English if not set
    if (!this.lang || this.lang === '') {
      this.lang = 'en';
      localStorage.setItem('lang', this.lang); // Store default language in localStorage
    }

    this.lang_id = localStorage.getItem('lang_id');
    if (this.lang_id == null) {
      this.lang_id = environment.targetDomain.default_lang;
      localStorage.setItem('lang_id', this.lang_id); // Store default language in localStorage
    }
    // Use the selected language (or 'en' if none)
    this.translateService.use(this.lang);  // Set the language for ngx-translate

    // Apply dark mode from localStorage
    this.themeService.isDarkTheme.subscribe((isDarkTheme: boolean) => {
      this.isDarkMode = isDarkTheme;
    });
    this.applyTheme();

    // Initialize Google Sign-In if available
    if (typeof google !== 'undefined' && google.accounts) {
    //  this.initializeGoogleSignIn();
    }

    this.getAllCountries();
    this.getAllClubs();
    this.getAllLanguage();
  }


  setActive(index: number): void {
    this.activeIndex = index; // Set the active index
    this.role = index === 1 ? 4 : index === 2 ? 2 : 3; // Update role based on activeIndex
  }

  toggleNavbar() {
    this.isNavbarExpanded = !this.isNavbarExpanded;
    document.body.classList.toggle('navbar-expanded', this.isNavbarExpanded);
  }

  toggleTheme(event: any) {
    this.themeService.setDarkTheme(event.target.checked);
  }

  applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  ChangeLang(newSlug: string, event: Event): void {
    this.translateService.use(newSlug);  // Switch translation language
    console.log('working',newSlug);

    this.slug = newSlug;  // Update the slug to the selected language
    event.preventDefault(); // Prevent default action (e.g., preventing link navigation)

    let selectedLanguageId : any = null;
    let getLanguageIndex = this.langs.findIndex((val:any) => {
      if(val.slug == newSlug){
        selectedLanguageId = val.id
        return val;
      }
    });
    
    this.selectedLanguageId = selectedLanguageId;
    localStorage.setItem('lang', newSlug);

    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = newSlug;
    // Find the corresponding language ID from the langs array
    const selectedLanguageObj = this.langs.find(
      (lang: any) => lang.slug === selectedLanguageSlug
    );

    // Default to a specific language ID if none is found (e.g., English)
    selectedLanguageId = selectedLanguageObj ? selectedLanguageObj.id : 1;


    this.webpage.updateData(selectedLanguageId);
    localStorage.setItem('lang_id', selectedLanguageId);

    console.log('selectedLanguageId',selectedLanguageId);
    this.sharedservice.updateData({
      action:'updatedLang',
      id:selectedLanguageId
    });


    this.translateService.use(newSlug);

    const target = event.target as HTMLSelectElement;  // Cast target to HTMLSelectElement
    if (target) {
      this.lang = target.value;
      this.getContentForLanguage(this.lang);
    }
  }

  getContentForLanguage(lang: string): void {
    const apiUrl = `${environment.apiUrl}language/${lang}`;  // Use the API URL from the environment file
    this.http.get(apiUrl).subscribe({
      next: (response: any) => {
        // Handle the API response based on the selected language
        console.log(response);
        // You can update the UI or internal state with the response data
      },
      error: (error) => {
        console.error('Error fetching language content', error);
      }
    });
  }


  login() {
    this.loginButtonClicked = true;
    if (!this.email || !this.password) {
      console.error('Please fill in all required fields.');
      return;
    }

    const selectedLanguage = localStorage.getItem('lang') || environment.targetDomain?.default_lang;
    const domain = environment.targetDomain?.domain || 'ch';

    const loginData = {
      email: this.email,
      password: this.password,
      lang: selectedLanguage,
      domain: domain,
    };

    this.authService.login(loginData).subscribe(
      response => {
        if (response.status === false) {
          this.invalidCred = response.message;
          this.showInvalidCredMessage();
        } else {
          const token = response.data.token;
          const userData = response.data.user_data;

          let langId = localStorage.getItem("lang_id") || '1';
          console.log("socket connected with user: ", response.data.user_data.id)
          this.socketService.connectUser({userId:response.data.user_data.id, langId});
          
          const userRole = userData.role;
          let navigationRoute = '';
          switch (userRole) {
            case "2":
              navigationRoute = '/club/dashboard';
              break;
            case "3":
              navigationRoute = '/scout/dashboard';
              break;
            case "4":
              navigationRoute = '/talent/dashboard';
              break;
            case "1":
              navigationRoute = '/admin/dashboard';
              break;
            default:
              navigationRoute = '';
              break;
          }
          localStorage.setItem('authToken', token);
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userData', JSON.stringify(userData));

          let modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal-login'));
          if (modal) {
            modal.hide();
          }
          this.router.navigate([navigationRoute]);
        }
      },
      error => {
        console.error('An error occurred while logging in:', error);
      }
    );
  }

  private showInvalidCredMessage() {
    if (this.invalidCredMessage) {
      this.invalidCredMessage.nativeElement.style.display = 'block';
    }
  }

  register() {
    this.serverBusy = true;
    this.registerFormSubmitted = true;

    if (!this.isFormValid()) {
      this.serverBusy = false;
      this.toastr.warning('Please fill in all required fields.', 'Validation Error');
      return;
    }

    this.toastr.info('Registration is in process...', 'Please wait', { disableTimeOut: true });

    const selectedLanguage = localStorage.getItem('lang') || '';
    const domain = environment.targetDomain?.domain || 'ch';

    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = localStorage.getItem('lang') || '';

    // Find the corresponding language ID from the langs array
    const selectedLanguageObj = this.languages.find(
      (lang: any) => lang.slug === selectedLanguageSlug
    );

    // Default to a specific language ID if none is found (e.g., English)
    const selectedLanguageId = selectedLanguageObj ? selectedLanguageObj.id : 1;
    let verification_link = window.location.origin+'/home';

    const registrationData = {
      first_name: this.firstName,
      last_name: this.lastName,
      username: this.username,
      role: this.role,
      email: this.email,
      newsletter: this.newsletter,
      user_domain: this.userDomain,
      password: this.password,
      password_confirm: this.confirmPassword,
      privacy_policy: this.privacyPolicy,
      lang: selectedLanguageId,
      domain: domain,
      club_id: this.selectedClub,
      verification_link : verification_link
    };

    this.authService.register(registrationData).subscribe(
      (response) => {
        console.log('Registration response:', response);
        if (response.status === true) {
          // sending registration notification to admin
          let senderId = response.data.userInfo?.id ;
          if(senderId){
            this.socketService.emit('userRegistered', {senderId: senderId, receiverId: "1"});
            console.log("work done");
          }

          this.toastr.clear();

          this.serverBusy = false;
          this.toastr.success('Registration successful! Thank you.', 'Success');
          const registerModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal1'));
          if (registerModal) {
            registerModal.hide();
          }

          if (registerModal) {
            registerModal.hide();
          }
          this.router.navigate(['/email-verify']);

          // const loginModal = new bootstrap.Modal(document.getElementById('exampleModal-login'));
          // loginModal.show();
        } else {
          this.toastr.clear();

          let errorMessage = '';
          if (typeof response.message === 'object') {
            Object.keys(response.message).forEach((key) => {
              errorMessage += response.message[key] + ' ';
            });
          } else {
            errorMessage = response.message;
          }
          this.toastr.error(errorMessage.trim(), 'Registration Failed');
          this.registerError = errorMessage.trim();
          this.registerFormSubmitted = false;
        }
      },
      (error) => {
        this.toastr.clear();

        console.error('Registration failed:', error);
        let errorMessage = 'An error occurred during registration. Please try again.';
        if (error && error.status === 400 && error.error && error.error.data) {
          const errorData = error.error.data;
          if (errorData.username) {
            this.registerForm.controls['username'].setErrors({ usernameExists: true });
          }
          if (errorData.email) {
            this.registerForm.controls['email'].setErrors({ emailExists: true });
          }
          errorMessage = errorData.message || errorMessage;
        }
        this.toastr.error(errorMessage, 'Registration Failed');
        this.registerError = errorMessage;
        this.registerFormSubmitted = false;
      }
    );
  }

  private handleRegistrationError(error: any) {
    console.error('Registration failed:', error);
    if (error && error.status === 400 && error.error && error.error.data) {
      const errorData = error.error.data;
      if (errorData.username) {
        this.registerForm.controls['username'].setErrors({ usernameExists: true });
      }
      if (errorData.email) {
        this.registerForm.controls['email'].setErrors({ emailExists: true });
      }
      this.registerError = errorData.message || 'An error occurred during registration.';
    } else {
      this.registerError = 'An error occurred during registration. Please try again.';
    }
    this.registerFormSubmitted = false;
  }


  isFormValid(): boolean {
    let fieldType = ['string', 'boolean'];
    return [
      this.firstName,
      this.lastName,
      this.username,
      this.email,
      this.password,
      this.confirmPassword,
      this.privacyPolicy
    ].every(field => fieldType.includes(typeof field)) &&
    this.role > 0 && // Assuming role should be a positive number
    this.language.trim() !== '' && // Ensure language is a non-empty string
    this.userDomain.trim() !== ''; // Assuming userDomain is a string
  }

  forgotPassword() {
    if (!this.forgotPasswordEmail.trim()) {
      this.forgotPasswordMessage = 'Please provide a valid email address.';
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe(
      response => {
        if (response.status) {
            this.forgotPasswordMessage = response.message;
        } else {
          this.forgotPasswordMessage = response.message;
        }
      },
      () => {
        this.forgotPasswordMessage = 'An error occurred. Please try again later.';
      }
    );
  }

  initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: 'YOUR_CLIENT_ID',
      callback: (response: any) => this.handleGoogleSignIn(response)
    });
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      {
        theme: 'outline',
        size: 'large',
        prompt: 'select_account'
      }
    );
  }

  handleGoogleSignIn(response: any): void {
    const idToken = response.credential;
    if (idToken) {
      localStorage.setItem('authToken', idToken);
      let modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal-login'));
      if (modal) {
        modal.hide();
      }
      this.router.navigate(['/Admin/Dashboard']);
    } else {
      this.invalidCred = 'Failed to log in with Google';
      this.showInvalidCredMessage();
    }
  }

  openModal() {
    this.dialog.open(ConfirmPasswordComponent, { width: '500px' });
  }

  onCountryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCountry = selectElement.value;
    this.getClugById(this.selectedCountry);
  }

  onClubChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedClub = +selectElement.value; // Convert to number
    console.log('Selected Club ID:', this.selectedClub);
  }

  onTeamChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTeam = +selectElement.value; // Convert to number
    console.log('Selected Team ID:', this.selectedTeam);
  }
  onCompanyNameChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.companyName = inputElement.value;
    console.log('Company Name:', this.companyName);
  }

  // isNavbarExpanded = false;

  // toggleNavbar() {
  //   this.isNavbarExpanded = !this.isNavbarExpanded;
  // }

  closeNavbar() {
    this.isNavbarExpanded = false;
  }


  getAllCountries(){
    this.commonDataService.getAllCountries().subscribe((resp) => {
      this.countries = resp.data.domains.map((country: any) => ({
        code: country.country_id || '',
        name: country.location || ''
      }));
    });
  }

  getClugById(id :any ){
    if(id){
      this.commonDataService.getAllClubsbyId(id).subscribe((resp) => {
        this.clubs = resp.data.clubs.map((club: any) => ({
          id: club.id || '',
          name: club.club_name || ''
        }));
        console.log(resp, 'club-resp');
      });
    }
  }
  getAllClubs(){
    this.commonDataService.getAllClubs().subscribe((resp) => {
      this.clubs = resp.data.clubs.map((club: any) => ({
        id: club.id || '',
        name: club.club_name || ''
      }));
      console.log(resp, 'club-resp');
    });
  }


  getAllLanguage(){

    this.webpage.getAllLanguage().subscribe((response) => {
      if (response.status) {
        this.languages = response.data.languages;
        localStorage.setItem('languages', JSON.stringify(this.languages));
      }
    });
  }

}
