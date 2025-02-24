import { UserService } from './../../../services/user.service';

import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { Chart, registerables, ChartDataset } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../../services/dashboard.service';
import { ViewportScroller } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { goToActiveLog } from '../../../../utlis';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { SocketService } from '../../../services/socket.service';
import { TalentService } from '../../../services/talent.service';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { CommonHelperService } from '../../../services/common-helper.service';

interface Notification {
  id: number;
  image: string;
  title: string;
  content: string;
  time: string;
  seen: number;
  senderId: number;
  shouldAnimate: boolean;
  relativeTime: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas1') canvas1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas3') canvas3!: ElementRef<HTMLCanvasElement>;
  // @ViewChild('canvas4') canvas4!: ElementRef<HTMLCanvasElement>;

  lang: string = '';
  chart1!: Chart;
  chart2!: Chart;
  chart3!: Chart;
  chart4!: Chart;
  domains: any = environment.domains;
  envlangs: any = environment.adminLangs;
  newRegistrations: any = [];
  chartData: any = [];
  activeLanguage: string = '';
  themeText: string = 'Light Mode'
  newRegistrationClubs: any = [];
  newRegistrationPlayers: any = [];
  newRegistrationScouts: any = [];
  years: any = [];
  selectedYear: any = new Date().getFullYear()-1;
  language: any;
  loggedInUser: any = localStorage.getItem('userData');

  searchResults: any[] = [];
  searchUser: any;
  showSuggestions: boolean = false;
  searchControl = new FormControl('');
  filteredUsers: any[] = [];
  isLoading: boolean = false; // Flag to track loading state

  notificationCount: number = 0;
  notificationSeen: boolean = false;
  liveNotification: any[] = [];
  showNotification: boolean = false;
  clickedNewNotification: boolean = false;
  isScrolledBeyond: boolean = false;
  isShowAllNotification: boolean = false;
  allNotifications: Notification[] = [];
  notifications: Notification[] = [];
  currentIndex = 0;
  notificationsPerPage = 3;
  unseenCount = 0;
  isClosed: boolean = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private dashboardApi: DashboardService,
    private router: Router,
    private translateService: TranslateService,
    private viewportScroller: ViewportScroller,
    private userService: UserService,
    private talentService: TalentService,
    private socketService: SocketService,
    private commonHelper: CommonHelperService
  ) {

  }

  ngOnInit() {
    let notificationStatus = localStorage.getItem("notificationSeen");
    if (notificationStatus) {
      let jsonData = JSON.parse(notificationStatus);
      this.notificationSeen = jsonData;
    }
    else {
      console.log("No data found in localStorage.");
    }

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    let langId = localStorage.getItem('lang_id');

    this.fetchNotifications(userId, langId);

    this.socketService.on('notification').subscribe((data) => {
      // Fetch all notifications to update this.allNotifications with the latest data
      // let userId = this.loggedInUser?.id;
      // if (userId) {
      //   this.fetchNotifications(userId);
      // }

      console.log("data", data);

      const obj = {
        id: 0,
        image: data.senderProfileImage,
        title: data.senderName,
        content: data.message,
        time: 'just now',
        seen: data.seen,
        senderId: data.senderId,
        shouldAnimate: true,
        relativeTime: 'just now',
      };

      // Add the notification to the array and show the notification box
      this.liveNotification = [obj]; // Keep only the latest notification
      this.showNotification = true;
      if (this.isScrolledBeyond) {
        this.clickedNewNotification = true;
      }

      this.notifications.unshift(obj);

      console.log('New notification:', data.message);

      // Hide the notification after 3 seconds
      setTimeout(() => {
        this.liveNotification = [];
        this.showNotification = false;
        obj.shouldAnimate = false;
      }, 5000); // 5000 ms = 5 seconds
    });

    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.getNewRegistrations();
    this.getNewRegistrationsWithScout();
    this.getNewRegistrationsWithClub();
    this.getNewRegistrationsWithPlayers();
    this.generateYears();
    this.lang = localStorage.getItem('lang') || 'en';


    const selectedLanguage = this.envlangs.find((lang: any) => lang.slug === this.lang);
    if (selectedLanguage) {
      this.language = selectedLanguage;
    } else {
      this.language = this.envlangs[0];
    }

    this.translateService.use(this.lang);
    Chart.register(...registerables);
    this.userService.getAdminProfile().subscribe((response) => {
      if (response && response.status) {
        let userData = response.data.user_data;
        this.loggedInUser.profile_image_path = userData.meta.profile_image_path || '../../../assets/images/1.jpg';
      } else {
        console.error('Invalid API response structure:', response);
      }
    });


    this.searchControl.valueChanges
      .pipe(
        filter((value): value is string => value !== null && value.trim().length > 0), // Exclude null or empty strings
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText: string) => {
          this.isLoading = true;
          return this.userService.searchUser(searchText).pipe(
            finalize(() => (this.isLoading = false))
          );
        })
      )
      .subscribe(
        (response: any) => {
          if (response && response.status && response.data?.userData) {
            this.filteredUsers = response.data.userData;
          } else {
            console.error('Invalid API response structure:', response);
            this.filteredUsers = [];
          }
        },
        (error) => {
          console.error('Error fetching users:', error);
          this.filteredUsers = [];
        }
      );

  }

  ngAfterViewInit() {

  }

  yearChange(e:any){
   this.updateChartData(e.target.value);
  }
  getNewRegistrations() {
    try {
      this.dashboardApi.getNewRegistration(5).subscribe((response) => {
        if (response && response.status && response.data) {
          this.newRegistrations = response.data.userData;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  getNewRegistrationsWithPlayers() {
    try {
      this.dashboardApi.getNewRegistrationWithRole(4, 10).subscribe((response) => {
        if (response && response.status && response.data) {
          this.newRegistrationPlayers = response.data.userData;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  getNewRegistrationsWithClub() {
    try {
      this.dashboardApi.getNewRegistrationWithRole(2, 10).subscribe((response) => {
        if (response && response.status && response.data) {
          this.newRegistrationClubs = response.data.userData;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  getNewRegistrationsWithScout() {
    try {
      this.dashboardApi.getNewRegistrationWithRole(3, 10).subscribe((response) => {
        if (response && response.status && response.data) {
          this.newRegistrationScouts = response.data.userData;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  setSelectedYear(year: any) {
    this.getChardData(year);
  }
  updateChartData(year: any){
    try {
      this.chart1.destroy();
      this.chart2.destroy();
      this.chart3.destroy();
      
      this.dashboardApi.getChartData(year).subscribe((response) => {
        if (response && response.status && response.data) {
          this.chartData = response.data;
          setTimeout(() => {
            this.chart1 = this.createChart(this.canvas1.nativeElement, 'canvas1', response.data.users.labels, response.data.users.values)!;
            this.chart2 = this.createChart(this.canvas2.nativeElement, 'canvas2', response.data.sales.labels, response.data.sales.values)!;
            this.chart3 = this.createChart(this.canvas3.nativeElement, 'canvas3', response.data.subscriptions.labels, response.data.subscriptions.values)!;
            //this.chart4 = this.createChart(this.canvas4.nativeElement, 'canvas4')!;
            this.updateChartBackgroundColor();

          }, 1000);

        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  getChardData(year: any) {
    try {
      this.dashboardApi.getChartData(year).subscribe((response) => {
        if (response && response.status && response.data) {
          this.chartData = response.data;
          setTimeout(() => {
            this.chart1 = this.createChart(this.canvas1.nativeElement, 'canvas1', response.data.users.labels, response.data.users.values)!;
            this.chart2 = this.createChart(this.canvas2.nativeElement, 'canvas2', response.data.sales.labels, response.data.sales.values)!;
            this.chart3 = this.createChart(this.canvas3.nativeElement, 'canvas3', response.data.subscriptions.labels, response.data.subscriptions.values)!;
            //this.chart4 = this.createChart(this.canvas4.nativeElement, 'canvas4')!;
            this.updateChartBackgroundColor();

          }, 1000);

        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  createChart(canvas: HTMLCanvasElement, chartId: string, labels: any, values: any): Chart | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Failed to get canvas context for ${chartId}`);
      return null;
    }
   

    const gradientStroke = ctx.createLinearGradient(100, 0, 700, 0);
    gradientStroke.addColorStop(0, '#7BDA66');
    gradientStroke.addColorStop(0.5, '#236115');
    gradientStroke.addColorStop(1, '#7BDA66');

    const data = {
      labels: labels,
      datasets: [
        {
          data: values,
          borderWidth: 6,
          borderColor: gradientStroke,
          pointBorderWidth: 3,
          pointBackgroundColor: '#BDE34F',
          pointBorderColor: '#FFFFFF',
          pointRadius: 10,
          weight: 700,


          fill: {
            target: 'origin',
            above: 'rgba(11, 149, 100, 0.08)',
          },
        } as ChartDataset<'line'>,
      ],
    };
   
    return new Chart(ctx, {
      type: 'line',
      data,
      options: {
        layout: {
          padding: 0,
        },
        responsive: true,
        scales: {
          y: {
            stacked: false,
            beginAtZero: true,
            grid: {
              display: false,
            },
            ticks: {
              display: false,
            },
            border: {
              display: false,
            },

          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              display: true,
              font: {
                size: 20,
                family: 'poppins,sans-serif',
                weight: 700,
              },
            },
            border: {
              display: false,
            },
          },
        },
        elements: {
          line: {
            tension: 0.5,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: '#E05263',
            titleColor: '#fff',

            titleFont: {
              family: 'Poppins',
              size: 20,
              weight: 800,
            },

            callbacks: {
              label: (tooltipItem: any) => {
                return this.translateService.instant('tooltip.totalUsers', { count: tooltipItem.raw });
              }
            },

            displayColors: false,
          },
        },
      },
    });

  }

  updateChartBackgroundColor() {
    let isDarkMode : any;
    this.themeService.isDarkTheme.subscribe((isDarkTheme: boolean) => {
      isDarkMode = isDarkTheme;
    });
    const charts = [this.chart1, this.chart2, this.chart3];
    charts.forEach((chart) => {
      
      if (chart.options && chart.options.scales && chart.options.plugins) {
        if (chart.options.scales['x'] && chart.options.scales['x'].grid) {
          chart.options.scales['x'].grid.color = isDarkMode ? '#333' : '#E0E0E0';
        }
        if (chart.options.scales['y'] && chart.options.scales['y'].grid) {
          chart.options.scales['y'].grid.color = isDarkMode ? '#333' : '#E0E0E0';
        }
        if (chart.options.plugins.tooltip) {
          chart.options.plugins.tooltip.backgroundColor = isDarkMode ? '#BDE34F' : '#E05263';
        }
        chart.options.backgroundColor = isDarkMode ? '#BDE34F' : '#FFFFFF';
        chart.update();
      }

    });

  }


  toggleTheme(event: any): void {
    this.themeService.setDarkTheme(event.target.checked);
  }

  logout() {
    this.authService.logout();
  }



  isUserOnline(senderId: number): boolean {
    if(!this.socketService.onlineUsers){
      return false;
    }
    return senderId.toString() in this.socketService.onlineUsers;
  }

  toggleDropdown() {
    this.notificationSeen = true;
    localStorage.setItem('notificationSeen', 'true');
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    console.log(this.currentIndex)

    this.isClosed = !this.isClosed;
  }

  notificationClicked(id:number, seen: number, notification: any){
    if(!notification.seen){
      this.talentService.updateNotificationSeen(notification.id, 1).subscribe({
        next: (response) => {
          if(response.status){
            notification.seen = 1;
            console.log('Message from API:', response.message);
          }
          else{
            console.log("something went wrong");
          }
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
    }
    else{
      console.log("already seen");
    }
  }

  ChangeLang(lang: any) {
    const selectedLanguage = typeof lang !== 'string' ? lang.target.value : lang;
    localStorage.setItem('lang', selectedLanguage);
    const selectedLang = this.envlangs.find((lang: any) => lang.slug === selectedLanguage);
    this.language = selectedLang;
    console.log('language', this.language);
    let selectedLandId = selectedLang ? selectedLang.id : 1;
    localStorage.setItem('lang_id', selectedLandId);
    this.translateService.use(selectedLanguage);
    this.activeLanguage = selectedLanguage;
  }

  toggleSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  closeSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  onNotificationClick(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
  }

  onScroll(): void {
    console.log("something")
    const notificationBox = document.getElementById('notification-box-id');
    if (notificationBox) {
      // Check if scroll position is greater than 300
      this.isScrolledBeyond = notificationBox.scrollTop > 200;
    }
  }

  scrollToTop(): void {
    const notificationBox = document.getElementById('notification-box-id');
    if (notificationBox) {
      notificationBox.scrollTop = 0;
    }
    this.clickedNewNotification = false;
  }

  fetchNotifications(userId: number, langId: any): void {
    this.talentService.getNotifications(userId, langId).subscribe({
      next: (response) => {
        console.log('Fetched notifications response:', response);
  
        if (response.status && response.notifications) {
          this.unseenCount = response.unseen_count;
          // Clear existing notifications to avoid stale data
          this.allNotifications = [];
          this.notifications = [];
          console.log("info", this.currentIndex, this.notificationsPerPage)
          if(this.currentIndex != 0){
            this.notificationsPerPage = this.currentIndex;
          }
          this.currentIndex = 0;
  
          // Map fetched notifications to the Notification interface
          this.allNotifications = response.notifications.map((notif: any) => ({
            id: notif.id,
            image: notif.senderProfileImage || '../../../assets/images/default.jpg',
            title: notif.senderName || 'Unknown',
            content: notif.message,
            time: notif.time,
            seen: notif.seen,
            senderId : notif.senderId,
            shouldAnimate:false,
            relativeTime: notif.relativeTime,
          }));
  
          this.loadMoreNotifications(); // Load the initial set of notifications
        } else {
          console.warn('No notifications found in the response.');
        }
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      },
    });
  }

  something : boolean = false;
  

  // Load notifications in chunks of 3
  loadMoreNotifications(): void {
    this.something=true;

    const nextNotifications = this.allNotifications.slice(
      this.currentIndex,
      this.currentIndex + this.notificationsPerPage
    );
    setTimeout(() => {
      this.something = false;
      this.notifications = [...this.notifications, ...nextNotifications];
    }, 2000);

    this.currentIndex += this.notificationsPerPage;
    if(this.notificationsPerPage>=3){
      this.notificationsPerPage = 3;
    }


    // localStorage.setItem('makeActiveTab', 'activity');
    // setTimeout(() => {
    //   this.router.navigate(['/admin/setting']);
    // }, 1000);
    // this.isShowAllNotification = true;
    // this.liveNotification = this.liveNotification;
    // // Hide the notification after 3 seconds
    // setTimeout(() => {
    //   this.liveNotification = [];
    //   this.showNotification = false;
    //   this.notificationCount = 0;
    //   this.isShowAllNotification = false;
    // }, 5000); // 3000 ms = 3 seconds
    
  }

  toggleLoadmore() {
    const elements = document.querySelectorAll('.Toggle-Notification');
    // console.log(elements);
    elements.forEach(el => {
      el.classList.toggle('d-none');
    });
  }

  getDaysAgo(creationDate: string) {
    const currentDate = new Date(); // Current date
    const createdDate = new Date(creationDate); // Creation date converted to Date object

    // Calculate the difference in milliseconds
    const timeDifference = currentDate.getTime() - createdDate.getTime();

    // Convert milliseconds to days
    const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    let text = " days ago";
    if (daysAgo == 1) {
      text = " day ago";
    } else if (daysAgo == 0) {
      return "Today";
    }
    return daysAgo + text;
  }
  // Sort years in descending order
  sortYearsDescending(years: number[]): number[] {
    return years.sort((a, b) => b - a); // This will sort in descending order
  }
  generateYears() {
    const startYear = this.selectedYear;
    const currentYear = new Date().getFullYear();
    // Populate the years array from startYear to currentYear
    for (let year = startYear; year <= currentYear; year++) { 
      this.years.push(year);
    }
    this.years = this.sortYearsDescending(this.years);
    this.getChardData(this.years[0]);
    
  }

  scrollToTop2() {
    this.viewportScroller.scrollToPosition([0, 0]); // Scrolls to the top-left corner
  }

  removeDecimals(data: any) {
    console.log('this one');
    const modifiedData = data.map((value: any) => value.replace('.00', ''));
    return modifiedData;
  }


  onSearch() {
    if (this.searchUser.trim().length === 0) {
      this.searchResults = [];
      return;
    }

    this.userService.searchUser(this.searchUser).subscribe((response: any) => {
      if (response && response.status && response.data && response.data.userData) {
        this.searchResults = response.data.userData;
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }


  selectUser(user: any): void {

    this.searchControl.setValue(`${user.first_name} ${user.last_name}`, {
      emitEvent: false,
    });

    this.filteredUsers = [];
    // Navigate or perform actions with the selected user
    this.exploreUser(user.role_name, user.id);

  }

  exploreUser(slug: string, id: Number): void {
    let pageRoute = 'admin/' + slug.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  redirectUser(slug: string, id: Number): void {

    let pageRoute = 'admin/' + slug.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  goToSetting() {
    goToActiveLog(this.router);
  }
  
  isValidProfileImage(imageUrl : string){
    return this.commonHelper.checkImageExists(imageUrl);
  }

  async processImages(url : string) {
    const validImageUrl = await this.commonHelper.checkAndReturnImage(url, '');
    return validImageUrl;
    // console.log(`Image URL: ${url} is valid: ${validImageUrl === url ? 'Yes' : 'No'}`);
  }
}

// @Component({
//   selector: 'app-notifications',
//   templateUrl: './notifications.component.html',
//   // styleUrls: ['./notifications.component.css']
//   styleUrls: ['./dashboard.component.scss'],

// })
// export class NotificationsComponent {
//   showAll = false;
//   notifications = [
//     // Array of notifications
//   ];

//   toggleNotifications() {
//     this.showAll = !this.showAll;
//   }
// }


