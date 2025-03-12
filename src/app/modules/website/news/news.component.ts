import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';

interface NewsData {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  featured_image: string;
}

interface SliderImage {
  featured_image: string;
  title: string;
  date: string;
  buttonText: string;
  slug: string;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {
  currentImageIndex: number = 0;
  banner_title: string = '';
  news_title: string = '';
  slider_title: string = '';
  slider_date: string = '';
  slider_btn_txt: string = '';
  news_img_path: string = '';
  latestNewsData: NewsData[] = [];
  intervalId: any;
  touchStartX: number = 0;
  // advertisementData: any;
  advertisemnet_base_url: string = '';
  base_url: string = 'https://api.socceryou.ch/uploads/';
  adVisible: boolean[] = [true, true, true, true, true];

  isLoading: boolean = true;


  images: SliderImage[] = [
   
  ];

  constructor(private webPages: WebPages) { }

  ngOnInit() {
    this.startAutoplay();
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data);
    }, error => {
      console.error('Error fetching language data', error);
    });
  }

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

  ngOnDestroy() {
    this.stopAutoplay();
  }

  getPageData(languageId: any) {
    this.webPages.getDynamicContentPage('news', languageId).subscribe((res) => {
      if (res.status) {
        this.advertisementData = res.data.advertisementData;
        this.advertisementData = [];

        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.slider_title = res.data.pageData.slider_title;
        this.banner_title = res.data.pageData.banner_title;

        this.news_title = res.data.pageData.news_title;
        this.latestNewsData = res.data.newsSliderData;
        console.log(this.latestNewsData);
        this.news_img_path = res.data.news_img_path;
        this.slider_btn_txt = res.data.pageData.slider_btn_txt;
        this.slider_date = res.data.pageData.slider_date;

        this.isLoading = false;

        // this.images = res.data.newsSliderData || this.images;
        // this.base_url = res.data.base_url;
        this.addThreeElements(this.latestNewsData);
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisementData = res?.data?.advertisementData;
      }
    }, error => {
      console.error('Error fetching dynamic page data', error);
    });
  }

  changeImage(imageSrc: string, index: number) {
    this.currentImageIndex = index;
    this.resetAutoplay();
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  previousImage() {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  startAutoplay() {
    this.intervalId = setInterval(() => this.nextImage(), 3000);
  }

  stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const touchEndX = event.touches[0].clientX;
    const deltaX = touchEndX - this.touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.previousImage(); // Swipe right
      } else {
        this.nextImage(); // Swipe left
      }
      this.resetAutoplay();
      this.touchStartX = touchEndX;
    }
  }

  onTouchEnd(event: TouchEvent) {
    // Optional: Logic for touch end can be added here if needed
  }

  // closeAd(object: any) {

  //   switch(object){
  //     case 'skyscraper':
  //         this.advertisementData.skyscraper = [];
  //         break;
  //     case 'small_square':
  //         this.advertisementData.small_square = [];
  //         break;
  //     case 'leaderboard':
  //         this.advertisementData.leaderboard = [];
  //         break;
  //     case 'large_leaderboard':
  //         this.advertisementData.large_leaderboard = [];
  //         break;
  //     case 'large_rectangle':
  //         this.advertisementData.large_rectangle = [];
  //         break;

  //     case 'inline_rectangle':
  //         this.advertisementData.inline_rectangle = [];
  //         break;
  //     case 'square':
  //         this.advertisementData.square = [];
  //         break;
  //     default:
  //         //when no case is matched, this block will be executed;
  //         break;  //optional
  //     }

  // }

  get currentImage() {
    return this.images[this.currentImageIndex].featured_image;
  }

  getRouterLink(index: any): string {
    // Returns a dynamic URL based on the slider index
    return '/news/' + index;
  }
  // isEmptyObject(obj:any) {
  //   if(typeof obj != 'undefined'){
  //     return (obj && (Object.keys(obj).length === 0));
  //   }
  //   return true;
  // }


  closeAd(object: any) {

    this.isActive[object] = false;

  }

  // checkActive(obj: any){
  //   if(this.isExists(obj) && this.isActive[obj]){
  //     return true;
  //   }
  //   return false;
  // }

  // isExists(key: string): boolean {
  //   return key in this.advertisementData && 'featured_image' in this.advertisementData[key];
  // }


  isEmptyObject(obj: any) {
    if (typeof obj != 'undefined') {
      return (obj && (Object.keys(obj).length === 0));
    }
    return true;
  }
  openModal(modalId: string) {
    console.log(`Open modal: ${modalId}`);
    // Implement modal opening logic here
  }

  checkActive(obj: any) {
    if (this.isExists(obj) && this.isFeaturedImageExists(obj) && this.isActive[obj]) {
      return true;
    }
    return false;
  }

  isExists(key: any): boolean {
    return key in this.advertisementData;
  }

  isFeaturedImageExists(key: any): boolean {
    return 'featured_image' in this.advertisementData[key];
  }

  addThreeElements(originalArray:any) {
    let selectedItems = originalArray.slice(0, 3); // Get first 3 elements
    this.images.push(...selectedItems); // Push to target array
    console.warn(this.images)
  }

}
