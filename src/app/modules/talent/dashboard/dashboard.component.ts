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
import { LightboxDialogComponent } from '../lightbox-dialog/lightbox-dialog.component';
import { NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { CommonDataService } from '../../../services/common-data.service';
import { WebPages } from '../../../services/webpages.service';
import { TitleService } from '../../../title.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';

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
    private globalSettings: GlobalSettingsService
  ) { }
  activeTab: string = 'profile';
  userId: any;
  user: any = {};
  userNationalities: any = [];
  coverImage: any;
  profileImage: any;
  selectedFile: any;
  isHighlightClick: boolean = true;
  teams: any;
  highlights: any;
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any;
  defaultCoverImage: any = "./media/palyers.png";
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

  async ngOnInit() {
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

    this.webPages.languageId$.subscribe((data) => {
      this.getUserProfile(this.userId);
      this.getHighlightsData();
      this.loadCountries();
      this.getGalleryData();
      this.getJsonTranslations();
    });

    await this.getAllTeams();

    // Listen for route changes
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.stopIntroTour(); // Stop the tour on navigation
      }
    });

    this.getClubsForPlayer();

    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });
    // this.themeChanged();
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
      this.introInstance.setOptions({
        steps: [
          {
            element: '#upload_profilePhoto',
            intro: `<div><h6>${translations['profilePhoto']}</h6>${translations['uploadYourBestHeadshot']}.</div>`,
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
          {
            element: '#generalDetailsBtn',
            intro: `<div><h6>${translations['generalDetails']}</h6>${translations['editGeneralDetails']}.</div>`,
            // tooltipClass: 'custom-tooltip',
            position: 'left'
          },
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
          console.error('Invalid API response structure:', response);
        }
        this.loading = false;  // Set loading to false once data is loaded
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      this.loading = false;  // Set loading to false on error
    }
  }

  getUserProfile(userId: any) {
    this.loading = true;  // Set loading to true before making the API call

    let params = {
      lang: localStorage.getItem('lang_id')
    };

    try {
      this.talentService.getProfileData(params).subscribe((response) => {

        if (response && response.status && response.data && response.data.user_data) {
          localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));

          this.user = response.data.user_data;
          this.userNationalities = JSON.parse(this.user.user_nationalities);
          this.StartTour = this.user?.show_tour == 1 ? true : false;
          if (this.user?.meta && this.user?.meta?.birth_country_flag != '') {
            // this.countryFlagUrl = this.user?.meta?.birth_country_flag;
          }
          this.isPremium = this.user?.active_subscriptions?.premium.length > 0 ? true : false;
          // this.isPremium = true;
          // if (this.StartTour && this.isTourFirstTime) {
          if (true) {
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
              if (dontShowAgain == 'true') {
                //  don't show again
              } else {
                this.startIntroTour(dblang);  // Start the tour after a slight delay
              }
            }, 0);
          }


          this.premium = this.user.active_subscriptions?.premium?.length > 0 ? true : false;
          this.booster = this.user.active_subscriptions?.booster?.length > 0 ? true : false;
          this.activeDomains = this.user.active_subscriptions?.country?.length > 0 ? true : false;

          if (this.user?.meta?.profile_image_path) {
            this.profileImage = this.user.meta.profile_image_path;
            this.sendMessage();
            this.commonDataService.updateProfilePic(this.profileImage);

          }
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

        }

        this.loading = false;  // Set loading to false once data is loaded
      });
    } catch (error) {
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

  openEditDialog() {
    console.info('Data passed ', this.user)
    const dialogRef = this.dialog.open(EditPersonalDetailsComponent, {
      width: '800px',
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
  openHighligh1t() {
    this.getGalleryData(); // Call function as usual

    const checkDataLoaded = () => {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (this.userImages && this.userImages.length > 0) {
            clearInterval(interval);
            resolve(); // Data is loaded
          }
        }, 300); // Check every 300ms
      });
    };

    checkDataLoaded().then(() => {
      const dialogRef = this.dialog.open(EditHighlightsComponent, {
        width: '800px',
        data: {
          images: this.userImages,
          videos: this.userVideos,
          url: this.imageBaseUrl
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getHighlightsData();
      });
    });
  }

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
    this.isHighlightClick = false;
    // this.getGalleryData();
    setTimeout(() => {
      const dialogRef = this.dialog.open(EditHighlightsComponent, {
        width: '800px',
        data: {
          images: this.userImages,
          videos: this.userVideos,
          url: this.imageBaseUrl
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        // this.duration = result.videoDuration,
        this.getHighlightsData();
        this.isHighlightClick = true;
      });
    }, 0);

  }



  getHighlightsData() {
    try {
      let params = {
        lang: localStorage.getItem('lang_id')
      };
      this.talentService.getHighlightsData(params).subscribe((response) => {
        if (response && response.status && response.data && response.data.images) {
          this.highlights = response.data;
          // this.isLoading = false;
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

  openImage(index: number): void {
    // Prepare album
    let gallery = [];
    gallery.push(this.highlights.images);
    gallery.push(this.highlights.videos);

    this.album = gallery.map((file: any) => ({
      src: this.highlights.file_path + file.file_name,
    }));

    // Open dialog with the selected image
    this.dialog.open(LightboxDialogComponent, {
      width: '80%',
      height: '85%',
      data: {
        album: this.album,
        mainImage: { src: this.album[index].src },
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

  onProfileFileChange(event: Event): void {
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
              
              if(response.data.errors.profile_image != '' && response.data.errors.profile_image != undefined){
                this.toastr.error(response.data.errors.profile_image);
              }else{
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
            test.value = '';
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

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If the user confirms, proceed with deletion
        this.deleteCoverImage();
      } else {
        this.toastr.info(this.coverImageDeletionCanceled, this.Canceled);
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
    this.translateService.get(['pleaseWait', 'uploadingPhotos', 'success!', 'error', 'deletingCoverImage', 'coverImageDeletionCanceled', 'Canceled']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
      this.uploadingPhotos = translations['uploadingPhotos'];
      this.successTxt = translations['successTxt'];
      this.errorTxt = translations['errorTxt'];
      this.deletingCoverImage = translations['deletingCoverImage'];
      this.coverImageDeletionCanceled = translations['coverImageDeletionCanceled'];
      this.Canceled = translations['Canceled'];
    });
  }

  getJsonTranslations() {
    this.translateService.get(['dashboard', 'forgotPassword.generalError']).subscribe((translations) => {
      this.pageTitle = translations['dashboard'];
      this.generalError = translations['forgotPassword.generalError'];
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
}
