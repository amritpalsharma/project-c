import { Component, ViewChild, ElementRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdvertisementService } from '../../../services/advertisement.service';
import { WebPages } from '../../../services/webpages.service';
import { SharedService } from '../../../services/shared.service';
import { AuthService } from '../../../services/auth.service';

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
  @ViewChild('owlCarousel') owlCarousel!: ElementRef;
  fallbackImage: string = 'assets/images/1.jpg'; // Path to your fallback image

  selectedLangId:any = null;
  pageDetail:any=null;
  sliderDetail:any=null;
  advertisemnetData:any=null;
  imageBaseUrl:string= '';
  banner_img:string= '';
  banner_bg_img:string= '';
  hero_bg_img:string= '';
  advertisemnet_base_url:string= '';
  isUserLoggedIn: boolean = false;
  club_logo_path:string='';
  pre_club_logo_path:string='';
  players = [
    { name: 'Ronaldinho Gaúcho', image: './assets/images/Ronaldinho Gaúcho.svg', year: '2004' },
    { name: 'Ziddane', image: './assets/images/ziddane.svg', year: '2004' },
    { name: 'FC Thun', image: './assets/images/FC Thun 1.svg', year: '2004' },
    { name: 'Gabriel Jesus', image: './assets/images/Gabriel Jesus.svg', year: '2004' },
    { name: 'Eütoile Carouge FC', image: './assets/images/Eütoile Carouge FC..png', year: '2004' },
    { name: 'Harry Kane', image: './assets/images/Harry Kane.svg', year: '2004' },
    { name: 'Messi', image: './assets/images/Messi.svg', year: '2004' }
  ];


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
        items: 7
      }
    }
  };

  // Default selected content and category
  selectedContent: string = 'Sign-up & Profile Creation';
  selectedCategory: string = 'Talent'; // Default to Talent

  // Manage Navbar Expansion
  isNavbarExpanded = false;

  constructor( private shareservice:SharedService,private advertisementService: AdvertisementService, private webPages: WebPages, private authService: AuthService,) {
   
  }

 
  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.fallbackImage;
  }
  toggleNavbar(): void {
    this.isNavbarExpanded = !this.isNavbarExpanded;
  }

  // // Method to set the selected content
  // showContent(content: string): void {
  //   this.selectedContent = content;
  // }

  // Method to check if content is active
  isActive(content: string): boolean {
    return this.selectedContent === content;
  }

  // Method to set the selected category and reset content
  showCategory(category: string): void {
    this.selectedCategory = category;
    this.resetContentForCategory(category);
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
  }

  adVisible: boolean[] = [true, true, true, true, true]; // Array to manage ad visibility

  ngOnInit() {
    // Initially, all ads are visible
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.adVisible = [true, true, true, true, true];
    this.webPages.languageId$.subscribe((data) => {
      this.getPageDynamicData(data);
    });
  }


  closeAd(object: any) {

    switch(object){
      case 'skyscraper':
          this.advertisemnetData.skyscraper = [];
          break;
      case 'wide_skyscraper':
          this.advertisemnetData.wide_skyscraper = [];
          break;
      case 'leaderboard':
          this.advertisemnetData.leaderboard = [];
          break;
      case 'large_leaderboard':
          this.advertisemnetData.large_leaderboard = [];
          break;
      case 'small_square':
          this.advertisemnetData.small_square = [];
          break;
      default:
          //when no case is matched, this block will be executed;
          break;  //optional
      }

  }

  isEmptyObject(obj:any) {
    return (obj && (Object.keys(obj).length === 0));
  }
  getPageDynamicData(languageId:any){

    this.webPages.getDynamicHomePage(languageId).subscribe((res) => {
      let pageData = res.data.pageData;
      let sliderData = res.data.sliderData;
      if(res.status){
          this.pageDetail = pageData;
          this.banner_img =  res.data.base_url + pageData.banner_img;
          this.banner_bg_img =  res.data.base_url + pageData.banner_bg_img;
          this.hero_bg_img =  res.data.base_url + pageData.hero_bg_img;

          this.sliderDetail = sliderData;
          this.club_logo_path = this.sliderDetail.imagePath;
          this.pre_club_logo_path = this.sliderDetail.flagPath;
          this.advertisemnetData = res.data.advertisemnetData;
          this.advertisemnetData = [];
          
          console.log('advertisemnetData',this.advertisemnetData);
          this.imageBaseUrl = res.data.base_url;
          this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        }
    });
  }

  getFlagImage(data:any){
    let parseData = JSON.parse(data);
    // console.log(parseData, 'parse-data');
  }

  getBirthYear(date:any){
    if(date){
      const birthYear = new Date(date); // Convert to Date object
      return birthYear.getFullYear();
    }
    return 'N/A';
  }

}
