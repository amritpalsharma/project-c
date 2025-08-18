import { Component, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TalentService } from '../../../services/talent.service';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../services/socket.service';
import { goToActiveLog } from '../../../../utlis';
import { SharedService } from '../../../services/shared.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TitleService } from '../../../title.service';
// import { filter, tap } from 'rxjs/operators';
// import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { TalkService } from '../../../services/talkjs.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';

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
import { permission } from 'process';

import { UserRoleService } from '../../../services/user-role.service';

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
  senderRole: string
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  //constructor(private themeService: ThemeService) {}

  // CALENDAR SETTINGS
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);

  constructor(
    private shareService: SharedService,
    private userService: UserService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private talentService: TalentService,
    private socketService: SocketService,
    private talkService: TalkService,
    private cdRef: ChangeDetectorRef,
    private titleService: TitleService,
    private globalSettings: GlobalSettingsService,
    public userRoleService: UserRoleService
  ) {
    let locale = localStorage.getItem('lang') || 'en';
    this._adapter.setLocale(locale);
  }



  loggedInUser: any = localStorage.getItem('userData');
  profileImgUrl: any = "";
  lang: string = '';
  domains: any = environment.domains;
  apiUrl = environment?.apiUrl;
  langs: any = environment.langs;
  envLang: any = environment.adminLangs;
  isDarkMode: boolean = false;
  totalNotification: boolean = true;
  role: any;
  roles: any = environment.roles;

  notificationCount: number = 0;

  isLoading: boolean = false; // Flag to track loading state
  isShowAllNotification: boolean = false;

  languages: any = localStorage.getItem('languages');
  liveNotification: any[] = [];
  showNotification: boolean = false;

  clickedNewNotification: boolean = false;
  isScrolledBeyond: boolean = false;

  isClosed: boolean = false;
  allNotifications: Notification[] = [];
  notifications: Notification[] = [];
  currentIndex = 0;
  notificationsPerPage = 3;
  unseenCount = 0;
  language: any;

  searchResults: any[] = [];
  searchUser: any;
  showSuggestions: boolean = false;
  searchControl = new FormControl('');
  filteredUsers: any[] = [];
  pageTitle: string = '';

  notificationSeen: boolean = false;
  isSearchVisible: boolean = false;
  adminRoleAccess: string = '';

  ngOnInit() {
    // Component's Title
    this.getPageTitle();
    this.searchControl.setValue('', { emitEvent: false });

    this.themeService.isDarkTheme.subscribe((isDarkTheme: boolean) => {
      this.isDarkMode = isDarkTheme;
    });

    let userRole = localStorage.getItem("userRole");

    this.role = this.roles.find((role: any) => role.id == userRole);

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
    this.languages = JSON.parse(this.languages);

    this.socketService.on('notification').subscribe((data) => {
      // Fetch all notifications to update this.allNotifications with the latest data
      // let userId = this.loggedInUser?.id;
      // if (userId) {
      //   this.fetchNotifications(userId);
      // }

      this.unseenCount++;
      this.notificationSeen = false;
      localStorage.setItem('notificationSeen', 'false');

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
        senderRole: 'talent'
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

    this.userService.adminImageUrl.subscribe((newUrl) => {
      console.log(newUrl, 'testing...', this.loggedInUser.profile_image_path)
      if (newUrl == 'default') {
        if (this.loggedInUser.profile_image_path) {
          this.profileImgUrl = this.loggedInUser.profile_image_path;
        } else {
          this.profileImgUrl = "../../../assets/images/1.png";
        }
      }

      this.loggedInUser = JSON.parse(this.loggedInUser);
      if (this.loggedInUser.profile_image_path) {
        this.profileImgUrl = this.loggedInUser.profile_image_path;
      } else {
        this.profileImgUrl = "../../../assets/images/1.png";
      }

      this.lang = localStorage.getItem('lang') || 'en';

      const selectedLanguage = this.envLang.find((lang: any) => lang.slug === this.lang);
      if (selectedLanguage) {
        this.language = selectedLanguage;
      } else {
        this.language = this.envLang[0];
      }

    });




    //  Update code by amrit for search
    // this is used in ngOnit Now 
    this.searchControl.valueChanges
      .pipe(
        filter((value): value is string => value !== null),
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
          let searchText = response.data.searchText;
          let searchResults = response.data.userData;
          // searchResults = searchResults.filter((user: any) => {
          //   const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          //   const search = searchText.toLowerCase();

          //   return (
          //     user.first_name.toLowerCase().startsWith(search) || 
          //     user.last_name.toLowerCase().startsWith(search) ||
          //     fullName.startsWith(search)
          //   );
          // });
          if (response?.status && Array.isArray(response.data?.userData)) {
            this.filteredUsers = response.data.userData;
          } else {
            this.filteredUsers = [];
          }
          // this.filteredUsers = searchResults;
        },
        (error) => {
          console.error('Error fetching users:', error);
          this.filteredUsers = [];
        }
      );

    // **Listen for route changes and reset search**
    this.route.params.subscribe(() => {
      this.searchControl.setValue('', { emitEvent: false }); // Clear search input
      this.filteredUsers = []; // Reset search results
    });


    this.userService.getAdminProfile().subscribe((response) => {
      if (response && response.status) {
        let userData = response.data.user_data;
        // adminRoleAccess
        if (response?.data?.representator_data && response?.data?.representator_data != '') {
          // permission	
          let userType = '';
          if (response?.data?.representator_data?.permission && response?.data?.representator_data?.permission == 'admin.edit') {
            this.adminRoleAccess = 'admin_editor';
            userType = 'admin.edit';
          }
          if (response?.data?.representator_data?.permission && response?.data?.representator_data?.permission == 'view-only') {
            this.adminRoleAccess = 'admin_view_only';
            userType = 'admin.view';
          }
          this.userRoleService.setRole(userType, this.adminRoleAccess);
        }
        // this.firstName = this.userData.first_name || '';
        // this.lastName = this.userData.last_name || '';
        // this.email = this.userData.username || '';
        // this.contactNumber = this.userData.meta.contact_number || '';
        // this.address = this.userData.meta.address || '';
        // this.city = this.userData.meta.city || '';
        // this.state = this.userData.meta.state || '';
        // this.zipcode = this.userData.meta.zipcode || '';
        this.profileImgUrl = userData.meta.profile_image_path || '../../../assets/images/1.png';
        // this.isLoading = false;

      } else {
        console.error('Invalid API response structure:', response);
      }
    });
    let current_lang = localStorage.getItem('lang');;
    if (current_lang == 'en' || current_lang == 'de') {

    } else {
      console.info('Current Selected Lang is ' + current_lang + ' Now set as de default for admin only')
      current_lang = 'de'; // by default de selected
      localStorage.setItem('lang', 'de');
      localStorage.setItem('lang_id', '2');
      this.translateService.use('de');
      this.language.flag = 'Germany.svg';
    }

  }



  isUserOnline(senderId: number): boolean {
    if (!this.socketService.onlineUsers) {
      return false;
    }
    return senderId.toString() in this.socketService.onlineUsers;
  }

  toggleDropdown() {
    let isDeleted: any = localStorage.getItem('isDeleted');
    if (isDeleted) {
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

      this.notifications = []
      this.fetchNotifications(userId, langId);
      // this.fetchNotifications
      localStorage.removeItem('isDeleted');
    }

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

  ChangeLang(lang: any) {
    // console.log('LangObj',lang);
    this.notifications = [];

    const selectedLanguage = typeof lang != 'string' ? lang.target.value : lang;
    localStorage.setItem('lang', selectedLanguage);
    this.lang = selectedLanguage;

    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = selectedLanguage;
    // Find the corresponding language ID from the langs array
    const selectedLanguageObj = this.envLang.find(
      (lang: any) => lang.slug === selectedLanguageSlug
    );
    this.language = selectedLanguageObj;

    // Default to a specific language ID if none is found (e.g., English)
    const selectedLanguageId = selectedLanguageObj ? selectedLanguageObj.id : 1;
    if (lang == 'en') {
      localStorage.setItem('lang_id', '1');
    } else if (lang == 'de') {
      localStorage.setItem('lang_id', '2');
    } else {
      localStorage.setItem('lang_id', selectedLanguageId);
    }
    this.shareService.updateData({
      action: 'lang_updated',
      id: selectedLanguageId
    })

    // this.shareService.updateLanguage(selectedLanguageId);

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    else {
      console.log("No data found in localStorage.");
    }

    this.socketService.emit('updateLanguage', { userId, langId: selectedLanguageId });
    this.fetchNotifications(userId, selectedLanguageId);
    const chatSelectedLanguage = this.langs.find((lang: any) => lang.slug === this.lang);
    // Now safely access the locale
    const locale = chatSelectedLanguage.locale;
    // Change the TalkJS locale by passing the locale string (e.g., 'en-US')
    this.translateService.use(selectedLanguage);
    this.talkService.changeLocale(locale);
    this.getPageTitle();
    this._adapter.setLocale(selectedLanguage);
    // langs
  }
  getPageTitle() {
    this.titleService.currentTitle.subscribe(updatedTitle => {
      this.pageTitle = updatedTitle;
    });
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
    this.socketService.disconnectUser(userId);
    localStorage.removeItem('userPermissionRole');
    this.authService.logout();
  }

  themeText: string = 'Light Mode'

  toggleTheme(event: any): void {
    this.themeService.setDarkTheme(event.target.checked);
    this.onThemeToggle(event.target.checked);
    this.globalSettings.callIndexComponentFunction();
  }
  onThemeToggle(isDarkModeEnabled: boolean): void {
    // Call the toggleTheme function from the service
    this.talkService.toggleTheme(isDarkModeEnabled);
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
    console.info('user', user)
    // this.searchControl.setValue(`${user.first_name} ${user.last_name}`, {
    //   emitEvent: false,
    // });

    this.filteredUsers = [];
    // Navigate or perform actions with the selected user
    this.exploreUser(user.role_name, user.id);
  }

  exploreUser(slug: string, id: Number): void {
    console.log('slug to change ', slug);
    console.log('slug to change with id ', id);
    let slugRoute = slug.toLowerCase();
    const allowedRoles = [
      'club',
      'clube',
      'klub',
      'klubb',
      'talang',
      'talent',
      'talento',
      'scout'
    ];
    if (allowedRoles.includes(slugRoute)) {
      let pageRoute = 'admin/' + slugRoute;
      this.router.navigate([pageRoute, id]);
      this.searchControl.setValue(``, {
        emitEvent: false,
      });
    }
  }


  toggleSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  closeSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  // notifications: Notification[] = [
  //   {
  //     image: '../../../assets/images/1.png',
  //     title: 'Elton Price',
  //     content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  //     time: '14 hours ago'
  //   }
  // ];

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
            senderRole: notif.senderRole
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
    }, 2000);

    this.currentIndex += this.notificationsPerPage;
    if (this.notificationsPerPage >= 3) {
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

  navigateToTab(tab: string) {
    let fragment = 'activity'; // Default fragment

    if (tab === 'team') {
      fragment = 'team';
    } else if (tab === 'notifications') {
      fragment = 'notifications';
    } else if (tab === 'profile') {
      fragment = 'profile';
    }

    this.router.navigate([`/${this.role.slug}/setting`], { fragment });
  }

  accountSetting() {
    goToActiveLog(this.router);
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }
}


