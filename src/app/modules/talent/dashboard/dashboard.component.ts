import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { TalentService } from '../../../services/talent.service';
import { EditPersonalDetailsComponent } from '../edit-personal-details/edit-personal-details.component';
import { EditHighlightsComponent } from '../tabs/edit-highlights/edit-highlights.component';
import { DeletePopupComponent } from '../delete-popup/delete-popup.component';
import { ToastrService } from 'ngx-toastr';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; // Import the styles for Intro.js
import { Lightbox } from 'ngx-lightbox';
// import { LightboxDialogComponent } from '../lightbox-dialog/lightbox-dialog.component';
import { LightboxDialogComponent } from '../../shared/lightbox-dialog/lightbox-dialog.component';
import { NavigationEnd } from '@angular/router';
import { Subscription, timeout } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { CommonDataService } from '../../../services/common-data.service';
import { WebPages } from '../../../services/webpages.service';
import { TitleService } from '../../../title.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { ImageCropperComponent2 } from '../../shared/image-cropper/image-cropper.component';
import { CoverImageCropperComponent } from '../../shared/cover-image-cropper/cover-image-cropper.component';
import { SocketService } from '../../../services/socket.service';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';
import { PopupComponent } from '../../shared/popup/popup.component';
import { descriptors } from 'chart.js/dist/core/core.defaults';
import { EditMembershipProfileComponent } from '../edit-membership-profile/edit-membership-profile.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit, OnDestroy {
  lightboxIsOpen: boolean = false; // Track the state of the lightbox
  mainImage: { src: string } = { src: '' }; // Current main image source
  album: any[] = []; // Array for album images
  loggedInUser: any = localStorage.getItem('userData');
  countryFlagUrl: string = './assets/images/city-icon-light.png';
  pageTitle: string = '';
  UserName: string = '';
  photoLoading: boolean = true;
  stats: any = [];
  accountVerificationPending: string = '';
  maxSizeForProfile: string = '';
  scoutInfoDetails: any;
  customClubInfo: any;


  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private talentService: TalentService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private commonDataService: CommonDataService,
    public webPages: WebPages,
    private titleService: TitleService,
    private globalSettings: GlobalSettingsService,
    private socketService: SocketService
  ) { }
  activeTab: string = 'profile';
  userId: any;
  user: any = {};
  userNationalities: any = [];
  coverImage: any;
  profileImage: any;
  profileImageLoading: boolean = true;
  selectedFile: any;
  isHighlightClick: boolean = true;
  teams: any;
  highlights: any;
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any;
  defaultCoverImage: any = "./media/palyers.png";
  defaultProfileImage: any = "../../assets/images/default/talent-profile-default.png";
  premium: any = false;
  booster: any = false;
  activeDomains: any;
  countries: any;
  isPremium: any = false;
  isTourFirstTime: boolean = true;
  StartTour: boolean = true;
  dontShowAgainTourTxt: string = 'profile';
  duration: any;
  @Output() dataEmitter = new EventEmitter<string>();
  private routeSubscription: Subscription | null = null; // Initialize with null
  private introInstance: any; // Reference to the Intro.js instance
  loading: boolean = true;  // Add this line to track loading state

  popupData: any;

  pleaseWaitTxt: string = '';
  downloading: string = '';
  // popupSeen: any = [{id: 1, user_id: '123', popup_id: '54', days: 2 }, {id: 2, user_id: '124', popup_id: '53', days: 1 }];

  popupSeen: any;

  // Toaster Msg For Takent
  pleaseWait: string = '';
  uploadingPhotos: string = '';
  successTxt: string = '';
  errorTxt: string = '';
  deletingCoverImage: string = '';
  Canceled: string = '';
  coverImageDeletionCanceled: string = '';
  currentThemeMode: any = localStorage.getItem('theme');
  generalError: string = '';

  isUserVerified: boolean = false;

  today: any = new Date().toLocaleDateString();
  savedDate: any;
  loginCount: any = localStorage.getItem('popupLoginCount') || 0;


  langSubscription!: Subscription;

  async ngOnInit() {

    this.savedDate = localStorage.getItem('popupLoginDate');

    if (this.savedDate !== this.today) {
      // Reset for a new day
      this.loginCount = 0;
      localStorage.setItem('popupLoginDate', this.today);
    }

    this.loginCount++;
    localStorage.setItem('popupLoginCount', this.loginCount.toString());

    this.getJsonTranslations();
    this.themeChanged();
    this.introInstance = introJs();

    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.userId = this.loggedInUser.id;

    // Adding a slight delay to ensure elements are rendered before the tour starts
    this.getUserProfile(this.userId);
    this.getHighlightsData();
    this.loadCountries();
    this.getGalleryData();

    this.route.params.subscribe(() => {
      this.getCoverImg();
      this.activeTab = 'profile';
    });
    this.getBoosterData();
    this.isUserVerified = false;

    await this.getAllTeams();
    // Listen for route changes
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.stopIntroTour(); // Stop the tour on navigation
      }
    });

    this.getClubsForPlayer();
    this.getToasterMsg();
    this.globalSettings.indexFunctionCall$.subscribe(() => {
      console.info('Theme  changed in dashboard')
      this.themeChanged(); // Call the function when event is received

    });

    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getToasterMsg();
      this.getUserProfile(this.userId);
      this.getBoosterData();
      // this.getHighlightsData();
      this.loadCountries();
      // this.getGalleryData();
      this.getJsonTranslations();
      console.info('Language Updated')
    });

    this.getUserStatus();
    // this.themeChanged();
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
  getClubsForPlayer() {
    this.talentService.getClubsForPlayer().subscribe(
      response => {
        if (response.status) {
          let clubs = response.data.clubs;
          localStorage.setItem('clubs', JSON.stringify(clubs));

        } else {

        }
      },
      error => {
        console.error('Error publishing advertisement:', error);
      }
    );
  }


  ngAfterViewInit() {
  }

  stopIntroTour() {
    if (this.introInstance) {
      this.introInstance.exit(); // Stop and clean up the tour
      this.introInstance = null; // Reset the reference
    }
  }

  ngOnDestroy() {
    // Clean up subscription to avoid memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.stopIntroTour(); // Ensure the tour stops when the component is destroyed
  }

  showOnce: boolean = true;

  startIntroTour(lang: string) {
    // introJs().start().goToStep(1);
    // this.translateService.use(lang); // Change language before fetching translations
    this.translateService.get([
      'profilePhoto',
      'deleteProfilePicture',
      'uploadYourBestHeadshot',
      'personalDetails',
      'addYourPersonalDetails',
      'highlights',
      'uploadPhotosAndVideos',
      'coverPhoto',
      'uploadCoverPhoto',
      'generalDetails',
      'editGeneralDetails',
      'previous',
      'next',
      'finish',
      'dontShowAgain'
    ]).subscribe((translations) => {
      this.dontShowAgainTourTxt = translations['dontShowAgain'];
      // deleteProfilePicture
      let profileImageTxt = '';
      let uploadYourBestHeadshot = '';
      if (!this.profileImage) {
        profileImageTxt = translations['profilePhoto'];
        uploadYourBestHeadshot = translations['uploadYourBestHeadshot'] + '.';
      } else {
        profileImageTxt = translations['deleteProfilePicture'];
        // uploadYourBestHeadshot = profileImageTxt;
      }
      this.introInstance.setOptions({
        steps: [
          {
            element: '#upload_profilePhoto',
            intro: `<div><h6>${profileImageTxt}</h6>${uploadYourBestHeadshot}</div>`,
            // tooltipClass: 'custom-tooltip',
            position: 'right'
          },
          {
            element: '#editPersonalDetails',
            intro: `<div><h6>${translations['personalDetails']}</h6>${translations['addYourPersonalDetails']}.</div>`,
            // tooltipClass: 'custom-tooltip',
            position: 'right'
          },
          {
            element: '.highlights-tour',
            intro: `<div><h6>${translations['highlights']}</h6>${translations['uploadPhotosAndVideos']}.</div>`,
            // tooltipClass: 'custom-tooltip',
            position: 'right'
          },
          {
            element: '#uploadCoverImage',
            intro: `<div><h6>${translations['coverPhoto']}</h6>${translations['uploadCoverPhoto']}.</div>`,
            // tooltipClass: 'custom-tooltip',
            position: 'left'
          },
          // {
          //   element: '#generalDetailsBtn',
          //   intro: `<div><h6>${translations['generalDetails']}</h6>${translations['editGeneralDetails']}.</div>`,
          //   position: 'right'
          // },
        ],
        showBullets: false,
        showProgress: false,
        exitOnOverlayClick: false,
        scrollToElement: true,
        prevLabel: translations['previous'],
        nextLabel: translations['next'],
        doneLabel: translations['finish'],
        tooltipPosition: 'auto',
      });

      if (this.showOnce) {
        this.introInstance.start();
        this.showOnce = false
      }
    });

    // Add the "Don't show again" checkbox dynamically
    this.introInstance.onafterchange(() => {

      const tooltipHeader = document.querySelector('.introjs-tooltip-header') as HTMLElement;

      if (tooltipHeader) {
        // Check if the "close-section" already exists
        let closeSection = tooltipHeader.querySelector('.close-section') as HTMLElement;
        if (!closeSection) {
          // Create the "close-section" container div
          closeSection = document.createElement('div');
          closeSection.className = 'close-section';

          // Apply styling to align elements
          closeSection.style.display = 'flex';
          closeSection.style.alignItems = 'center';
          closeSection.style.justifyContent = 'flex-end';

          // Add the checkbox and label
          closeSection.innerHTML = `
            <label style="font-size: 12px; display: flex; align-items: center; margin-right: 10px; color: white;">
              <input type="checkbox" id="dontShowAgain" style="margin-right: 5px; cursor: pointer;" />
              `+ this.dontShowAgainTourTxt + `
            </label>
          `;

          // Append "close-section" outside the <h1> but inside the header
          tooltipHeader.appendChild(closeSection);

          // Add event listener to the checkbox
          const checkbox = closeSection.querySelector('#dontShowAgain') as HTMLInputElement;
          if (checkbox) {
            checkbox.addEventListener('click', (event) => {
              event.stopPropagation(); // Ensure clicks do not propagate
              if (checkbox.checked) {
                // Save the user's preference
                localStorage.setItem('dontShowIntroTour', 'true');
                this.updateShowTour(checkbox.checked ? 0 : 1);
              } else {
                console.log('User unchecked "Don’t show it again"');
                this.updateShowTour(checkbox.checked ? 0 : 1);
                localStorage.removeItem('dontShowIntroTour');
              }
            });
          }
        }
      }
    });



    // Handle when the tour finishes
    // this.introInstance.oncomplete(() => this.handleTourExit());

    // Handle when the tour is exited manually
    // introInstance.onexit(() => this.handleTourExit());
    this.introInstance.oncomplete(() => this.handleTourExit());
    // this.introInstance.start();
  }

  // Centralized handling of "Don't show again" logic
  handleTourExit() {
    const checkbox = document.getElementById('dontShowAgain') as HTMLInputElement;
    const dontShowAgain = checkbox?.checked || false;

    // Call the API to update showTour (replace with your API call logic)
    this.updateShowTour(dontShowAgain ? 0 : 1);
  }

  updateShowTour(showTour: number) {
    this.talentService.updateShowTour(this.userId, showTour).subscribe(
      () => {
        console.log('Tour preferences updated successfully!');
      },
      (error) => {
        console.error('Error updating tour preferences:', error);
        this.toastr.error('An error occurred while updating tour preferences.');
      }
    );
  }

  onImageDeleted() {
    this.getGalleryData(); // Call your API fetching method
    this.getHighlightsData();
  }

  getGalleryData() {
    this.loading = true;  // Set loading to true before making the API call
    let params = {
      lang: localStorage.getItem('lang_id')
    };
    try {
      this.talentService.getGalleryData(params).subscribe((response) => {
        if (response && response.status && response.data) {
          this.userImages = response.data.images;
          this.userVideos = response.data.videos;
          this.imageBaseUrl = response.data.file_path;
        } else {
          this.userImages = [];
          this.userVideos = [];
          console.error('Invalid API response structure:', response);
        }
        this.loading = false;  // Set loading to false once data is loaded
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      this.loading = false;  // Set loading to false on error
    }
  }

  registredClubArr: any;
  customClubArr: any;
  currentClubInfo: any;
  getUserProfile(userId: any) {
    this.loading = true;  // Set loading to true before making the API call
    this.profileImageLoading = true;
    let params = {
      lang: localStorage.getItem('lang_id')
    };

    try {
      this.talentService.getProfileData(params).subscribe((response) => {

        if (response && response.status && response.data && response.data.user_data) {

          localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));
          localStorage.setItem('userData', JSON.stringify(response.data.user_data));
          console.info('UserDataArr', response.data.user_data);
          this.user = response.data.user_data;
          this.userNationalities = JSON.parse(this.user.user_nationalities);
          this.StartTour = this.user?.show_tour == 1 ? true : false;
          // customClubInfo
          if (this.user?.custom_club_info && this.user?.custom_club_info != '') {
            this.customClubInfo = JSON.parse(this.user.custom_club_info);
            console.info('customClubInfo', this.customClubInfo)
          }
          // userData.first_name+' '+userData.last_name
          console.info('User', this.user);
          if (this.user?.first_name || this.user?.last_name) {
            this.UserName = this.user?.first_name + ' ' + this.user?.last_name;
            this.titleService.setName(this.UserName);
            this.titleService.setRole(this.user?.role_name);
            console.info('userName Set Condition true', this.UserName);
          } else {
            console.info('userName Does Not Set Condition False', this.user);
          }

          if (this.user?.meta && this.user?.meta?.birth_country_flag != '') {
            // this.countryFlagUrl = this.user?.meta?.birth_country_flag;
          }
          if (this.user?.scout_info) {
            this.scoutInfoDetails = JSON.parse(this.user?.scout_info);

            if (typeof this.scoutInfoDetails?.id !== 'number' || isNaN(this.scoutInfoDetails?.id)) {
              this.scoutInfoDetails = [];
            }
          }
          // scoutInfoDetails
          this.isPremium = this.user?.active_subscriptions?.premium.length > 0 ? true : false;

          if (this.user?.active_subscriptions?.premium_talent) {
            this.isPremium = this.user?.active_subscriptions?.premium_talent.length > 0 ? true : false;
          }
          this.photoLoading = false;
          // this.isPremium = false;
          if (this.StartTour && this.isTourFirstTime) {
            // if (true) {
            setTimeout(() => {
              this.isTourFirstTime = false;
              // alert('Found lang in Db : '+response.data.user_data.lang)
              var dblang = 'en';
              if (response.data.user_data.lang == 1) {
                dblang = 'en';
              } else if (response.data.user_data.lang == 2) {
                dblang = 'de';
              } else if (response.data.user_data.lang == 3) {
                dblang = 'it';
              } else if (response.data.user_data.lang == 4) {
                dblang = 'fr';
              } else if (response.data.user_data.lang == 5) {
                dblang = 'es';
              } else if (response.data.user_data.lang == 6) {
                dblang = 'pt';
              } else if (response.data.user_data.lang == 7) {
                dblang = 'dk';
              } else if (response.data.user_data.lang == 8) {
                dblang = 'se';
              }
              let dontShowAgain = localStorage.getItem('dontShowIntroTour');
              if (dontShowAgain == 'true' || this.StartTour === false) {
                //  don't show again
              } else {
                if (this.globalSettings.getDeviceType() == 'desktop') {
                  this.startIntroTour(dblang);  // Start the tour after a slight delay
                } else {
                  console.info('Tour Not working in mobile now');
                }

              }

            }, 0);

          }


          // this.premium = this.user.active_subscriptions?.premium?.length > 0 ? true : false;
          this.premium = this.user.active_subscriptions?.premium_talent?.length > 0 ? true : false;
          this.booster = this.user.active_subscriptions?.booster?.length > 0 ? true : false;
          this.activeDomains = this.user.active_subscriptions?.country?.length > 0 ? true : false;
          this.profileImage = null;
          if (this.user?.meta?.profile_image_path) {
            this.profileImage = this.user.meta.profile_image_path;
            this.sendMessage();
            this.commonDataService.updateProfilePic(this.profileImage);
          }
          this.profileImageLoading = false;
          if (this.user?.meta?.cover_image_path) {
            this.coverImage = this.user.meta.cover_image_path;
          }

          // this.getCountryFromPlaceOfBirth(this.user?.meta?.place_of_birth);

          // if (this.userNationalities?.length) {
          //   // Fetch flag details for each nationality
          //   this.userNationalities.forEach((nat:any, index:any) => {
          //     this.getCountry(nat.flag_path, index);
          //   });
          // }


          if (this.user?.meta?.have_registered_club == 1 && this.user?.registered_club_info != '') {
            this.registredClubArr = JSON.parse(this.user?.registered_club_info);
          }
          if (this.user?.meta?.have_custom_club == 1 && this.user?.custom_club_info != '') {
            this.customClubArr = JSON.parse(this.user?.custom_club_info);
          }

          if (this.user?.meta?.have_custom_club != 1 && this.user?.meta?.have_registered_club != 1 && this.user?.current_club_info != '') {
            this.currentClubInfo = JSON.parse(this.user?.current_club_info);
          }

        }
        this.getUserPopups();
        this.loading = false;  // Set loading to false once data is loaded
      });
    } catch (error) {
      this.profileImageLoading = false;
      console.error('Error fetching users:', error);
      this.loading = false;  // Set loading to false on error
    }
  }

  getCountry(placeOfBirth: string, key: any): void {
    if (!placeOfBirth) {
      console.error("Place of birth is empty.");
      return;
    }


    // const apiKey = environment.googleApiKey;  // Replace with your Google Maps API key
    const apiKey = 'environment.googleApiKey';  // Replace with your Google Maps API key
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeOfBirth)}&key=${apiKey}`;

    fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK' && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;

          // Extract country from address components
          const countryComponent = addressComponents.find((component: any) =>
            component.types.includes('country')
          );

          if (countryComponent) {
            const country = countryComponent.short_name;  // Set country name, use short_name for country code
            console.log(`https://flagcdn.com/w320/${country.toLowerCase()}.png`);

            this.userNationalities[key].flag_path = `https://flagcdn.com/w320/${country.toLowerCase()}.png`;
          } else {
            console.error("Country not found in placeOfBirth.");
            return;
          }
        } else {
          console.error("Geocoding API error:", data.status, data.error_message);
          return;
        }
      })
      .catch(error => console.error("Error fetching geocoding data:", error));
  }

  // After loading, mark countries as loaded and check if both are ready
  loadCountries() {
    let params = {
      lang: localStorage.getItem('lang_id')
    };
    return this.talentService.getCountries(params).subscribe(
      (response) => {
        if (response && response.status) {
          this.countries = response.data.countries;
        }
      });
  }

  openPopup(popups: any) {
    popups.forEach((data: any) => {
      this.dialog.open(PopupComponent, {
        width: '500px',
        position: {
          top: '150px'
        },
        data: {
          title: data.title,
          description: data.description
        }
      })
      this.editPopupSeen(data);
    })
  }

  getUserPopups() {
    try {
      let data = {
        role: '4',
        payment_type: this.isPremium ? 'paid' : 'free',
        status: 'active',
        language: localStorage.getItem('lang_id'),
        domain_id: this.user.user_domain_id
      }
      this.userService.getUserPopups(data).subscribe((response) => {
        if (response && response.status) {
          console.info('this.popups', response.data);
          this.popupData = response.data.popups;
          this.popupData.forEach((data: any) => {
            this.addPopupSeen(data);
          });
          this.getPopupSeen();
        } else {
          // this.highlights = [];
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  getPopupSeen() {
    // 
    let data = {
      user_id: this.userId
    }
    try {
      this.userService.getPopupSeen(data).subscribe((response) => {
        if (response && response.status) {
          console.info('this.popupSeen data: ', response.data);
          this.popupSeen = response.data.popupSeens;
          this.showPopups(0);
        }
        // else {
        //   console.error('no data for popup-seen:', response);
        //   this.openPopup(false, 0);
        //   this.popupData.forEach((data: any) => {
        //     this.addPopupSeen(data);
        //   });
        // }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  freq: any = ['once', 'days', 'weeks', 'months'];

  showPopups(index: any) {
    if (index == 4) {
      return;
    }
    let popups: any[] = [];
    this.popupSeen.forEach((element: any) => {
      if (element[this.freq[index]] === '1') {
        let popup = this.popupData.filter((pop: any) => pop.id === element.popup_id)
        popups.push(popup[0]);
      }
    });
    console.log(popups, "here");
    if (popups.length === 0) {
      index += 1;
      this.showPopups(index);
    }
    else {
      this.openPopup(popups);
    }
  }

  addPopupSeen(data: any) {
    let formData: any = {};
    formData.popup_id = data.id;
    if (data.frequency_value) {
      formData[data.frequency_value] = data.frequency_count;
    }
    else {
      return
    }

    console.log('formdata for adding popup seen', formData)
    try {
      this.userService.addPopupSeen(formData).subscribe((response) => {
        if (response && response.status) {
          console.info('this.popupSeen data: ', response.data);
        } else {
          console.error('no data for popup-seen:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  editPopupSeen(data: any) {
    let formData: any = {};

    // formData[freq] = 0;
    formData.popup_id = data.id;

    try {
      this.userService.editPopupSeen(data.id, formData).subscribe((response) => {
        if (response && response.status) {
          console.info('this.popupSeen data: ', response.data);
        } else {
          console.error('no data for popup-seen:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  openEditDialog() {
    // this.toastr.success('This will not disappear or hide on click', 'Notice', {
    //   disableTimeOut: true,
    //   tapToDismiss: false,
    //   closeButton: false
    // });

    // this.toastr.error('This will not disappear or hide on click', 'Notice', {
    //   disableTimeOut: true,
    //   tapToDismiss: false,
    //   closeButton: false
    // });
    // return;
    // if(!this.isUserVerified){
    //   this.toastr.warning(this.accountVerificationPending);
    //   return;
    // }

    // console.info('Data passed ', this.user)
    const dialogRef = this.dialog.open(EditPersonalDetailsComponent, {
      width: '800px',
      panelClass: 'edit_p_detail',
      data: { user: this.user, countries: this.countries }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserProfile(this.userId);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  // openHighlight() {
  //   this.getGalleryData();
  //   let dialogRef = [];
  //   setTimeout(() => {
  //     dialogRef = this.dialog.open(EditHighlightsComponent, {
  //       width: '800px',
  //       data: {
  //         images: this.userImages,
  //         videos: this.userVideos,
  //         url: this.imageBaseUrl
  //       }
  //     });
  //   }, 1500);

  //   dialogRef.afterClosed().subscribe(result => {
  //     this.getHighlightsData()
  //   });

  // }
  // openHighligh1t() {
  //   this.getGalleryData(); // Call function as usual

  //   const checkDataLoaded = () => {
  //     return new Promise<void>((resolve) => {
  //       const interval = setInterval(() => {
  //         if (this.userImages && this.userImages.length > 0) {
  //           clearInterval(interval);
  //           resolve(); // Data is loaded
  //         }
  //       }, 300); // Check every 300ms
  //     });
  //   };

  //   checkDataLoaded().then(() => {
  //     const dialogRef = this.dialog.open(EditHighlightsComponent, {
  //       width: '800px',
  //       data: {
  //         images: this.userImages,
  //         videos: this.userVideos,
  //         url: this.imageBaseUrl
  //       }
  //     });

  //     dialogRef.afterClosed().subscribe(() => {
  //       this.getHighlightsData();
  //     });
  //   });
  // }

  setDurationAndThumbnail(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
    // Set Duration
    this.duration = this.formatDuration(videoElement.duration);

    // Capture Thumbnail
    // this.captureThumbnail(videoElement);
  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
  }

  openHighlight() {
    // this.isHighlightClick = false;
    // this.getGalleryData();
    // setTimeout(() => {
    const dialogRef = this.dialog.open(EditHighlightsComponent, {
      width: '800px',
      data: {
        // images: this.userImages,
        // videos: this.userVideos,
        // url: this.imageBaseUrl
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.duration = result.videoDuration,
      setTimeout(() => {
        this.getHighlightsData();
      }, 1500);
      this.isHighlightClick = true;
    });
    // }, 1500);

  }



  getHighlightsData() {
    try {
      let params = {
        lang: localStorage.getItem('lang_id')
      };
      this.talentService.getHighlightsData(params).subscribe((response) => {
        if (response && response.status && response.data && response.data.images) {
          this.highlights = response.data;
          console.info('this.highlights', this.highlights)
          // this.isLoading = false;
        } else {
          this.highlights = {};
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  openImage(index: any, type: string): void {
    const filePath = this.highlights.file_path;

    const images = this.highlights.images.map((img: any) => ({
      src: filePath + img.file_name,
      type: 'image',
    }));
    const videos = this.highlights.videos.map((vid: any) => ({
      src: filePath + vid.file_name,
      type: 'video',
    }));

    if (type === 'video') {
      index += this.highlights.images.length;
    }


    const album = [...images, ...videos];

    // const mainImage = String(index).includes('video_')
    //   ? videos[+index.replace('video_', '')]
    //   : images[index];

    const mainImage = album[index]

    console.log(mainImage, "img,,,,", index);

    this.dialog.open(LightboxDialogComponent, {
      width: '80%',
      height: '85%',
      data: { album, mainImage },
      panelClass: 'lightbox-dialog'
    });
  }

  openImage2(index: any): void {
    let lighboxObject = {};
    let imagesArr = this.highlights.images.map((image: any) => ({
      src: this.highlights.file_path + image.file_name,
    }));
    let videosArr = this.highlights.videos.map((video: any) => ({
      src: this.highlights.file_path + video.file_name,
    }));
    if (String(index).includes("video_")) {
      index = index.replace("video_", "");
      console.info('videosArr', videosArr, 'Index', index);
      lighboxObject = { src: videosArr[index].src, type: 'video' };
    } else {
      lighboxObject = { src: imagesArr[index].src, type: 'image' };
      console.info('imagesArr', imagesArr, 'Index', index);
    }
    console.info('lighboxObject', lighboxObject);
    this.album = [
      ...this.highlights.images.map((image: any) => ({
        src: this.highlights.file_path + image.file_name,
        type: 'image'
      })),
    ];

    console.warn('index is ' + index, 'Album ', this.album, 'Main ', 'Source ' + this.album[index].src, 'Type ' + this.album[index].type)

    // Open dialog with the selected image
    this.dialog.open(LightboxDialogComponent, {
      width: '80%',
      height: '85%',
      data: {
        album: this.album,
        mainImage: lighboxObject,
      },
      panelClass: 'lightbox-dialog'
    });
  }


  openVideo(index: number): void {
    // Prepare album
    let videosArr = this.userVideos.map((image: any) => ({
      src: this.highlights.file_path + image.file_name,
    }));
    // alert(index)
    // console.warn(this.userVideos)
    // console.warn(this.userVideos[index])
    console.warn(videosArr)

    // Open dialog with the selected image
    this.dialog.open(LightboxDialogComponent, {
      width: '80%',
      height: '85%',
      data: {
        videos: videosArr,
        mainVideo: { src: 'https://api.socceryou.ch/uploads/' + this.userVideos[index].file_name },
      },
      panelClass: 'lightbox-dialog'
    });
  }

  navigateImage(direction: 'prev' | 'next'): void {
    // Get current image index
    const currentIndex = this.album.findIndex(image => image.src === this.mainImage.src);
    if (currentIndex === -1) {
      console.warn("Main image not found in the album.");
      return;
    }

    // Handle edge cases (first and last image)
    const newIndex = Math.max(0, Math.min(this.album.length - 1, currentIndex + (direction === 'next' ? 1 : -1)));

    // Update main image and handle potential wrapping
    this.mainImage = { src: this.album[newIndex].src };
  }


  getCoverImg() {
    try {
      this.talentService.getCoverImg().subscribe((response) => {
        if (response?.data?.userData?.metaValue) {
          this.coverImage = response.data.userData.cover_image_path;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  uploadCroppedImage(croppedImage: string): void {
    // Convert the base64 cropped image to a Blob
    const blob = this.dataURItoBlob(croppedImage);
    const formData = new FormData();
    formData.append('profile_image', blob, 'cropped-image.png');

    // Show a loading toast
    this.toastr.info(this.uploadingPhotos, this.pleaseWait, { disableTimeOut: true });

    this.talentService.uploadProfileImage(formData).subscribe(
      (response) => {
        this.toastr.clear();
        if (response && response.status) {
          this.profileImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
          this.dataEmitter.emit(this.profileImage); // Emit updated profile image
          this.commonDataService.updateProfilePic(this.profileImage);
          if (response.message != '') {
            this.toastr.success(response.message, this.successTxt);
          } else {
            this.toastr.success('Profile image uploaded successfully!', 'Success');
          }
        } else {
          this.toastr.error('Failed to upload profile image. Please try again.', 'Upload Failed');
        }
      },
      (error) => {
        this.toastr.clear();
        this.toastr.error('An error occurred during upload. Please try again.', 'Upload Error');
        console.error('Error uploading profile image:', error);
      }
    );
  }

  uploadCroppedCoverImage(croppedImage: string): void {
    const blob = this.dataURItoBlob(croppedImage);
    const formData = new FormData();
    formData.append('cover_image', blob, 'cropped-image.png');

    // Show a loading toast
    this.toastr.info(this.uploadingPhotos, this.pleaseWait, { disableTimeOut: true });

    try {
      this.talentService.uploadCoverImage(formData).subscribe(
        (response) => {
          if (response && response.status) {
            this.coverImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
            this.dataEmitter.emit(this.coverImage);  // Emit updated cover image
            this.toastr.clear();
            if (response.message != '') {
              this.toastr.success(response.message, this.successTxt);
            } else {
              this.toastr.success('Cover image uploaded successfully!', 'Success');
            }
          } else {
            this.toastr.clear();
            this.toastr.error(this.generalError, this.errorTxt);
            console.error('Invalid API response structure:', response);
          }
        },
        (error) => {
          this.toastr.clear();
          this.toastr.error(this.generalError, this.errorTxt);
          console.error('Error uploading cover image:', error);
        },
      );
    } catch (error) {
      this.toastr.clear();
      this.toastr.error(this.generalError, this.errorTxt);
      console.error('Error during cover image upload:', error);
    }

  }

  // Helper function to convert base64 to Blob
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  deleteProfileImage() {
    this.userService.deleteProfileImage().subscribe(
      response => {
        if (response.status) {
          this.profileImage = null;
          this.commonDataService.updateProfilePic(this.defaultProfileImage);
          this.toastr.success(response.message, this.successTxt);
        }
        else {
          this.toastr.error(response.error, this.errorTxt);
        }
      },
      error => {
        console.error('Error deleting user:', error);
        this.toastr.error(this.generalError, this.errorTxt);
      }
    );
  }

  onProfileFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      if (!selectedFile.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      const maxSizeInBytes = 15 * 1024 * 1024; // 5 MB
      if (selectedFile.size > maxSizeInBytes) {
        let dynamicMessage = this.maxSizeForProfile.replace('{{fileName}}', selectedFile.name);
        this.toastr.error(dynamicMessage, this.errorTxt, {
          timeOut: 5000  // Set duration to 5 seconds (5000ms)
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const imageData = reader.result as string;

        const dialogRef = this.dialog.open(ImageCropperComponent2, {
          width: '500px',
          data: { imageUrl: imageData, action: 'profile_image' },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe((croppedImage) => {
          if (croppedImage) {
            console.log('Cropped Image:', croppedImage);
            this.uploadCroppedImage(croppedImage);
          } else {
            console.log('No cropped image returned');
          }
        });
      };

      reader.readAsDataURL(selectedFile);
    } else {
      console.error('No file selected');
    }
  }

  onCoverImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      if (!selectedFile.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      const maxSizeInBytes = 15 * 1024 * 1024; // 5 MB
      if (selectedFile.size > maxSizeInBytes) {
        this.toastr.error(this.maxSizeForProfile, this.errorTxt, {
          timeOut: 5000  // Set duration to 5 seconds (5000ms)
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const imageData = reader.result as string;

        const dialogRef = this.dialog.open(CoverImageCropperComponent, {
          width: '850px',
          data: { imageUrl: imageData, action: 'cover_image' },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe((croppedImage) => {
          if (croppedImage) {
            console.log('Cropped Image:', croppedImage);
            this.uploadCroppedCoverImage(croppedImage);
          } else {
            console.log('No cropped image returned');
          }
        });
      };

      reader.readAsDataURL(selectedFile);
    } else {
      console.error('No file selected');
    }
  }


  onProfileFileChange1(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Set loading state and display info toast
      this.toastr.info(this.uploadingPhotos, this.pleaseWait, { disableTimeOut: true });

      try {
        const formData = new FormData();
        formData.append("profile_image", this.selectedFile);

        this.talentService.uploadProfileImage(formData).subscribe(
          (response) => {
            if (response && response.status) {
              this.profileImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
              this.dataEmitter.emit(this.profileImage);  // Emit updated profile image
              this.toastr.clear();
              this.commonDataService.updateProfilePic(this.profileImage);
              if (response.message != '') {
                this.toastr.success(response.message, this.successTxt);
              } else {
                this.toastr.success('Profile image uploaded successfully!', 'Success');
              }
            } else {
              this.toastr.clear();

              if (response.data.errors.profile_image != '' && response.data.errors.profile_image != undefined) {
                this.toastr.error(response.data.errors.profile_image);
              } else {
                this.toastr.error('Failed to upload profile image. Please try again.', 'Upload Failed');
              }
              console.error('Invalid API response structure:', response);
            }
          },
          (error) => {
            this.toastr.clear();
            this.toastr.error('An error occurred during upload. Please try again.', 'Upload Error');
            console.error('Error uploading profile image:', error);
          },
        );
      } catch (error) {
        this.toastr.clear();
        this.toastr.error('An unexpected error occurred. Please try again.', 'Upload Error');
        console.error('Error during file upload:', error);
      }
    }
  }

  onProfileFileChangeBckp(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Check if files exist and that there is at least one file selected
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Check if the file is an image before proceeding
      if (!this.selectedFile.type.startsWith('image/')) {
        // Display an error if the file is not an image
        console.error('Selected file is not an image');
        return;
      }

      const reader = new FileReader();

      // Set loading state and display info toast (add your loading logic here if needed)
      reader.onload = () => {
        const imageData = reader.result as string;

        // Open image cropper dialog with the loaded image
        // const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
        //   width: '500px',
        //   data: { imageUrl: imageData }
        // });

        // dialogRef.afterClosed().subscribe(croppedImage => {
        //   if (croppedImage) {
        //     console.log('Cropped Image:', croppedImage);

        //     this.uploadProfileImage();
        //   } else {
        //     console.log('No cropped image returned');
        //   }
        // });
      };

      // Read the file as a Data URL for image preview
      reader.readAsDataURL(this.selectedFile);
    } else {
      console.error('No file selected');
    }
  }

  sendMessage() {
    this.talentService.updatePicOnHeader(this.profileImage);
  }

  onCoverFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Set loading state and display info toast
      this.toastr.info(this.uploadingPhotos, this.pleaseWait, { disableTimeOut: true });

      try {
        const formData = new FormData();
        formData.append("cover_image", this.selectedFile);

        this.talentService.uploadCoverImage(formData).subscribe(
          (response) => {
            if (response && response.status) {
              this.coverImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
              this.dataEmitter.emit(this.coverImage);  // Emit updated cover image
              this.toastr.clear();
              if (response.message != '') {
                this.toastr.success(response.message, this.successTxt);
              } else {
                this.toastr.success('Cover image uploaded successfully!', 'Success');
              }
            } else {
              this.toastr.clear();
              this.toastr.error(this.generalError, this.errorTxt);
              console.error('Invalid API response structure:', response);
            }
          },
          (error) => {
            this.toastr.clear();
            this.toastr.error(this.generalError, this.errorTxt);
            console.error('Error uploading cover image:', error);
          },
        );
      } catch (error) {
        this.toastr.clear();
        this.toastr.error(this.generalError, this.errorTxt);
        console.error('Error during cover image upload:', error);
      }
    }
  }

  deleteCoverImage(): void {
    // Set loading state and display info toast
    this.toastr.info(this.deletingCoverImage, this.pleaseWait, { disableTimeOut: true });

    try {
      this.talentService.deleteCoverImage().subscribe(
        (response) => {
          if (response && response.status) {
            this.coverImage = null;  // Indicates no value is set
            this.dataEmitter.emit('');  // Emit empty string to indicate deletion
            this.toastr.clear();
            let test = document.getElementById('file-upload2') as HTMLInputElement;
            let test2 = document.getElementById('file-upload') as HTMLInputElement;
            test.value = '';
            test2.value = '';
            if (response.message != '') {
              this.toastr.success(response.message, this.successTxt);
            } else {
              this.toastr.success('Cover image deleted successfully.', 'Success');
            }
          } else {
            this.toastr.clear();
            if (response.message != '') {
              // this.toastr.success(response.message, this.successTxt);
              this.toastr.error(response.message, this.errorTxt);
            } else {
              // this.toastr.success('Cover image deleted successfully.', 'Success');
              this.toastr.error(this.generalError, this.errorTxt);
            }
            console.error('Invalid API response structure:', response);
          }
        },
        (error) => {
          this.toastr.clear();
          this.toastr.error(this.generalError, this.errorTxt);
          console.error('Error deleting cover image:', error);
        },
      );
    } catch (error) {
      this.toastr.clear();
      this.toastr.error(this.generalError, this.errorTxt);
      // console.error('Error during cover image deletion:', error);
    }
  }

  openDeleteDialog(type: string): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
      data: {
        type2: type,
        from_page: 'cover'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If the user confirms, proceed with deletion
        if (type === 'cover') {
          this.deleteCoverImage();
        }
        if (type === 'profile') {
          this.deleteProfileImage();
        }
      } else {
        // this.toastr.info(this.coverImageDeletionCanceled, this.Canceled);
        // console.log('User canceled the delete');
      }
    });
  }

  showMatDialog(message: string, action: string) {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          this.deleteUser();
        }
      }
    });
  }

  getAllTeams() {
    this.talentService.getTeams().subscribe((data) => {
      this.teams = data;
    });
  }

  calculateAge(dob: string | Date): number {
    // Convert the input date to a Date object if it's a string
    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust the age if the current date is before the birthday
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    if (!age) {
      age = 0;
    }
    return age;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  deleteUser() {
    let langId = localStorage.getItem('lang_id');
    this.userService.deleteUser([this.userId], langId).subscribe(
      response => {
        this.showMatDialog(response.message, 'display');
        this.router.navigate(['/talent/dashboard']);
      },
      error => {
        console.error('Error deleting user:', error);
        this.showMatDialog(this.generalError, 'display');
      }
    );
  }

  handleCoverImageData(data: string) {
    this.coverImage = data; // Assign the received data to a variable
    console.log('Data received from child:', data);
  }

  getToasterMsg() {
    this.translateService.get(['pleaseWait', 'uploadingPhotos', 'success!', 'error', 'deletingCoverImage', 'coverImageDeletionCanceled', 'Canceled', 'accountVerificationPending', 'maxSizeForProfile']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.uploadingPhotos = translations['uploadingPhotos'];
      this.successTxt = translations['success!'];
      this.errorTxt = translations['error'];
      this.deletingCoverImage = translations['deletingCoverImage'];
      this.coverImageDeletionCanceled = translations['coverImageDeletionCanceled'];
      this.Canceled = translations['Canceled'];
      this.accountVerificationPending = translations['accountVerificationPending'];
      this.maxSizeForProfile = translations['maxSizeForProfile'];
    });
  }

  getJsonTranslations() {
    this.translateService.get(['dashboard', 'forgotPassword.generalError', 'downloading', 'pleaseWait']).subscribe((translations) => {
      this.pageTitle = translations['dashboard'];
      this.generalError = translations['forgotPassword.generalError'];
      this.downloading = translations['downloading'];
      this.pleaseWaitTxt = translations['pleaseWait'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }
  themeChanged() {
    let currentTheme = localStorage.getItem('theme');
    this.currentThemeMode = currentTheme;
    if (this.currentThemeMode == null || this.currentThemeMode == undefined) {
      this.currentThemeMode = 'light';
    }
  }

  getDuration(event: Event, video: any) {
    const videoElement = event.target as HTMLVideoElement;
    video.duration = videoElement.duration; // Store duration in the video object
  }

  getVideoDuration(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
    let number = this.formatDuration(videoElement.duration); // output like this 0:54
    // if (typeof number === 'number' && !isNaN(number)) {
    return number;
    // }
    // return '';
  }

  isValidDate(value: any): boolean {
    return value && !isNaN(new Date(value).getTime());
  }


  navigatePlans() {
    this.router.navigate(['/talent/plans']);
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

  exportSingleUser() {

    try {
      let userId = this.userId;
      // Set loading state and display info toast
      this.toastr.info(this.downloading, this.pleaseWaitTxt, { disableTimeOut: true });

      this.userService.exportSingleUser(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          console.info('response', response.data);
          this.toastr.clear();
          if (response?.data?.file_path != '') {
            this.forceDownload(response?.data?.file_path, response?.data?.file_name ? response?.data?.file_name : 'player_pdf.pdf');
          }
        } else {
          this.toastr.clear();
          this.toastr.error('Failed to download. Please try again.', 'Download Failed');

          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.toastr.clear();
      console.error('Error adding to favorites:', error);
    }

  }

  async getBoosterData() {

    let params: any = {};
    // params.lang = localStorage.getItem('lang_id');

    try {
      const response = await this.talentService.getBoosterData(params).toPromise();
      if (response?.data) {
        this.stats = response.data;
        console.log(this.stats)
        // Ensure the selectedAudienceIds array is cleared and populated with the correct data
      } else {
        console.error('Failed to create checkout session', response);
      }
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
    }
  }

  editBooster(data: any) {

    const dialogRef = this.dialog.open(EditMembershipProfileComponent, {
      width: '1000px',
      data: {
        stats: this.stats
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBoosterData()
      }

      if (result.role != undefined && result.role != '') {
        if (result.role == 'talent' || result.role == 'scout' || result.role == 'club') {
          if (result.user_id != '' && result.user_id != undefined && result.redirect_path) {
            this.router.navigate([result.redirect_path, result.user_id]);
          }
        }
      }
    });
  }

  parseJson(jsonObj: any) {
    if (jsonObj && jsonObj != '') {
      console.info('jsonObj', jsonObj)
      // return JSON.parse(jsonObj);
    }
  }



  naviGateScoutProfile(id: string | number): void {
    this.router.navigate(['view', 'scout', id]);
  }

  // forceDownload(fileUrl: string, fileName: string): void {
  //   // Use fetch to get the blob and manually trigger the download
  //   fetch(fileUrl, {
  //     mode: 'cors' // Required for cross-origin
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.blob();
  //     })
  //     .then(blob => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = fileName; // <-- Important: force file name
  //       a.style.display = 'none';
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       window.URL.revokeObjectURL(url);
  //     })
  //     .catch(error => {
  //       console.error('Download failed:', error);

  //       // Fallback: open in new tab (last resort for Safari)
  //       window.open(fileUrl, '_blank');
  //     });
  // }


  async forceDownload(src: string, filename: string) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob(); // Convert the response to a Blob object
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename; // Use the filename passed to the function
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }

  deleteScoutFromProfile() {
    // Confirmation 
    const messageDialog = this.dialog.open(DeletePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        from_page: 'dashboard-delete-scout'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      console.log('result', result)
      if (result && result.action == 'delete-confirmed') {
        this.talentService.deleteScoutFromProfile(this.scoutInfoDetails.id).subscribe(
          (response: any) => {
            // this.showMatDialog(response.message, 'display');
            // this.scoutInfoDetails = [];

            if (response.status) {
              this.showMatDialog(response.message, 'display');
              this.socketService.emit("scoutRemoved", { senderId: this.loggedInUser.id, receiverId: this.scoutInfoDetails.id })
              this.scoutInfoDetails = [];
            }
          },
          error => {
            console.error('Error deleting user:', error);
            this.showMatDialog(this.generalError, 'display');
          }
        );
      } else {
        return;
      }
    })
    //End Confirmation 

  }
}
