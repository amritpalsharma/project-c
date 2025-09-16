import { Component, ViewChild, ElementRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdvertisementService } from '../../../services/advertisement.service';
import { WebPages } from '../../../services/webpages.service';
import { SharedService } from '../../../services/shared.service';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { isNumber } from 'util';
import { Subject, takeUntil } from 'rxjs';

declare var bootstrap: any; // Declare bootstrap

export interface ClubMember {
  name: string;
  image: string;
  dob: string;
  cornerImage?: string;
  imageClass?: string; // Class for the main image
  cornerImageClass?: string; // Class for the corner image

}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }), // Start from above
        animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })) // Fade in and slide down to original position
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0, transform: 'translateY(20px)' })) // Fade out and slide up
      ])
    ]),

    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Start with opacity 0
        animate('500ms ease-in', style({ opacity: 1 })) // Fade in without moving
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })) // Fade out
      ])
    ]),

    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Start with opacity 0
        animate('500ms ease-in', style({ opacity: 1 })) // Fade in to full opacity
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })) // Fade out
      ])
    ]),

    trigger('rotateIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Start with opacity 0
        animate('500ms ease-in', style({ opacity: 1 })) // Fade in to full opacity
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })) // Fade out
      ])
    ])
  ]
})
export class IndexComponent {
  isPageLoaded: boolean = false;
  @ViewChild('owlCarousel') owlCarousel!: ElementRef;

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  fallbackImage: string = 'assets/images/1.png'; // Path to your fallback image
  currentTheme: string = localStorage.getItem('theme') || 'light';
  selectedLangId: any = null;
  pageDetail: any = null;
  sliderDetail: any = null;
  // advertisementData:any=null;
  advertisementList: any = null;
  imageBaseUrl: string = '';
  flagPath: string = 'https://api.socceryou.ch/uploads/logos/';
  banner_img: string = '';
  banner_img_dark_mode: string = '';
  banner_bg_img: string = '';
  hero_bg_img_dark_mode: string = 'assets/images/home/hero_bg_img_dark_mode.png';
  hero_bg_img: string = 'assets/images/home/hero_bg_img_light_mode.png';
  advertisemnet_base_url: string = '';
  advertisemnet_new_base_url: string = '';
  // isUserLoggedIn: boolean = false;
  club_logo_path: string = '';
  pre_club_logo_path: string = '';
  heroSectionBgImage: string = '';

  currentSelected: number = 1;


  isLoading: boolean = true;
  btnLoading: boolean = false; // by default true
  countdown: number = 10;
  talentBtnImage: string = 'assets/images/home/talent/1_light.png';


  players = [
    { name: 'Ronaldinho Gaúcho', image: './assets/images/Ronaldinho Gaúcho.svg', year: '2004' },
    { name: 'Ziddane', image: './assets/images/ziddane.svg', year: '2004' },
    { name: 'FC Thun', image: './assets/images/FC Thun 1.svg', year: '2004' },
    { name: 'Gabriel Jesus', image: './assets/images/Gabriel Jesus.svg', year: '2004' },
    { name: 'Eütoile Carouge FC', image: './assets/images/Eütoile Carouge FC..png', year: '2004' },
    { name: 'Harry Kane', image: './assets/images/Harry Kane.svg', year: '2004' },
    { name: 'Messi', image: './assets/images/Messi.svg', year: '2004' }
  ];

  isActive: any = {
    skyscraper: true,
    wide_skyscraper: true,
    leaderboard: true,
    large_leaderboard: true,
    banner: true,
    square: true,
    small_square: true,
    large_rectangle: true,
    inline_rectangle: true,
  }

  advertisementData: any = {
    skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    wide_skyscraper: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_leaderboard: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    banner: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    small_square: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    large_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
    inline_rectangle: {
      id: '1',
      featured_image: "leaderboard.png"
    },
  }


  // Initialize the array of club members
  clubMembers: ClubMember[] = [
    {
      name: 'Ziddane',
      image: './assets/images/network-ziddae.svg',
      dob: '2003',
      cornerImage: './assets/images/Navy.svg',
      imageClass: 'ziddane-image',
      cornerImageClass: 'navy-corner'
    },
    {
      name: 'FC Thun',
      image: './assets/images/FC Thun 1.svg',
      dob: '',
      imageClass: 'fc-thun-image'
    },
    {
      name: 'Ronaldinho Gaúcho',
      image: './assets/images/Ronaldinho Gaúcho.svg',
      dob: '2004',
      cornerImage: './assets/images/SC Bru╠êhl SG.svg.svg',
      imageClass: 'ronaldinho-image',
      cornerImageClass: 'sc-bruehl-corner'
    },
    {
      name: 'FC Rapperswil Jona',
      image: './assets/images/fussball.svg',
      dob: '',
      imageClass: 'fc-rapperswil-image'
    },
    {
      name: 'Jamie Vardy',
      image: './assets/images/jammie.svg',
      dob: '2003',
      cornerImage: './assets/images/FC Wil.svg',
      imageClass: 'jamie-vardy-image',
      cornerImageClass: 'fc-wil-corner'
    },
    {
      name: 'Eütoile Carouge FC',
      image: './assets/images/E╠ütoile Carouge FC..png',
      dob: '',
      imageClass: 'eutoile-image'
    },
    {
      name: 'Mohamed Salah',
      image: './assets/images/mohamad.svg',
      dob: '2003',
      cornerImage: './assets/images/FC Thun 1.svg',
      imageClass: 'mohamed-image',
      cornerImageClass: 'fc-thun-corner'
    }
  ];

