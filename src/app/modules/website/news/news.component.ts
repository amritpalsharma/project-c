import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { WebPages } from '../../../services/webpages.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ssrDebug } from '../../../services/ssr-debug';
import { Title, Meta } from '@angular/platform-browser';

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
  bannerImg: string = '';
  // advertisementData: any;
  advertisemnet_base_url: string = '';
  advertisemnet_new_base_url: string = '';
  base_url: string = 'https://api.socceryou.ch/uploads/';
  base_url2: string = '';
  adVisible: boolean[] = [true, true, true, true, true];
  DataFound: boolean = false;

  isLoading: boolean = true;
  btnLoading: boolean = false;
  countdown: number = 10;


  images: SliderImage[] = [

  ];

  constructor(private webPages: WebPages,
    @Inject(PLATFORM_ID) private platformId: Object,
    private metaService: Meta
  ) {
    ssrDebug(this.platformId, 'NewsComponent');
  }

  ngOnInit() {
    // this.startAutoplay();
    this.webPages.languageId$.subscribe((data) => {
      this.getPageData(data);
    }, error => {
      console.error('Error fetching language data', error);
    });
  }

  advertisementList: any;

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
    this.DataFound = false;
    // this.webPages.getDynamicContentPage('news', languageId).subscribe((res) => {
    this.webPages.getDynamicNewsPage(languageId).subscribe((res) => {
      if (res.status) {
        if (res.data.advertisementData != '' && res.data.advertisementData != undefined) {
          this.advertisementData = res.data.advertisementData;
        } else {
          this.advertisementData = [];
        }
        /*### Meta Tags ###*/
        this.metaService.updateTag({
          name: 'description',
          content: res.data.pageData.meta_description
        });


        this.metaService.updateTag({
          property: 'og:title',
          content: res.data.pageData.meta_title
        });


        this.metaService.updateTag({
          property: 'og:description',
          content: res.data.pageData.meta_description
        });
        /*### Meta Tags ###*/
        this.DataFound = true;
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisemnet_new_base_url = res.data.advertisemnet_new_base_url;
        if (res.data.pageData != '' && res.data.pageData != undefined) {
          this.slider_title = res.data.pageData.slider_title;
          this.banner_title = res.data.pageData.banner_title;
          this.news_title = res.data.pageData.news_title;
          this.slider_btn_txt = res.data.pageData.slider_btn_txt;
          this.slider_date = res.data.pageData.slider_date;
        }

        if (res.data.newsSliderData != '' && res.data.newsSliderData != undefined) {
          // this.latestNewsData = res.data.newsSliderData;
          // this.addThreeElements(this.latestNewsData);
          this.addThreeElements(res.data.newsSliderData);
          this.startCountdown();
          this.DataFound = true;
        } else {
          this.DataFound = false;
        }
        this.latestNewsData = res.data.latestNewsData;
        console.log(this.latestNewsData);
        this.news_img_path = res.data.news_img_path;
        this.slider_btn_txt = res.data.pageData.slider_btn_txt;
        this.slider_date = res.data.pageData.slider_date;

        this.bannerImg = res.data.pageData.banner_bg_img;


        // this.images = res.data.newsSliderData || this.images;
        this.base_url2 = res.data.base_url;
        // this.addThreeElements(this.latestNewsData);
        this.advertisemnet_base_url = res.data.advertisemnet_base_url;
        this.advertisemnet_new_base_url = res.data.advertisemnet_new_base_url;
        this.advertisementData = res?.data?.advertisementData;
        this.advertisementList = res?.data?.allAdsList;

        this.isLoading = false;

      }
    }, error => {
      console.error('Error fetching dynamic page data', error);
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
    // this.stopAutoplay();
    // this.startAutoplay();
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

  getcurrentImage() {
    return this.images[this.currentImageIndex].featured_image;
  }

  getRouterLink(index: any): string {
    // Returns a dynamic URL based on the slider index
    return '/news/' + index;
  }

  closeAd(object: any) {

    this.isActive[object] = false;

  }

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

  // isExists(key: any): boolean {
  //   return key in this.advertisementData;
  // }

  isExists(key: any): boolean {
    return (this.advertisementData && key in this.advertisementData) || (this.advertisementList && this.advertisementList.includes(key));
  }

  isFeaturedImageExists(key: any): boolean {
    return this.advertisementData && this.advertisementData[key] && 'featured_image' in this.advertisementData[key];
  }


  addThreeElements(originalArray: any) {
    this.images = [];
    let selectedItems = originalArray.slice(0, 3).map((item: any) => {
      const dateObj = new Date(item.created_at);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear()).slice(-2); // Get last 2 digits

      return {
        ...item,
        date: `${day}.${month}.${year}`
      };
    });

    this.images.push(...selectedItems);
    console.warn(this.images, originalArray, selectedItems);
  }

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/no_cover_img1.png'; // or wherever your fallback image is
  }


  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}
