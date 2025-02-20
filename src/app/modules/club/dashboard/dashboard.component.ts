import { Component, OnInit ,EventEmitter, Output, OnDestroy} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { EditPersonalDetailsComponent } from '../edit-personal-details/edit-personal-details.component';
import { EditHighlightsComponent } from '../tabs/edit-highlights/edit-highlights.component';
import { DeletePopupComponent } from '../delete-popup/delete-popup.component';
import { TalentService } from '../../../services/talent.service';
import { ToastrService } from 'ngx-toastr';
import introJs from 'intro.js';
import 'intro.js/introjs.css'; // Import the styles for Intro.js
import { Lightbox } from 'ngx-lightbox';
import { LightboxDialogComponent } from '../lightbox-dialog/lightbox-dialog.component';
import { Subscription } from 'rxjs';
import { ScoutService } from '../../../services/scout.service';
import { environment } from '../../../../environments/environment';
import { CommonDataService } from '../../../services/common-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit , OnDestroy {
  lightboxIsOpen: boolean = false; // Track the state of the lightbox
  mainImage: { src: string } = { src: '' }; // Current main image source
  album: any[] = []; // Array for album images
  loggedInUser:any = localStorage.getItem('userData');
  countryFlagUrl : any;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private talentService: ScoutService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,
    private lightbox: Lightbox,
    private commonDataService: CommonDataService
  ) { }
  activeTab: string = 'profile';
  userId: any ;
  user: any = {};
  userNationalities: any = [];
  coverImage: any ;
  profileImage: any ;
  selectedFile : any;
  teams : any;
  highlights : any;
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl : any;
  defaultCoverImage:any = "./media/palyers.png";
  premium : any = false;
  booster : any = false;
  activeDomains : any;
  countries :  any;
  isPremium: any = false;
  StartTour: boolean = true;
  @Output() dataEmitter = new EventEmitter<string>();
  private routeSubscription: Subscription | null = null; // Initialize with null
  private introInstance: any; // Reference to the Intro.js instance

  loading: boolean = true;  // Add this line to track loading state

  async ngOnInit() {
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

    await this.getAllTeams();

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

  startIntroTour() {

    this.introInstance.setOptions({
      steps: [
        {
          element: '.edit-profile',
          intro: `<div><h6>Profile Photo</h6>Upload your best headshot.</div>`,
          tooltipClass: 'custom-tooltip',
        },
        {
          element: '.tour-personal-details',
          intro: `<div><h6>Personal Details</h6>Add your personal details here.</div>`,
          tooltipClass: 'custom-tooltip',
        },
        {
          element: '.tour-highlights',
          intro: `<div><h6>Highlights</h6>Upload photos and videos to highlight on your profile.</div>`,
          tooltipClass: 'custom-tooltip',
        },
        {
          element: '.tour-cover-photo',
          intro: `<div><h6>Cover Photo</h6>Upload your cover photo.</div>`,
          tooltipClass: 'custom-tooltip',
        },
        {
          element: '.tour-general-details',
          intro: `<div><h6>General Details</h6>Add your other profile details here.</div>`,
          tooltipClass: 'custom-tooltip',
        },
      ],
      showBullets: false,
      showProgress: false,
      scrollToElement: true,
      prevLabel: 'Previous',
      nextLabel: 'Next',
      doneLabel: 'Finish',
      tooltipPosition: 'auto',
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
              Don't show it again
            </label>
          `;

          // Append "close-section" outside the <h1> but inside the header
          tooltipHeader.appendChild(closeSection);

          // Add event listener to the checkbox
          const checkbox = closeSection.querySelector('#dontShowAgain') as HTMLInputElement;
          if (checkbox) {
            checkbox.addEventListener('click', (event) => {
              event.stopPropagation(); // Ensure clicks do not propagate
              console.log('Checkbox clicked:', checkbox.checked);
              if (checkbox.checked) {
                console.log('User selected "Don’t show it again"');
                // Save the user's preference
                localStorage.setItem('dontShowIntroTour', 'true');
              } else {
                console.log('User unchecked "Don’t show it again"');
                localStorage.removeItem('dontShowIntroTour');
              }
            });
          }
        }
      }
    });

    // Handle when the tour finishes
    this.introInstance.oncomplete(() => this.handleTourExit());

    // Handle when the tour is exited manually
    // introInstance.onexit(() => this.handleTourExit());

    this.introInstance.start();
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
    try {
      this.talentService.getGalleryData().subscribe((response) => {
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

    try {
      this.talentService.getProfileData(userId).subscribe((response) => {
        if (response && response.status && response.data && response.data.user_data) {
          localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));

          this.user = response.data.user_data;
          this.userNationalities = JSON.parse(this.user.user_nationalities);
          this.StartTour = this.user?.show_tour == 1 ? true : false;

          this.isPremium = this.user?.active_subscriptions?.premium.length > 0 ? true : true;
          this.premium = this.user.active_subscriptions?.premium?.length > 0 ? true : false;
          this.booster = this.user.active_subscriptions?.booster?.length > 0 ? true : false;
          this.activeDomains = this.user.active_subscriptions?.country?.length > 0 ? true : false;

          if (this.user?.meta?.profile_image_path) {
            this.profileImage = this.user.meta.profile_image_path;
            this.commonDataService.updateProfilePic(this.profileImage);
          }
          if (this.user?.meta?.cover_image_path) {
            this.coverImage = this.user.meta.cover_image_path;
          }

        }

        this.loading = false;  // Set loading to false once data is loaded
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      this.loading = false;  // Set loading to false on error
    }
  }

  getCountry(placeOfBirth: string ,key : any): void {
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
    return this.talentService.getCountries().subscribe(
      (response) => {
        if (response && response.status) {
          this.countries = response.data.countries;
        }
    });
  }

  openEditDialog() {
    console.log(this.user)
    const dialogRef = this.dialog.open(EditPersonalDetailsComponent, {
      width: '800px',
      data: {user : this.user , countries : this.countries}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
    		this.getUserProfile(this.userId);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  openHighlight() {

    const dialogRef = this.dialog.open(EditHighlightsComponent, {
      width: '800px',
      data: {
          images: this.userImages ,
          videos: this.userVideos ,
          url: this.imageBaseUrl
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getHighlightsData()
    });

  }

  getHighlightsData(){
    try {
      this.talentService.getHighlightsData().subscribe((response)=>{
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
    this.album = this.highlights.images.map((image: any)=> ({
      src: this.highlights.file_path + image.file_name,
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


  getCoverImg(){
    try {
      this.talentService.getCoverImg().subscribe((response)=>{
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
      this.toastr.info('Uploading profile image...', 'Please wait', { disableTimeOut: true });

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

              this.toastr.success('Profile image uploaded successfully!', 'Success');
            } else {
              this.toastr.clear();
              this.toastr.error('Failed to upload profile image. Please try again.', 'Upload Failed');
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
      this.toastr.info('Uploading cover image...', 'Please wait', { disableTimeOut: true });

      try {
        const formData = new FormData();
        formData.append("cover_image", this.selectedFile);

        this.talentService.uploadCoverImage(formData).subscribe(
          (response) => {
            if (response && response.status) {
              this.coverImage = `${environment.url}uploads/${response.data.uploaded_fileinfo}`;
              this.dataEmitter.emit(this.coverImage);  // Emit updated cover image
              this.toastr.clear();
              this.toastr.success('Cover image uploaded successfully!', 'Success');
            } else {
              this.toastr.clear();
              this.toastr.error('Failed to upload cover image. Please try again.', 'Upload Failed');
              console.error('Invalid API response structure:', response);
            }
          },
          (error) => {
              this.toastr.clear();
            this.toastr.error('An error occurred during upload. Please try again.', 'Upload Error');
            console.error('Error uploading cover image:', error);
          },
        );
      } catch (error) {
              this.toastr.clear();
        this.toastr.error('An unexpected error occurred. Please try again.', 'Upload Error');
        console.error('Error during cover image upload:', error);
      }
    }
  }

  deleteCoverImage(): void {
    // Set loading state and display info toast
    this.toastr.info('Deleting cover image...', 'Please wait', { disableTimeOut: true });

    try {
      this.talentService.deleteCoverImage().subscribe(
        (response) => {
          if (response && response.status) {
            this.coverImage = null;  // Indicates no value is set
            this.dataEmitter.emit('');  // Emit empty string to indicate deletion
              this.toastr.clear();
            this.toastr.success('Cover image deleted successfully.', 'Success');
          } else {
              this.toastr.clear();
            this.toastr.error('Failed to delete cover image. Please try again.', 'Delete Failed');
            console.error('Invalid API response structure:', response);
          }
        },
        (error) => {
              this.toastr.clear();
          this.toastr.error('An error occurred during deletion. Please try again.', 'Delete Error');
          console.error('Error deleting cover image:', error);
        },
      );
    } catch (error) {
              this.toastr.clear();
      this.toastr.error('An unexpected error occurred. Please try again.', 'Delete Error');
      console.error('Error during cover image deletion:', error);
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
        this.toastr.info('Cover image deletion canceled.', 'Canceled');
        console.log('User canceled the delete');
      }
    });
  }

  showMatDialog(message:string, action:string){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deleteUser();
        }
      }
    });
  }

  getAllTeams(){
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

    return age;
  }

  switchTab(tab: string){
    if(!this.isPremium){
      this.activeTab = 'profile';
    }
    this.activeTab = tab;
  }

  deleteUser(){
    let langId = localStorage.getItem('lang_id');
    this.userService.deleteUser([this.userId], langId).subscribe(
      response => {
        this.showMatDialog('User deleted successfully!', 'display');
        this.router.navigate(['/club/dashboard']);
      },
      error => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }

  handleCoverImageData(data: string) {
    this.coverImage = data; // Assign the received data to a variable
    console.log('Data received from child:', data);
  }

}