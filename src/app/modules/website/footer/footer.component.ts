import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { environment } from '../../../../environments/environment';
import { ConfirmPasswordComponent } from '../SetPassword/confirmPassword.component';
import { MatDialog } from '@angular/material/dialog';
import { WebPages } from '../../../services/webpages.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { DomainSlugService } from '../../../services/domain-slug.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ssrDebug } from '../../../services/ssr-debug';

declare var bootstrap: any; // Declare bootstrap
declare var google: any; // Declare google

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  language: string;   // To store the selected language
  // countrie: any[] = [];  // Country array to display


  @ViewChild('invalidCredMessage') invalidCredMessage!: ElementRef;
  @ViewChild('registerForm') registerForm!: NgForm; // Define registerForm using ViewChild
  currentYear: number = new Date().getFullYear();
  selectedcountry: number = 1;
  name: string = 'England'; // Current country name, update as needed
  countrie: any[] = [];
  selectedCountry: string = '';

  // currentPage = 

  // English Country Names
  countrie_en = [
    { name: 'Switzerland', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Germany', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italy', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'France', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spain', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgium', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Denmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Austria', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albania', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // German Country Names
  countrie_de = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Deutschland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankreich', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dänemark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Schweden', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Österreich', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albanien', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // Italian Country Names
  countrie_it = [
    { name: 'Svizzera', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Germania', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italia', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Francia', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inghilterra', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spagna', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portogallo', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgio', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danimarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Svezia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Austria', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albania', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // French Country Names
  countrie_fr = [
    { name: 'Suisse', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Allemagne', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italie', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'France', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Angleterre', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Suède', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgique', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danemark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suède', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Autriche', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albanie  ', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // Spanish Country Names
  countrie_es = [
    { name: 'Suiza', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Alemania', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italia', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Francia', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inglaterra', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'España', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Bélgica', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dinamarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suecia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Austria', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albania', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // Portuguese Country Names
  countrie_pt = [
    { name: 'Suíça', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Alemanha', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Itália', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'França', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'Inglaterra', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Espanha', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Bélgica', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Dinamarca', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Suécia', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Áustria', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albânia', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];


  // Danish Country Names
  countrie_dk = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Tyskland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankrig', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sverige', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Østrig', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albanië', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
  ];

  // Swedish Country Names
  countrie_se = [
    { name: 'Schweiz', slug: "ch", id: 1, flag: "Switzerland.svg", url: 'https://www.socceryou.ch' },
    { name: 'Tyskland', slug: 'de', id: 2, flag: 'Germany.svg', url: 'https://www.socceryou.de' },
    { name: 'Italien', slug: 'it', id: 3, flag: 'Italy.svg', url: 'https://www.socceryou.it' },
    { name: 'Frankrike', slug: 'fr', id: 4, flag: 'France.svg', url: 'https://www.socceryou.fr' },
    { name: 'England', slug: 'en', id: 5, flag: 'England.svg', url: 'https://www.socceryou.co.uk' },
    { name: 'Spanien', slug: 'es', id: 6, flag: 'Spain.svg', url: 'https://www.socceryou.es' },
    { name: 'Portugal', slug: 'pt', id: 7, flag: 'Portugal.svg', url: 'https://www.socceryou.pt' },
    { name: 'Belgien', slug: "be", id: 8, flag: "Belgium.svg", url: 'https://www.socceryou.be' },
    { name: 'Danmark', slug: 'dk', id: 9, flag: 'Denmark.svg', url: 'https://www.socceryou.se' },
    { name: 'Sverige', slug: 'se', id: 10, flag: 'Sweden-sweden.svg', url: 'https://www.socceryou.dk' },
    { name: 'Österrike', slug: 'at', id: 11, flag: 'Austria.svg', url: 'https://www.socceryou.at' },
    { name: 'Kosovo', slug: 'org', id: 12, flag: 'Kosovo.svg', url: 'https://www.socceryou.org' },
    { name: 'Albanien', slug: 'al', id: 13, flag: 'Albanien.svg', url: 'https://www.socceryou.al' },
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
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 6
      }
    },
    nav: true
  }

  isDropdownUp: boolean = false;

  shouldDropdownBeUp(): boolean {
    return true; // Replace with actual condition
  }

  countries = environment.domains; // Assuming the countries are defined in the environment


  activeIndex: number = 1; // -1 means no button is active initially
  isVisible: boolean = true;
  setActive(index: number): void {
    this.activeIndex = index; // Set the activeIndex to the index of the clicked button
    this.role = index === 1 ? 4 : index === 2 ? 2 : 3; // Update role based on activeIndex

  }
  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  role: number = 4; // Initialize role to 4 (Player)
  email: string = '';
  currentDomainExtension: string = '';
  // language: string = '1';
  newsletter: boolean = false;
  userDomain: string = '1';
  confirmPassword: string = '';
  privacyPolicy: boolean = false;
  loginButtonClicked: boolean = false;
  invalidCred: string = '';

  registerFormSubmitted: boolean = false;
  isUserLoggedIn: boolean = false;
  registerError: string = '';
  forgotPasswordEmail: string = '';
  forgotPasswordMessage: string = '';


  // Dynamic Routes For Footer
  privacySlug: string = '';
  pricing: string = '';
  faq: string = '';
  talent: string = '';
  clubAndScout: string = '';
  about: string = '';
  imprint: string = '';
  terms: string = '';
  contact: string = '';


  constructor(
    private themeService: ThemeService,
    private webPages: WebPages,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    public dialog: MatDialog,
    private globalSettings: GlobalSettingsService,
    public domainSlugService: DomainSlugService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    ssrDebug(this.platformId, 'FooterComponent');

    this.language = translateService.currentLang || 'en';  // Get current language
    this.loadCountries();  // Load countries based on selected language
    this.privacySlug = this.domainSlugService.getRouteSlug('privacy');
    this.pricing = this.domainSlugService.getRouteSlug('pricing');
    this.faq = this.domainSlugService.getRouteSlug('faq');
    this.talent = this.domainSlugService.getRouteSlug('talent');
    this.clubAndScout = this.domainSlugService.getRouteSlug('clubAndScout');
    this.about = this.domainSlugService.getRouteSlug('about');
    this.imprint = this.domainSlugService.getRouteSlug('imprint');
    this.terms = this.domainSlugService.getRouteSlug('terms');
    this.contact = this.domainSlugService.getRouteSlug('contact');
    translateService.onLangChange.subscribe(() => {
      this.language = translateService.currentLang;
      this.loadCountries();
      console.log(this.selectedcountry);

    });

  }



  lang: string = '';
  token = '';
  tokenVerified = false;

  ngOnInit(): void {
    this.footerCountries();
    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.footerCountries(); // Call the function when event is received
    });
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.webPages.languageId$.subscribe((data) => {
      this.footerCountries();
    });

    // Check if the google.accounts.id library is loaded
    if (typeof google !== 'undefined' && typeof google.accounts !== 'undefined' && typeof google.accounts.id !== 'undefined') {
      // Initialize Google Sign-In
      //   this.initializeGoogleSignIn();
    } else {
      // Google API script might not be loaded yet; wait for it to load
      //  console.warn('Google API script is not fully loaded.');
      this.countries = environment.domains;
    }

    this.translateService.onLangChange.subscribe(() => {
      this.language = this.translateService.currentLang;
      this.loadCountries();
      // console.log(this.selectedcountry);
      setTimeout(() => {
        const selectedLang = this.countrie.find((data: any) => data.id == this.selectedcountry);
        this.name = selectedLang?.name || '';
      }, 100);

      // let selectedLang = localStorage.getItem('lang');
      // console.warn('In Footer component LocalStorage Language selected = ' + selectedLang)
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

    // this.footerCountries();
  }

  performMagicLogin(token: string) {
    this.authService.magicLogin(token).subscribe(
      magicLoginResponse => {
        console.log('Magic login response:', magicLoginResponse);
        if (magicLoginResponse.status === true) {
          this.openModal();

        } else {
          console.error('Auto-login failed:', magicLoginResponse.message);
          console.log("Token is not verified");
        }
      },
      error => {
        console.error('An error occurred during auto-login:', error);
        // Handle error scenario if needed
      }
    );
  }

  toggleTheme(event: any): void {
    this.themeService.setDarkTheme(event.target.checked);
    this.footerCountries();
  }

  login() {
    this.loginButtonClicked = true;

    if (!this.email || !this.password) {
      console.error('Please fill in all required fields.');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const selectedLanguage = localStorage.getItem('lang') || '';
      const domain = environment.targetDomain?.domain || 'ch';

      const loginData = {
        email: this.email,
        password: this.password,
        lang: selectedLanguage,
        domain: domain,

      };

      this.authService.login(loginData).subscribe(
        response => {
          console.log('Login response:', response);
          if (response.status === false) {
            console.error('Login failed:', response.message);
            this.invalidCred = response.message;
            this.showInvalidCredMessage();
          } else {
            console.log('Login successful.');
            const token = response.data.token;
            const userData = response.data.user_data;

            console.log(userData, "check user data index ")

            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('authToken', token);
              const storedToken = localStorage.getItem('authToken');
              localStorage.setItem('userData', JSON.stringify(userData));

              if (storedToken === token) {
                console.log('Token successfully saved to local storage.');

                // this.translateService.use(selectedLanguage);

                let modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal-login'));
                if (modal) {
                  modal.hide();
                }
                this.router.navigate(['/Admin/Dashboard']);
                // window.location.href = `${targetDomain}/Admin/Dashboard`;
              } else {
                console.error('Failed to save token to local storage.');
              }
            }
          }
        },
        error => {
          console.error('An error occurred while logging in:', error);
        }
      );
    }
  }

  private showInvalidCredMessage() {
    if (this.invalidCredMessage) {
      if (isPlatformBrowser(this.platformId)) {
        this.invalidCredMessage.nativeElement.style.display = 'block';
      }
    }
  }

  register() {
    this.registerFormSubmitted = true;

    if (!this.isFormValid()) {
      console.error('Please fill in all required fields.');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const selectedLanguage = localStorage.getItem('lang') || '';
      const domain = environment.targetDomain?.domain || 'ch';

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
        lang: selectedLanguage,
        domain: domain
      };


      this.authService.register(registrationData).subscribe(
        response => {
          console.log('Registration response:', response);
          if (response.status === true) {
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal1'));
            if (registerModal) {
              registerModal.hide();
            }
            const loginModal = new bootstrap.Modal(document.getElementById('exampleModal-login'));
            loginModal.show();
          } else {
            let errorMessage = '';
            // Check if response.message is an object
            if (typeof response.message === 'object') {
              // Loop through each error message and concatenate them
              Object.keys(response.message).forEach(key => {
                errorMessage += response.message[key] + ' ';
              });
            } else {
              errorMessage = response.message;
            }
            this.registerError = errorMessage.trim(); // Trim to remove any leading or trailing spaces
            this.registerFormSubmitted = false; // Reset form submission flag to allow re-submission
          }
        },
        error => {
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
            console.error('An error occurred while registering:', error);
            this.registerError = 'An error occurred during registration. Please try again.';
          }
          this.registerFormSubmitted = false; // Reset form submission flag to allow re-submission
        }
      );
    }
  }

  isFormValid(): boolean {
    return (
      this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.username.trim() !== '' &&
      this.role !== null &&
      this.email.trim() !== '' &&
      this.language !== null &&
      this.newsletter !== null &&
      this.userDomain.trim() !== '' &&
      this.password.trim() !== '' &&
      this.confirmPassword.trim() !== '' &&
      this.privacyPolicy !== false
    );
  }

  forgotPassword() {
    if (!this.forgotPasswordEmail.trim()) {
      console.error('Email is required for password recovery.');
      this.forgotPasswordMessage = 'Please provide a valid email address.';
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe(
      response => {
        console.log('Password recovery response:', response);
        if (response.status) {
          this.forgotPasswordMessage = response.message;
        } else {
          console.error('Password recovery failed:', response.message);
          this.forgotPasswordMessage = response.message;
        }
      },
      error => {
        console.error('An error occurred while requesting password recovery:', error);
        this.forgotPasswordMessage = 'An error occurred. Please try again later.';
      }
    );
  }



  initializeGoogleSignIn(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof google !== 'undefined' && typeof google.accounts !== 'undefined' && typeof google.accounts.id !== 'undefined') {
        // Initialize Google Sign-In
        google.accounts.id.initialize({
          client_id: '156115430884-qbtnhb5dlnn6fnqtj2k6vh7khol2p7e8.apps.googleusercontent.com',
          callback: (response: any) => this.handleGoogleSignIn(response)
        });
        // Render Google Sign-In button in a hidden div
        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            promptParentId: 'googleSignInButton',
            prompt: 'select_account'
          }
        );
      } else {
        // Google API script might not be loaded yet; wait for it to load
        console.warn('Google API script is not fully loaded.');
      }
    }
  }

  handleGoogleSignIn(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const idToken = response.credential;
      const user = this.parseJwt(idToken);
      if (user) {
        console.log('Google login successful:', user);
        // Save user data or token as needed, for example:
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('authToken', idToken);
        }
        let modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal-login'));
        if (modal) {
          modal.hide();
        }
        // this.router.navigate(['/Admin/Dashboard']);
      } else {
        console.error('Failed to decode Google ID token');
        this.invalidCred = 'Failed to log in with Google';
        this.showInvalidCredMessage();
      }
    }
  }

  private parseJwt(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
      }
    }
  }

  openModal() {
    this.dialog.open(ConfirmPasswordComponent, {
      width: '500px',
      // data: { token: this.token }
    });
  }
  notverifyed() {
    this.dialog.open(ConfirmPasswordComponent, {
      width: '500px',
      // data: { token: this.token }
    });
  }

  setSelectedCountry(country: any) {
    this.selectedCountry = country.name;
  }

  footerCountries() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentDomainExtension = this.globalSettings.getCurrentDomainExtension();
      this.currentDomainExtension = this.currentDomainExtension.replaceAll('.', '');

      if (this.currentDomainExtension == 'couk') {
        this.currentDomainExtension = 'en';
      } else if (this.currentDomainExtension == '') {
        this.currentDomainExtension = 'ch';
      }
      console.log('currentDomainExtension is ', this.currentDomainExtension)
      console.log('countrie is ', this.countrie)

      let selectedLang = this.countrie.find((data: any) => data.slug == this.currentDomainExtension);
      // console.info(selectedLang)
      this.name = selectedLang?.name || '';
      this.selectedcountry = selectedLang?.id || '';
      console.log('selectedcountry is ', this.selectedcountry)
    }
  }
  scrollToTop() {

  }
  navigateAndScroll(path: string) {
    // this.scrollToTop();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
    this.router.navigate([path]);
  }

}
