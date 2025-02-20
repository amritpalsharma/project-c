import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { TalentService } from '../../../services/talent.service';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { SocketService } from '../../../services/socket.service';
import { map,filter, timeout } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { CommonDataService } from '../../../services/common-data.service';
import { WebPages } from '../../../services/webpages.service';

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
  selector: 'shared-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  currentPageName: string = ''; // Variable to store current page name
  searchResults: any[] = [];
  searchUser: any;
  showSuggestions: boolean = false;
  viewsTracked: { [profileId: string]: { viewed: boolean, clicked: boolean } } = {}; // Track view and click per profile

  constructor(private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private talentService: TalentService,
    private themeService: ThemeService,
    private authService: AuthService,
    private translateService: TranslateService,
    private socketService: SocketService,
    private commonDataService: CommonDataService,
    private webPages: WebPages,
  ) { }

  loggedInUser: any = localStorage.getItem('userInfo');
  profileImgUrl: any = "../../../../assets/images/default/talent-profile-default.png";
  lang: string = '';
  domains: any = environment.langs;
  message: string = '';
  isLoading: boolean = false; // Flag to track loading state
  language : any;
  liveNotification: any[] = [];
  showNotification: boolean = false;

  searchControl = new FormControl('');
  filteredUsers: any[] = [];
  clickedNewNotification : boolean = false;
  isScrolledBeyond : boolean = false;

  isClosed: boolean = false;
  allNotifications: Notification[] = [];
  notifications: Notification[] = [];
  currentIndex = 0;
  notificationsPerPage = 3;
  unseenCount = 0;
  role:any;
  roles:any= environment.roles;
  showAll : boolean = true;
  isDarkMode: boolean = false;

  notificationSeen : boolean = false;

  ngOnInit() {

    this.themeService.isDarkTheme.subscribe((isDarkTheme: boolean) => {
      this.isDarkMode = isDarkTheme;
    });

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

    let userRole = localStorage.getItem("userRole");

    // Find the role based on the id
    this.role = this.roles.find((role:any) => role.id == userRole);
    let langId = localStorage.getItem('lang_id');
    this.fetchNotifications(userId, langId);
    this.loggedInUser = JSON.parse(this.loggedInUser);

    this.commonDataService.profilePic$.subscribe(url => {
      this.profileImgUrl = url;
    });

    this.lang = localStorage.getItem('lang') || 'en';
    const selectedLanguage = this.domains.find((lang:any) => lang.slug === this.lang);
    if (selectedLanguage) {
      this.language = selectedLanguage;
    }else{
      this.language = this.domains[0];
    }

    this.socketService.on('notification').subscribe((data) => {
      // Fetch all notifications to update this.allNotifications with the latest data
      // let userId = this.loggedInUser?.id;
      // if (userId) {
      //   this.fetchNotifications(userId);
      // }

      const obj = {
        id: 0,
        image: data.senderProfileImage,
        title: data.senderName,
        content: data.message,
        time: 'just now',
        seen: data.seen,
        senderId: data.senderId,
        shouldAnimate: true,
        relativeTime : 'just now',
      };
      
      // Add the notification to the array and show the notification box
      this.liveNotification = [obj]; // Keep only the latest notification
      this.showNotification = true;
      if(this.isScrolledBeyond){
        this.clickedNewNotification = true;
      }
      
      this.notifications.unshift(obj);

      // Hide the notification after 3 seconds
      setTimeout(() => {
        this.liveNotification = [];
        this.showNotification = false;
        obj.shouldAnimate = false;
      }, 5000); // 5000 ms = 5 seconds
    });

    //   this.router.events
    //   .pipe(
    //     filter(event => event instanceof NavigationEnd), // Ensure only navigation events are handled
    //     map(() => {
    //       const child = this.route.firstChild;
    //       return child?.snapshot.data['title'] || 'Home'; // Default title if no data
    //     })
    //   )
    //   .subscribe((title: string) => {
    //     this.currentPageName = title; // Assign the title to `currentPageName`
    //   });

    // }

      // Set the page name for the initial load
      this.setPageTitleFromRoute();

      // Listen for route changes and update the title
      this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Ensure only navigation events are handled
        map(() => this.route.firstChild?.snapshot.data['title'] || 'Home') // Default to 'Home' if no title
      )
      .subscribe((title: string) => {
        this.currentPageName = title;
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

  isUserOnline(senderId: number): boolean {
    if(!this.socketService.onlineUsers){
      return false;
    }
    return senderId.toString() in this.socketService.onlineUsers;
  }

  // isSenderOnline(senderId: number): boolean {
  //   if (!this.onlineUsers) {
  //     return false; // Return false if onlineUsers is not yet populated
  //   }

  //   console.log("data is here = ", this.onlineUsers)
  //   return senderId.toString() in this.onlineUsers;
  // }

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

  // Method to set the page title on the initial load
  private setPageTitleFromRoute() {
    const childRoute = this.route.firstChild;
    if (childRoute && childRoute.snapshot.data['title']) {
      this.currentPageName = childRoute.snapshot.data['title'];
    } else {
      this.currentPageName = 'Home'; // Default to 'Home' if no title found
    }
  }

  navigateToTab(tab: string) {
    this.router.navigate([`/${this.role.slug}/setting`], { fragment: tab === 'setting' ? 'app-settings' : 'activity' });
  }

  ChangeLang(lang: any) {

    this.notifications = [];

    const selectedLanguage = typeof lang != 'string' ? lang.target.value : lang;
    localStorage.setItem('lang', selectedLanguage);
    this.lang = selectedLanguage;

    const selectedLang = this.domains.find((lang:any) => lang.slug === selectedLanguage);
    this.language = selectedLang;
    let selectedLandId = selectedLang ? selectedLang.id : 1;
    localStorage.setItem('lang_id', selectedLandId);
    this.translateService.use(selectedLanguage)
    this.webPages.updateData(selectedLandId);

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    this.socketService.emit('updateLanguage', {userId, langId: selectedLandId});
    this.fetchNotifications(userId, selectedLandId);
  }

  logout() {
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }
    console.log(userId);
    this.socketService.disconnectUser(userId);
    
    this.authService.logout();

  }

  themeText: string = 'Light Mode'

  toggleTheme(event: any): void {
    this.themeService.setDarkTheme(event.target.checked);
  }

  toggleSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  closeSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  // notifications: Notification[] = [
  //   {
  //     image: '../../../assets/images/1.jpg',
  //     title: 'Elton Price1',
  //     content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //     time: '14 hours ago'
  //   }
  // ];



  // loadMoreNotifications() {
  //   const moreNotifications: Notification[] = [
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe2',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '13 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '12 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '12 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '11 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '10 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '10 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '9 hours ago'
  //     },
  //     {
  //       image: '../../../assets/images/1.jpg',
  //       title: 'John Doe',
  //       content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //       time: '18 hours ago'
  //     }
  //   ];

  //   this.notifications = [...this.notifications, ...moreNotifications];

  // }

  onNotificationClick(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
  }

  onScroll(): void {
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
    }, 1000);

    this.currentIndex += this.notificationsPerPage;
    if(this.notificationsPerPage>=3){
      this.notificationsPerPage = 3;
    }
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

  exploreUser(slug: string, id: number): void {
    this.trackProfileClick(id);
    const pageRoute = `view/${slug.toLowerCase()}`;
    this.router.navigate([pageRoute, id]);
  }

  private trackProfileClick(profileId: number): void {
    const id: number[] = [profileId];
    if (!this.viewsTracked[profileId]?.clicked) {
      this.talentService
        .trackProfiles(this.loggedInUser.id, id, 'click')
        .subscribe({
          next: () => {
            console.log(`Click tracked for profile ${profileId}`);
            this.viewsTracked[profileId] = {
              ...this.viewsTracked[profileId],
              clicked: true,
            };
            this.saveTrackedViews();
          },
          error: (error) =>
            console.error('Error tracking profile click', error),
        });
    }
  }

  private saveTrackedViews(): void {
    sessionStorage.setItem('viewsTracked', JSON.stringify(this.viewsTracked));
  }
}