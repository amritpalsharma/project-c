import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TalentService } from '../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket.service';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { WebPages } from '../../../services/webpages.service';
import { TalentModule } from '../../talent/talent.module'; 
@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent implements OnInit {
  loggedInUser: any = localStorage.getItem('userInfo');
  activeTab: string = 'profile';
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
  countryFlagUrl: any;
  
  @Output() dataEmitter = new EventEmitter<string>();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private talentService: TalentService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,
    private socketService: SocketService,
    private webPages: WebPages
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getUser(this.userId);
      this.activeTab = 'profile';
    });

    if (this.coverImage == '') {
      this.coverImage = this.defaultCoverImage;
    }

    this.webPages.languageId$.subscribe((data) => {
      this.getUser(this.userId);
    });
  }

  getUser(userId: any) {
    try {
      let params: any = {};
      params.lang = localStorage.getItem('lang_id');
      this.talentService.getUser(userId, params).subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {
          this.user = response.data.user_data;
          this.isPremium = this.loggedInUser?.active_subscriptions?.premium.length > 0 ? true : false;
          this.userNationalities = JSON.parse(this.user.user_nationalities);
          this.profileImage = this.user.meta.profile_image_path || this.profileImage;
          this.coverImage = this.user.meta.cover_image_path || this.coverImage;
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
    this.activeTab = tab;
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
    // alert(userId)
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

  exportSingleUser(userId: number) {

    try {

      // Set loading state and display info toast
      this.toastr.info('Downloading...', 'Please wait', { disableTimeOut: true });

      this.userService.exportSingleUser(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.toastr.clear();

          this.downloadPath = response.data.file_path;
          // Open the file in a new tab
          window.open(response.data.file_path);

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
    this.countryFlagUrl = flagUrl;
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

}
