import { Component, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnInit, Output } from '@angular/core';
// import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TalentService } from '../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket.service';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { WebPages } from '../../../services/webpages.service';
import { TalentModule } from '../../talent/talent.module';
import { TalentTooltipService } from '../../../services/talent-tooltip.service';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TitleService } from '../../../title.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { TeamsComponent } from './tabs/teams/teams.component';
import { SightingComponent } from './tabs/sighting/sighting.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent implements OnInit {
  duration: any;
  loggedInUser: any = localStorage.getItem('userInfo');
  activeTab: string = 'profile';
  pageTitle: string = '';
  userId: any;
  user: any = {};
  userNationalities: any = [];
  coverImage: any = '';
  profileImage: any = '';
  selectedFile: any;
  teams: any;
  highlights: any;
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any;
  defaultCoverImage: any;
  isFavorite: boolean = false; // Added to track favorite status
  downloadPath: any = '';
  isPremium: any = false;
  countryFlagUrl: string = './assets/images/city-icon-light.png';
  personalDetailsTooltip: string = '';
  highlightsTooltip: string = '';
  profilePhotoTooltip: string = '';
  addFavorite: string = '';
  removeFavorite: string = '';
  downloadPdf: string = '';
  startConversation: string = '';
  pleaseWaitTxt: string = '';
  downloading: string = '';
  currentThemeMode: any = localStorage.getItem('theme');
  currentUserRole: string = '';
  translatedText: string = '';
  private tooltipSubscription!: Subscription; // ✅ Subscription for tooltips
  baseUrl: string = '';
  videoDuration: number = 0;
  @Output() dataEmitter = new EventEmitter<string>();
  @ViewChild('videoPlayer2') videoElementRef!: ElementRef<HTMLVideoElement>;

  @ViewChild(TeamsComponent)
  teamsTabComponent!: TeamsComponent;
  @ViewChild(SightingComponent)
  sightingComponent!: SightingComponent;
  scoutInfoDetails: any;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private talentService: TalentService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,
    private socketService: SocketService,
    private webPages: WebPages,
    private tooltipService: TalentTooltipService,
    private translate: TranslateService,
    private titleService: TitleService,
    private globalSettings: GlobalSettingsService
  ) { }

  ngOnInit(): void {
    this.themeChanged();

    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getUser(this.userId);
      this.activeTab = 'profile';
      // code by amrit
      this.getToolTips();
      // code by amrit
    });

    if (this.coverImage == '') {
      this.coverImage = this.defaultCoverImage;
    }
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data) => {
      this.getToasterMsg();
      this.getUser(this.userId);
      this.getToolTips();
    });

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });


    let role = history.state.role;
    // alert('role is ' + role)
    // alert(typeof role)
    if (role != '' && role != undefined) {
      this.currentUserRole = role;
    } else {
      const url = this.router.url;
      const segments = url.split('/');
      role = segments[2]?.toLowerCase();
      if (role != '' && role != undefined) {
        this.currentUserRole = role;
      }
    }

    if (this.currentUserRole == 'club') {
      this.activeTab = 'club_history';
    } else if (this.currentUserRole == 'scout') {
      this.activeTab = 'scout_history';
    }
  }

  ngAfterViewInit() {
    const videoEl = this.videoElementRef.nativeElement;
    videoEl.autoplay = false;
  }

  getToolTips() {
    this.tooltipSubscription = this.tooltipService.getTooltip('profilePhoto').subscribe(tooltip => {
      this.profilePhotoTooltip = tooltip;
    });
    this.tooltipSubscription = this.tooltipService.getTooltip('addFavorite').subscribe(tooltip => {
      this.addFavorite = tooltip;
    });
    this.tooltipSubscription = this.tooltipService.getTooltip('removeFavorite').subscribe(tooltip => {
      this.removeFavorite = tooltip;
    });
    // this.tooltipSubscription = this.tooltipService.getTooltip('removeFavoriteConfirm').subscribe(tooltip => {
    //   this.translatedText = tooltip;
    // });
    this.tooltipSubscription = this.tooltipService.getTooltip('downloadPdf').subscribe(tooltip => {
      this.downloadPdf = tooltip;
    });
    this.tooltipSubscription = this.tooltipService.getTooltip('startConversation').subscribe(tooltip => {
      this.startConversation = tooltip;
    });
  }

  getUser(userId: any) {
    try {
      let params: any = {};
      params.lang = localStorage.getItem('lang_id');
      this.talentService.getUser(userId, params).subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {
          this.user = response.data.user_data;
          // console.info('this.user',this.user);
          let baseUrl = response.data.imagePath;
          this.baseUrl = baseUrl;
          if (this.loggedInUser?.role != '4') {
            this.isPremium = this.loggedInUser?.active_subscriptions?.premium.length > 0 ? true : false;
            console.info('loggedInUserArray',this.loggedInUser?.active_subscriptions?.premium.length)
          }
          if (this.loggedInUser?.active_subscriptions?.premium_talent && this.loggedInUser?.role == '4') {
            this.isPremium = this.loggedInUser?.active_subscriptions?.premium_talent.length > 0 ? true : false;
          }

          console.info('UserArrayFromAPi',this.loggedInUser,'andcurrentUserRole',this.currentUserRole)
      
          if (this.user.user_nationalities != undefined && this.user.user_nationalities != '') {
            this.userNationalities = JSON.parse(this.user.user_nationalities);
          }
          this.profileImage = baseUrl + this.user.meta.profile_image || this.profileImage;
          // this.profileImage = this.user.meta.profile_image_path || this.profileImage;
          if (this.user.meta.cover_image && this.user.meta.cover_image != '' && this.user.meta.cover_image != undefined) {
            this.coverImage = baseUrl + this.user.meta.cover_image || this.coverImage;
          }

          if (this.user?.scout_info) {
            this.scoutInfoDetails = JSON.parse(this.user?.scout_info);
          }
          // console.info(this.user);
          // if(this.user?.meta?.place_of_birth){
          //   this.getCountryFromPlaceOfBirth(this.user?.meta?.place_of_birth);
          // }

          // if (this.userNationalities?.length) {
          //   // Fetch flag details for each nationality
          //   this.userNationalities.forEach((nat:any, index:any) => {
          //     this.getCountry(nat.flag_path, index);
          //   });
          // }

          // Set isFavorite status based on user data or API response
          this.isFavorite = this.user.marked_favorite; // Assuming API returns this

          if (this.isPremium) {
            this.getHighlightsData(this.userId);
            this.getGalleryData(this.userId);
            // this.exportSingleUser(this.userId);
          }

        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  checkRole() {
    if (!this.loggedInUser.isRepresentator) {
      return true;
    }
    if (this.loggedInUser.permission === 'admin.view' || this.loggedInUser.permission === 'admin.edit') {
      return false;
    }
    return true;
  }

  getGalleryData(id: any) {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    try {
      this.talentService.getGalleryFiles(id, params).subscribe((response) => {
        if (response && response.status && response.data) {
          this.userImages = response.data.images;
          this.userVideos = response.data.videos;
          this.imageBaseUrl = response.data.file_path;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  }

  getHighlightsData(id: any) {

    let params: any = {};
    params.lang = localStorage.getItem('lang_id');

    try {
      this.talentService.getHighlightsFiles(id, params).subscribe((response) => {
        if (response && response.status && response.data && response.data.images) {
          this.highlights = response.data;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  }

  calculateAge(dob: string | Date): number {
    // console.info('BirthDate is ', dob);
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  switchTab(tab: string) {
    // this.activeTab = tab;
    if (this.activeTab === 'teams' && tab === 'teams') {
      this.teamsTabComponent?.backToTeamView();
    } else if (this.activeTab === 'sighting' && tab === 'sighting') {
      this.sightingComponent.backToSightings();
    }
    else {
      this.activeTab = tab;
    }
    // console.warn('Active tab is ', this.activeTab, ' and role is ', this.currentUserRole)
  }

  handleCoverImageData(data: string) {
    this.coverImage = data;
  }

  // Toggle favorite status
  toggleFavorite(userId: number) {
    if (this.isFavorite) {
      this.removeFromFavorites(userId);
    } else {
      this.addToFavorites(userId);
    }
  }

  addToFavorites(userId: number) {
    if (!this.checkRole()) {
      return;
    }

    let jsonData = localStorage.getItem("userData");
    let myUserId: any;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      myUserId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    try {
      this.userService.addFavoritesData(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.isFavorite = true; // Mark as favorite
          console.log(userId);
          this.getUser(userId);
          this.socketService.emit('addToFav', { senderId: myUserId, receiverId: userId });

        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }

  }

  removeFromFavorites(userId: number) {
    this.showMatDialog(this.translatedText, "remove-fav-confirmation", userId);
  }

  exportSingleUser(userId: number) {

    try {

      // Set loading state and display info toast
      this.toastr.info(this.downloading, this.pleaseWaitTxt, { disableTimeOut: true });

      this.userService.exportSingleUser(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          console.info('response', response.data);
          this.toastr.clear();

          this.downloadPath = response.data.file_path;
          // Open the file in a new tab
          // window.open(response.data.file_path);
          window.open(response.data.file_path, '_blank', 'noopener,noreferrer');

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


  getCountryFromPlaceOfBirth(placeOfBirth: string): void {
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
            this.getCountryFlag(country);
            console.log("Country found:", countryComponent);
          } else {
            console.error("Country not found in placeOfBirth.");
          }
        } else {
          console.error("Geocoding API error:", data.status, data.error_message);
        }
      })
      .catch(error => console.error("Error fetching geocoding data:", error));
  }

  getCountryFlag(countryCode: string): void {
    // Using Flagpedia API for flag images
    const flagUrl = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;

    // Set the URL to an <img> element in your template or save it in a variable
    // this.countryFlagUrl = flagUrl;
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


  navigateToChat() {
    localStorage.setItem('otherUserData', '');
    if (this.user.meta.profile_image != '' && this.user.meta.profile_image != undefined) {
      this.user.meta.profile_image = this.user.meta.profile_image;
    }
    const role = this.loggedInUser.role_name.toLowerCase();
    if (this.currentUserRole == 'club' || this.currentUserRole == 'klubb' || this.currentUserRole == 'klub' || this.currentUserRole == 'Clube' && this.user.club_logo != '' && this.user.club_logo != undefined) {
      this.user.meta.profile_image = this.user.club_logo;
    }

    if (typeof this.user.meta.profile_image === undefined) {
      this.user.meta.profile_image = 'no_img.png';
    }
    // console.log('this.user.this.user',this.user);
    // return;
    if (this.user) {

      const userData = {
        id: this.user.id,
        name: this.user.first_name + ' ' + this.user.last_name,
        email: this.user.email,
        photoUrl: this.baseUrl + this.user.meta.profile_image
      };

      console.log(userData, this.user);
      let tempUser = JSON.stringify(userData);

      localStorage.setItem('otherUserData', tempUser);
      // this.router.navigate([`/${role}/chat?open_chat=true`]);
      this.router.navigate([`/${role}/chat`], {
        queryParams: { open_chat: 'true' }
      });
    } else {
      console.warn('No userData available and this.user is ', this.user);
    }
  }

  navigateToPlans() {
    const role = this.loggedInUser.role_name.toLowerCase();
    this.router.navigate([`/${role}/plans`]);
  }

  ngOnDestroy() {
    // ✅ Unsubscribe to prevent memory leaks
    if (this.tooltipSubscription) {
      this.tooltipSubscription.unsubscribe();
    }
  }

  getToasterMsg() {
    this.translate.get(['pleaseWait', 'downloading', 'explore', 'removeFavoriteConfirm']).subscribe((res: any) => {
      this.pleaseWaitTxt = res['pleaseWait'];
      this.downloading = res['downloading'];
      this.pageTitle = res['explore'];
      this.translatedText = res['removeFavoriteConfirm'];
      this.titleService.setTitle(this.pageTitle);
    });
  }

  themeChanged() {
    let currentTheme = localStorage.getItem('theme');
    this.currentThemeMode = currentTheme;
    if (this.currentThemeMode == null || this.currentThemeMode == undefined) {
      this.currentThemeMode = 'light';
    }
  }


  setDurationAndThumbnailOld(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
    // Set Duration
    this.duration = this.formatDuration(videoElement.duration);
    // return this.duration;
    // Capture Thumbnail
    // this.captureThumbnail(videoElement);
  }
  videoDurations: string[] = [];
  setDurationAndThumbnail(videoElement: HTMLVideoElement, index: number) {
    videoElement.crossOrigin = 'anonymous';

    // Wait for metadata to load
    videoElement.addEventListener('loadedmetadata', () => {
      // Set duration
      const duration = videoElement.duration;
      this.duration = this.formatDuration(duration);
      // return this.duration;
      this.highlights.videos[index].duration = this.duration;
      this.videoDurations[index] = this.duration;
      // Optional: Capture thumbnail after video is loaded
      // this.captureThumbnail(videoElement);
    });
  }

  getVideoDuration(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
    let number = this.formatDuration(videoElement.duration); // output like this 0:54
    // if (typeof number === 'number' && !isNaN(number)) {
    return number;
    // }
    // return '';
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

  showDeleteConfirmation(userId: any) {
    let idsToDelete = [userId];
    let params = { id: userId };
    try {
      this.userService.removeSingleFavorite(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.isFavorite = false; // Mark as not favorite
          this.getUser(userId);
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  // 

  showMatDialog(message: string, action: string, userId: any) {
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
          this.showDeleteConfirmation(userId);
        }
      }
    });
  }


  naviGateScoutProfile(id: string | number): void {
    this.router.navigate(['view', 'scout', id]);
  }

  getSanitizedUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
  }


}

