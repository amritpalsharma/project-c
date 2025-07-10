import { Component, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TalentService } from '../../../services/talent.service';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { SocketService } from '../../../services/socket.service';
import { map, filter, timeout } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormControl } from '@angular/forms';
// import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TitleService } from '../../../title.service';

import { CommonDataService } from '../../../services/common-data.service';
import { WebPages } from '../../../services/webpages.service';
import { TalkService } from '../../../services/talkjs.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { UnverifiedUserComponent } from '../unverified-user/unverified-user.component';

import { Subscription } from 'rxjs';

// LOCALE FOR CALENDAR
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { inject } from '@angular/core';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/it';
import 'moment/locale/es';
import 'moment/locale/sv';
import 'moment/locale/da';
// import { ChatComponent } from '../chat/chat.component';

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
  senderRole: string;
  event: string;
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
  userRegisteredDomain: any;
  viewsTracked: { [profileId: string]: { viewed: boolean, clicked: boolean } } = {}; // Track view and click per profile

  // CALENDAR SETTINGS
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);


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
    private talkService: TalkService,
    private globalSettings: GlobalSettingsService,
    private cdRef: ChangeDetectorRef,
    private titleService: TitleService,
    public dialog: MatDialog
    // public chatComponent:ChatComponent
  ) {
    let locale = localStorage.getItem('lang') || 'en';
    this._adapter.setLocale(locale);
  }

  loggedInUser: any = localStorage.getItem('userInfo');
  profileImgUrl: any = "../../../../assets/images/default/talent-profile-default.png";
  lang: string = '';
  domains: any = environment.langs;
  message: string = '';
  isLoading: boolean = false; // Flag to track loading state
  language: any;
  liveNotification: any[] = [];
  showNotification: boolean = false;

  searchControl = new FormControl('');
  filteredUsers: any[] = [];
  clickedNewNotification: boolean = false;
  isScrolledBeyond: boolean = false;

  isClosed: boolean = false;
  allNotifications: Notification[] = [];
  notifications: Notification[] = [];
  currentIndex = 0;
  notificationsPerPage = 3;
  unseenCount = 0;
  role: any;
  roles: any = environment.roles;
  showAll: boolean = true;
  isDarkMode: boolean = false;
  totalNotification: boolean = true;

  notificationSeen: boolean = false;
  pageTitle: string = '';
  UserName: string = '';
  isSearchVisible: boolean = false;
  UserRole: string = '';
  currentRole: string = '';
  isUserVerified: boolean = false;
  justNow: string = '';

  langSubscription!: Subscription;
  currentLoggedInPermission: string = this.globalSettings.getCurrentViewOnly();

  ngOnInit() {
    this.getJsonTranslations();
    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getJsonTranslations();
    });


    const url = this.router.url;
    const role = url.split('/')[1];

    this.currentRole = role;
    this.getPageTitle();
    this.getUserName();
    this.getUserRole();
    this.setPaymentStatus();
    // this.chatComponent.reloadChatComponent();
    let isFrontendDarkMode = localStorage.getItem('theme');
    if (isFrontendDarkMode != '' && isFrontendDarkMode == 'dark') {
      this.isDarkMode = true;
    } else {
      this.isDarkMode = false;
    }
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
    let domainLang = this.globalSettings.getLanguage();
    if (domainLang != '' && localStorage.getItem('lang') == '' || localStorage.getItem('lang') == undefined) {
      localStorage.setItem('lang', domainLang);
    } else {
      // alert(localStorage.getItem('lang'));
    }
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
      if (localStorage.getItem("lang") == '' || localStorage.getItem("userData") == null && userData.lang != '') {
        let dbLanguage = this.getSlugFromID(userData.lang);
        if (dbLanguage != '') {
          this.ChangeLang(dbLanguage);
          this.lang = dbLanguage;
        }
      }
      // console.log('userData => ',userData);
    }
    else {
      console.log("No data found in localStorage.");
    }

    // let userRole = localStorage.getItem("userRole");

    // Find the role based on the id


    // this.role = this.roles.find((role: any) => role.id == userRole);
    let langId = localStorage.getItem('lang_id');
    this.fetchNotifications(userId, langId);



    this.getUserStatus();


    this.commonDataService.profilePic$.subscribe(url => {
      this.profileImgUrl = url;
    });

    this.lang = localStorage.getItem('lang') || 'en';


    this.socketService.on('notification').subscribe((data) => {


      this.unseenCount++;
      this.notificationSeen = false;
      localStorage.setItem('notificationSeen', 'false');

      this.totalNotification = true;

      const obj = {
        id: 0,
        image: data.senderProfileImage,
        title: data.senderName,
        content: data.message,
        time: this.justNow,
        seen: data.seen,
        senderId: data.senderId,
        shouldAnimate: true,
        relativeTime: this.justNow,
        senderRole: 'talent',
        event: data.event
      };

      // Add the notification to the array and show the notification box
      this.liveNotification = [obj]; // Keep only the latest notification
      this.showNotification = true;
      if (this.isScrolledBeyond) {
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

    // Listen for route changes and update the title
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Ensure only navigation events are handled
        map(() => this.route.firstChild?.snapshot.data['title'] || 'Home') // Default to 'Home' if no title
      )
      .subscribe((title: string) => {
        this.currentPageName = title;
      });


    // code update by amrit 13 march 2025
    // this.searchControl.valueChanges
    //   .pipe(
    //     map((value) => (typeof value === 'string' ? value.trim() : '')), // Ensure value is a trimmed string
    //     tap((value: any) => {
    //       console.log("Search input changed:", value);
    //       if (!value) {
    //         console.log("Search input Cleared");
    //         this.filteredUsers = []; // Clear search results when input is empty
    //       }
    //     }),
    //     filter((value) => value.length > 0), // Ensure search triggers only for non-empty input
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     filter(text => !!text && text.trim().length >= 2),
    //     switchMap((searchText: string) => {
    //       this.isLoading = true;
    //       return this.userService.exploreSearchUser(searchText).pipe(
    //         finalize(() => (this.isLoading = false))
    //       );
    //     })
    //   )
    //   .subscribe(
    //     (response: any) => {

    //       if (response?.status && Array.isArray(response.data?.userData?.users)) {
    //         this.filteredUsers = response.data.userData.users;
    //       } else {
    //         this.filteredUsers = [];
    //       }

    //     },
    //     (error) => {
    //       console.error("Error fetching users:", error);
    //       this.filteredUsers = [];
    //     }
    //   );

    // code update by amrit 07 june 2025
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((value: any) => {
          if (typeof value === 'string') return value.trim();
          if (value && value.first_name) return `${value.first_name} ${value.last_name || ''}`.trim();
          return '';
        }),
        tap((value: string) => {
          console.log("Search input changed:", value);
          if (!value) {
            console.log("Search input cleared");
            this.filteredUsers = [];
          }
        }),
        filter((text: string) => !!text && text.length >= 2),
        switchMap((searchText: string) => {
          this.isLoading = true;
          return this.userService.exploreSearchUser(searchText).pipe(
            finalize(() => (this.isLoading = false))
          );
        })
      )
      .subscribe(
        (response: any) => {
          if (response?.status && Array.isArray(response.data?.userData?.users)) {
            this.filteredUsers = response.data.userData.users;
          } else {
            this.filteredUsers = [];
          }
        },
        (error) => {
          console.error("Error fetching users:", error);
          this.filteredUsers = [];
        }
      );

    // end code update by amrit 07 june 2025

    this.route.params.subscribe(() => {
      this.searchControl.setValue('', { emitEvent: false }); // Clear search input
      this.filteredUsers = []; // Reset search results
    });

    const selectedLanguage = this.domains.find((lang: any) => lang.slug === this.lang);
    if (selectedLanguage) {
      this.language = selectedLanguage;
    } else {
      this.language = this.domains[0];
    }
    this.lang = this.lang.replaceAll(' ', '');

    if (this.lang == 'se') {
      this.lang = 'sv';
    }
    const selectedLanguageArr = this.domains.find((lang: any) => lang.slug === this.lang);
    if (selectedLanguageArr == undefined || selectedLanguageArr != '') {
      this.language = selectedLanguageArr;
    }

    this.getUserProfile();
  }
  displayUserFn(user: any): string {
    // return user ? `${user.first_name} ${user.last_name}` : '';
    return user && user.first_name ? `${user.first_name} ${user.last_name}` : '';
  }


  isVerifiedStatusLoaded: boolean = false;
  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      if (result == 2) {
        this.isUserVerified = true;
      } else {
        this.isUserVerified = false;
      }
      this.isVerifiedStatusLoaded = true;
    });
  }

  setPaymentStatus() {
    this.socketService.getLoggedInUserPaymentStatus().then((result) => {
      result = result.toLowerCase();
      if (result === 'live') {
        localStorage.setItem('payment_mode', result);
      } else {
        localStorage.setItem('payment_mode', result);
      }
      console.info('Payment Set In Header '+result);
    });
  }

  getUserProfile() {
    let params = {
      lang: localStorage.getItem('lang_id')
    };

    try {
      this.talentService.getProfileData(params).subscribe((response) => {

        if (response && response.status && response.data && response.data.user_data) {
          // console.info('UserDataArrSharedHeader', response.data);
          let userArr = response.data.user_data;
          if (!this.loggedInUser || this.loggedInUser == '' || typeof this.loggedInUser === undefined) {
            this.loggedInUser = userArr;
            // localStorage.setItem('userInfo', JSON.stringify(response.data.user_data));
            localStorage.setItem('userData', JSON.stringify(response.data.user_data));
          }
          if (userArr?.first_name || userArr?.last_name) {
            this.titleService.setName(userArr?.first_name + ' ' + userArr.last_name);
            this.titleService.setRole(userArr?.role_name);
          }
          // userRegisteredDomain
          if (userArr?.meta?.profile_image_path && typeof userArr?.meta?.profile_image_path != undefined) {
            this.commonDataService.updateProfilePic(userArr?.meta?.profile_image_path);
          } else if (userArr?.role && userArr?.role == 2 && userArr?.club_logo_path) {
            // console.warn('userArr', userArr)
            this.commonDataService.updateProfilePic(userArr?.club_logo_path);
          }
          if (response?.data?.representator_data && response?.data?.representator_data != '') {
            console.info('representator_data', response?.data?.representator_data)
            // console.info('representator_data_permission',response.data.representator_data.permission)
            if (response.data.representator_data.permission == 'admin.view') {
              this.currentLoggedInPermission = 'club_view_only';
              this.globalSettings.setViewOnly(this.currentLoggedInPermission);
              console.info('Set as  view in Header')
            }
            if (response.data.representator_data.permission == 'admin.edit') {
              this.currentLoggedInPermission = 'club_edit_only';
              this.globalSettings.setViewOnly(this.currentLoggedInPermission);
            }
          }
        }
      });
      // console.info('Profile Set as '+response)
      console.info('Profile Set as ' + this.currentLoggedInPermission)
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }


  isUserOnline(senderId: number): boolean {
    if (!this.socketService.onlineUsers) {
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
    let isDeleted: any = localStorage.getItem('isDeleted');
    if (isDeleted) {
      let jsonData = localStorage.getItem("userData");
      let userId;
      if (jsonData) {
        let userData = JSON.parse(jsonData);
        userId = userData.id;
        if (localStorage.getItem("lang") == '' || localStorage.getItem("userData") == null && userData.lang != '') {
          let dbLanguage = this.getSlugFromID(userData.lang);
          if (dbLanguage != '') {
            this.ChangeLang(dbLanguage);
            this.lang = dbLanguage;
          }
        }
        // console.log('userData => ',userData);
      }
      else {
        console.log("No data found in localStorage.");
      }

      // let userRole = localStorage.getItem("userRole");

      // Find the role based on the id


      // this.role = this.roles.find((role: any) => role.id == userRole);
      let langId = localStorage.getItem('lang_id');
      this.notifications = []
      this.fetchNotifications(userId, langId);
      // this.fetchNotifications
      localStorage.removeItem('isDeleted');
    }
    this.notificationSeen = true;
    this.allNotificationSeen();
    this.unseenCount = 0;
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


  allNotificationSeen() {
    let userData: any = localStorage.getItem('userData');
    let jsonData = JSON.parse(userData);
    let userId = jsonData?.id;
    this.talentService.updateAllNotificationSeen(userId).subscribe({
      next: (response) => {
        if (response.status) {
          console.log('Message from API:', response.message);
        }
        else {
          console.log("something went wrong");
        }
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  notificationClicked(id: number, seen: number, notification: any) {
    if (!notification.seen) {
      this.talentService.updateNotificationSeen(notification.id, 1).subscribe({
        next: (response) => {
          if (response.status) {
            notification.seen = 1;
            console.log('Message from API:', response.message);
          }
          else {
            console.log("something went wrong");
          }
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
    }
    else {
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

  navigateToTab(tab: string, userRole: string) {
    let fragment = 'activity'; // Default fragment

    if (tab === 'setting') {
      fragment = 'setting';
    } else if (tab === 'notifications') {
      fragment = 'notifications';
    }
    let userArr = localStorage.getItem('userData');
    // let test = userArr.JSON(); 
    // let role = localStorage.getItem('role');

    // console.log(role)
    const url = this.router.url;

    if (url.toLowerCase().includes('/view/')) {
      const role = this.loggedInUser.role_name.toLowerCase();
      this.router.navigate([`${role}/setting`], { fragment });
      // console.log("'/view/' found in URL (case-insensitive check)");
    } else {
      let loggedInUser: any = localStorage.getItem('userData')
      let currentUser = JSON.parse(loggedInUser);
      const role = currentUser.role_name.toLowerCase();
      this.router.navigate([`/${role}/setting`], { fragment });
    }
  }


  ChangeLang(lang: any) {
    this.notifications = [];
    const selectedLanguage = typeof lang != 'string' ? lang.target.value : lang;
    localStorage.setItem('lang', selectedLanguage);
    // let locale = localStorage.getItem('lang') || 'en';
    this._adapter.setLocale(selectedLanguage);
    this.lang = selectedLanguage;
    const selectedLang = this.domains.find((lang: any) => lang.slug === selectedLanguage);
    this.language = selectedLang;
    let selectedLandId = selectedLang ? selectedLang.id : 1;
    localStorage.setItem('lang_id', selectedLandId);
    this.translateService.use(selectedLanguage)
    // this.webPages.updateData(selectedLandId);
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }
    this.socketService.emit('updateLanguage', { userId, langId: selectedLandId });
    this.fetchNotifications(userId, selectedLandId);
    // Now safely access the locale
    const locale = selectedLang.locale;
    // Change the TalkJS locale by passing the locale string (e.g., 'en-US')
    this.talkService.changeLocale(locale);
    this.globalSettings.themeAndLangChange('lang', lang);
    this.getPageTitle();
    if (this.lang == 'se') {
      this.lang = 'sv';
    }
  }


  logout() {
    const jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      const userData = JSON.parse(jsonData);
      userId = userData.id;
    }

    const lang_id = localStorage.getItem('lang_id');
    const cookieConsentTimestamp = localStorage.getItem('cookieConsentTimestamp');
    const cookiesent = localStorage.getItem('cookieConsent');
    const theme = localStorage.getItem('theme') || 'light';
    let lang = localStorage.getItem('lang') || this.globalSettings.getLanguage();
    const domainLang = this.globalSettings.getLanguage();

    if ((domainLang !== '') && (!localStorage.getItem('lang'))) {
      lang = domainLang;
    }

    // 🔌 Disconnect user socket
    this.socketService.disconnectUser(userId);

    // 🧹 Clear & Restore necessary values
    localStorage.clear();
    localStorage.setItem('cookieConsent', cookiesent + '');
    localStorage.setItem('cookieConsentTimestamp', cookieConsentTimestamp + '');
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
    localStorage.setItem('lang_id', lang_id + '');

    // ✅ Perform logout logic
    this.authService.logout();

    // 🔁 Navigate directly to homepage or login (choose your route)
    // this.router.navigate(['/']); // Or use '/login' or another route as needed

    // ✅ Finally, force hard redirect to base page
    window.location.href = '/';
  }

  themeText: string = 'Light Mode'

  toggleTheme(event: any): void {

    this.themeService.setDarkTheme(event.target.checked);
    // if(event.target.checked){
    this.onThemeToggle(event.target.checked);
    this.globalSettings.callIndexComponentFunction();
    this.globalSettings.themeAndLangChange('theme', event);
    // }
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
    this.talentService.getNotifications(userId, langId, 1, 10).subscribe({
      next: (response) => {
        console.log('Fetched notifications response:', response);

        if (response.status && response.notifications) {
          if (response.total_count == '0') {
            this.totalNotification = false;
          }
          this.unseenCount = response.unseen_count;
          // Clear existing notifications to avoid stale data
          this.allNotifications = [];
          this.notifications = [];
          console.log("info", this.currentIndex, this.notificationsPerPage)
          if (this.currentIndex != 0) {
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
            senderId: notif.senderId,
            shouldAnimate: false,
            relativeTime: notif.relativeTime,
            senderRole: notif.senderRole,
            event: notif.event
          }));

          this.loadMoreNotifications(); // Load the initial set of notifications
        } else {
          this.totalNotification = false;
          console.warn('No notifications found in the response.');
        }
      },
      error: (err) => {
        this.totalNotification = false;
        console.error('Error fetching notifications:', err);
      },
    });
  }

  something: boolean = false;

  // Load notifications in chunks of 3
  loadMoreNotifications(): void {
    this.something = true;

    const nextNotifications = this.allNotifications.slice(
      this.currentIndex,
      this.currentIndex + this.notificationsPerPage
    );
    setTimeout(() => {
      this.something = false;
      this.notifications = [...this.notifications, ...nextNotifications];
    }, 1000);

    this.currentIndex += this.notificationsPerPage;
    if (this.notificationsPerPage >= 3) {
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

    // this.searchControl.setValue(`${user.first_name} ${user.last_name}`, {
    //   emitEvent: false,
    // });
    this.searchControl.setValue(user); // Not string!
    this.filteredUsers = [];
    // Navigate or perform actions with the selected user
    this.exploreUser(user.role_name, user.id);
    this.searchControl.setValue(''); // empty input
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

  getSlugFromID(lang_id: number) {
    let slug = '';
    if (lang_id == 1) {
      slug = 'en';
    } else if (lang_id == 2) {
      slug = 'de';
    } else if (lang_id == 3) {
      slug = 'it';
    } else if (lang_id == 4) {
      slug = 'fr';
    } else if (lang_id == 5) {
      slug = 'es';
    } else if (lang_id == 6) {
      slug = 'pt';
    } else if (lang_id == 7) {
      slug = 'dk';
    } else if (lang_id == 8) {
      slug = 'se';
    }
    return slug;
  }

  checkRole(role: any) {
    if (role == 'Club') return "club";
    else if (role == 'Scout') return "scout";
    else return "talent";
  }

  onThemeToggle(isDarkModeEnabled: boolean): void {
    // Call the toggleTheme function from the service
    this.talkService.toggleTheme(isDarkModeEnabled);
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  getPageTitle() {
    this.titleService.currentTitle.subscribe(updatedTitle => {
      this.pageTitle = updatedTitle;
    });
  }

  getUserName() {
    this.titleService.loggedInName.subscribe(CurrentName => {
      this.UserName = CurrentName;
    });
  }

  getUserRole() {
    this.titleService.loggedInRole.subscribe(CurrentRole => {
      this.UserRole = CurrentRole;
    });
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }

  handleNotiificationClick(notification: any) {

    if (!this.isUserVerified) {
      this.showVerificationPopup(false);
    }
    else {

      console.log(notification)
      // let role = (this.loggedInUser?.role_name || '').toString().toLowerCase();

      let currentUserStr = localStorage.getItem('userData')
      let role = null;
      if (currentUserStr) {
        let currentUser = JSON.parse(currentUserStr);

        role = (currentUser?.role_name).toString().toLowerCase();
      }

      if (notification.event === 'sendMessage') {
        console.log(role);
        this.router.navigate([`/${role}/chat`]);
      }
      else if (notification.event === 'userVerified' || notification.event === 'userRejected' || notification.event === 'scoutAddPlayer' || notification.event === 'inviteTalent' || notification.event === 'acceptScoutRequest' || notification.event === 'rejectScoutRequest' || notification.event === 'acceptClubInvite' || notification.event === 'rejectClubInvite' || !notification.senderRole) {
        let fragment = 'notifications';
        this.router.navigate([`/${role}/setting`], { fragment });
      }
      // else if (notification.event === 'acceptScoutRequest' || notification.event === 'rejectScoutRequest') {
      //   let fragment = 'portfolio';
      //   console.log(role, 'role')
      //   this.router.navigate([`/${role}/dashboard`], { fragment });
      // }
      // else if (notification.event === 'acceptClubInvite' || notification.event === 'rejectClubInvite') {
      //   let fragment = 'sighting';
      //   this.router.navigate([`/${role}/dashboard`], { fragment });
      // }
      else {
        let role = (notification.senderRole || '').toString().toLowerCase();

        if (role === 'scout representator') {
          role = 'scout';
        }
        if (role === 'admin representator') {
          role = 'admin';
        }
        if (role === 'club representator') {
          role = 'club';
        }
        this.router.navigate([`/view/${role}`, notification.senderId]);
      }
    }
  }

  getJsonTranslations() {
    this.translateService.get(['justNow']).subscribe((translations) => {
      this.justNow = translations['justNow'];
    })
  }

  showVerificationPopup(isVerified: boolean) {
    if (isVerified) {
      return;
    }
    if (!this.isVerifiedStatusLoaded) {
      return;
    }
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe((result: any) => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
  }
}