  // Owl Carousel options
  customOptions: OwlOptions = {
    loop: true,
    margin: 10,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplaySpeed: 500,
    navSpeed: 500,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      600: {
        items: 3
      },
      840: {
        items: 4
      },
      1200: {
        items: 5
      },
      1400: {
        items: 5
      }
    }
  };

  // Default selected content and category
  selectedContent: string = 'Sign-up & Profile Creation';
  selectedCategory: string = 'Talent'; // Default to Talent

  // Manage Navbar Expansion
  isNavbarExpanded = false;


  // DashBoard MobilE
  isUserLoggedIn: boolean = false;
  LoggedInUserDashboardLink: string = '';

  constructor(private shareservice: SharedService, private advertisementService: AdvertisementService, private webPages: WebPages, private authService: AuthService, private themeService: ThemeService, private globalSettings: GlobalSettingsService) {

  }


  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.fallbackImage;
  }
  toggleNavbar(): void {
    this.isNavbarExpanded = !this.isNavbarExpanded;
  }


  // Method to check if content is active
  isActive2(content: string): boolean {
    return this.selectedContent === content;
  }

  // Method to set the selected category and reset content
  showCategory(category: string): void {
    this.selectedCategory = category;
    this.resetContentForCategory(category);
    this.showContent(this.selectedContent);
  }

  // Reset content based on selected category
  private resetContentForCategory(category: string): void {
    if (category === 'Talent') {
      this.selectedContent = 'Sign-up & Profile Creation';
    } else if (category === 'Clubs & Scouts') {
      this.selectedContent = 'Sign-up & Profile Creation'; // Default content for Clubs & Scouts
    }
  }

  // Event handlers for mouse enter and leave
  onMouseEnter() {
    this.owlCarousel.nativeElement.classList.add('stop-autoplay');
  }

  onMouseLeave() {
    this.owlCarousel.nativeElement.classList.remove('stop-autoplay');
  }

  onTouchStart() {
    this.onMouseEnter(); // Stop autoplay on touch start
  }

  onTouchEnd() {
    this.onMouseLeave(); // Resume autoplay on touch end
  }


  showContent(content: string): void {
    this.selectedContent = content;
    let currentNumber = 0;

    if (content == 'Sign-up & Profile Creation') {
      currentNumber = 1;
    } else if (content == 'Networking & Opportunity') {
      currentNumber = 2;
    } else if (content == 'Success & Progression') {
      currentNumber = 3;
    }

    this.currentSelected = currentNumber;
  }

  adVisible: boolean[] = [true, true, true, true, true]; // Array to manage ad visibility
  currentLang: string = localStorage.getItem('lang') || this.globalSettings.getLanguage();

  ngOnInit() {
    this.getLangslugByID(this.currentLang);
    this.globalSettings.indexFunctionCall$.subscribe((data) => {
      console.log('Global Settings IndexFunction Call');
      this.indexFunction(); // Call the function when event is received
    });
    // Initially, all ads are visible
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.adVisible = [true, true, true, true, true];
    // alert(localStorage.getItem('lang'));
    // this.webPages.languageId$.subscribe((data) => {
    //   // if(confirm('theme is '+this.currentTheme)){
    //   this.getPageDynamicData(data);
    //   this.getLangslugByID(data);
    //   // this.showContent(this.selectedContent);
    // });
    this.webPages.languageId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.getPageDynamicData(data); // ✅ This will stop running after component is destroyed
        this.getLangslugByID(data); // ✅ This will stop running after component is destroyed
      });

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.showContent(this.selectedContent);
    });
    // let selectedLang = localStorage.getItem('lang');
    this.LoggedInUserDashboardLink = this.authService.getDashboardLink();
    // console.warn('In Index component LocalStorage Language selected = ' + selectedLang)
  }

  destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeAd(object: any) {
    console.log(object);

    this.isActive[object] = false;

  }



  isEmptyObject(obj: any) {
    if (typeof obj != 'undefined') {
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
  }

  getPageDynamicData(languageId: any) {

    this.webPages.getDynamicHomePage(languageId).subscribe((res) => {
      let pageData = res.data.pageData;
      let sliderData = res.data.sliderData;
      if (res.status) {
        this.pageDetail = pageData;
        this.banner_img = res.data.base_url + pageData.banner_img;
        this.banner_img_dark_mode = res.data.base_url + pageData.banner_img_dark_mode;
        this.banner_bg_img = res.data.base_url + pageData.banner_bg_img;
        this.sliderDetail = sliderData;
        if (sliderData.totalCount < 6) {
          for (let i = sliderData.totalCount; i < 7; i++) {
            this.sliderDetail.users.push(
              {
                isPlaceholder: true, role_name: 'talent', first_name: 'lorem', last_name: 'ipusam',
                user_nationalities: [],
                meta: { profile_image_path: this.fallbackImage, date_of_birth: '04-01-2002' }
              });
          }
          console.warn('placeholders ', this.sliderDetail.users);
        } else {
          console.warn('Slider is greater than 6');
        }
        this.club_logo_path = this.sliderDetail.imagePath;
        this.pre_club_logo_path = this.sliderDetail.flagPath;

        console.log("data is here", res.data.advertisementData, res.data.advertisemnet_base_url)

        this.advertisementData = res.data.advertisementData;
        this.advertisementList = res.data.allAdsList;
        this.imageBaseUrl = res.data.base_url;
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisemnet_new_base_url = res.data.advertisemnet_new_base_url;

        this.isLoading = false;

        this.startCountdown();


      }
    });
  }

  startCountdown() {
    this.countdown = 5; // Reset countdown
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.btnLoading = false; // Stop loading when countdown reaches 0
      }
    }, 1000);
  }

  getFlagImage(data: any) {
    let parseData = JSON.parse(data);
    // console.log(parseData, 'parse-data');
  }


  getBirthYear(date: any) {
    if (date) {
      const birthYear = new Date(date); // Convert to Date object
      return birthYear.getFullYear();
    }
    return 0;
  }

  chnageHerosectionBgImg() {
    //  alert('theme chnaged');
    console.log('Index Page theme updated');
  }

  checkActive(obj: any) {
    if (this.isExists(obj) && this.isFeaturedImageExists(obj) && this.isActive[obj]) {
      // console.log('working true', this.advertisementData, this.advertisemnet_base_url)
      return true;
    }
    return false;
  }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || this.advertisementList.includes(key);
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }
  showRegisterModal() {
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal1'));
    console.info('registerModal', registerModal);
    if (registerModal) {
      registerModal.toggle();
    }
  }

  indexFunction() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    // this.currentHomeTheme = localStorage.getItem('theme') + '';
  }

  showImage(clicked: any) {

  }

  ngAfterViewInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const videoEl = this.heroVideo.nativeElement;

    // 🔐 Ensure it's muted in code too
    videoEl.muted = true;

    const tryPlay = () => {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video autoplayed successfully.');
          })
          .catch((error) => {
            console.warn('Autoplay failed:', error);
          });
      }
    };

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        videoEl.load();
        tryPlay();
        io.disconnect();
      }
    });

    io.observe(videoEl);

    // new code by amrit to play ads 

    // Run immediately after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      const adVideos = document.querySelectorAll('.auto-play-video');
      console.info('adVideos found:', adVideos.length);

      if (adVideos.length === 0) {
        console.warn('No advertisement videos found!');
        return;
      }

      adVideos.forEach((adVideoEl: Element) => {
        const video = adVideoEl as HTMLVideoElement;

        // Force attributes for autoplay compatibility
        video.muted = true;
        video.setAttribute('muted', 'true');
        video.setAttribute('playsinline', 'true'); // iOS Safari requirement
        video.setAttribute('preload', 'auto');     // Helps instant playback
        video.setAttribute('autoplay', '');     // Helps instant playback
        video.setAttribute('loop', '');     // Helps instant playback

        // Function to safely attempt autoplay
        const tryPlayAd = () => {
          video.muted = true; // Re-enforce mute (some browsers unmute)
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log('Advertisement video autoplayed successfully.'))
              .catch((error) => console.warn('Autoplay failed for advertisement:', error));
          }
        };

        // IntersectionObserver → play when visible
        const adVideoIo = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            video.load();  // Reload fresh
            tryPlayAd();
            adVideoIo.disconnect(); // Only need to trigger once
          }
        });

        adVideoIo.observe(video);

        // Restart if user/browser pauses it
        video.addEventListener('pause', () => {
          console.log('Video paused, restarting...');
          tryPlayAd();
        });

        // Auto replay when ended
        video.addEventListener('ended', () => {
          console.log('Video ended, restarting...');
          video.currentTime = 0; // Reset to beginning
          tryPlayAd();
        });
      });
    });


  }

  getLangslugByID(langID: any) {
    let slug = 'en';
    if (langID == 1) {
      slug = 'en';
    } else if (langID == 2) {
      slug = 'de';
    } else if (langID == 3) {
      slug = 'it';
    } else if (langID == 4) {
      slug = 'fr';
    } else if (langID == 5) {
      slug = 'es';
    } else if (langID == 6) {
      slug = 'pt';
    } else if (langID == 7) {
      slug = 'dk';
    } else if (langID == 8) {
      slug = 'sv';
    }
    if (!isNaN(Number(langID))) {
      this.currentLang = slug;
      console.info('set in index this.currentLang', this.currentLang);
    }
    return slug;
  }

  getFirstFlag(userNationalities: any): string | null {
    if (userNationalities && userNationalities.length > 0) {
      const parsedNationalities = JSON.parse(userNationalities);
      return parsedNationalities.length > 0 ? parsedNationalities[0].flag_path : null;
    } else {
      return null;
    }
  }
}
