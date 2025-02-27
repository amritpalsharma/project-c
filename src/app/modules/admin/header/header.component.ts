import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TalentService } from '../../../services/talent.service';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../services/socket.service';
import { goToActiveLog } from '../../../../utlis';
import { SharedService } from '../../../services/shared.service';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { TalkService } from '../../../services/talkjs.service';

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
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  //constructor(private themeService: ThemeService) {}
  constructor(private shareService: SharedService, private userService: UserService, private themeService: ThemeService, private authService: AuthService, private router: Router, private translateService: TranslateService, private talentService: TalentService, private socketService: SocketService, private talkService: TalkService) { }

  loggedInUser: any = localStorage.getItem('userData');
  profileImgUrl: any = "";
  lang: string = '';
  domains: any = environment.domains;
  envLang: any = environment.adminLangs;
  isDarkMode: boolean = false;

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

  notificationSeen: boolean = false;

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

    let langId = localStorage.getItem('lang_id');

    this.fetchNotifications(userId, langId);
    this.languages = JSON.parse(this.languages);

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

    this.userService.adminImageUrl.subscribe((newUrl) => {
      console.log(newUrl, 'testing...', this.loggedInUser.profile_image_path)
      if (newUrl == 'default') {
        if (this.loggedInUser.profile_image_path) {
          this.profileImgUrl = this.loggedInUser.profile_image_path;
        } else {
          this.profileImgUrl = "../../../assets/images/1.jpg";
        }
      }

      this.loggedInUser = JSON.parse(this.loggedInUser);
      if (this.loggedInUser.profile_image_path) {
        this.profileImgUrl = this.loggedInUser.profile_image_path;
      } else {
        this.profileImgUrl = "../../../assets/images/1.jpg";
      }

      this.lang = localStorage.getItem('lang') || 'en';

      const selectedLanguage = this.envLang.find((lang: any) => lang.slug === this.lang);
      if (selectedLanguage) {
        this.language = selectedLanguage;
      } else {
        this.language = this.envLang[0];
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

    this.userService.getAdminProfile().subscribe((response) => {
      if (response && response.status) {
        let userData = response.data.user_data;
        // this.firstName = this.userData.first_name || '';
        // this.lastName = this.userData.last_name || '';
        // this.email = this.userData.username || '';
        // this.contactNumber = this.userData.meta.contact_number || '';
        // this.address = this.userData.meta.address || '';
        // this.city = this.userData.meta.city || '';
        // this.state = this.userData.meta.state || '';
        // this.zipcode = this.userData.meta.zipcode || '';
        this.profileImgUrl = userData.meta.profile_image_path || '../../../assets/images/1.jpg';
        // this.isLoading = false;

      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  isUserOnline(senderId: number): boolean {
    if (!this.socketService.onlineUsers) {
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

    this.notifications = [];

    const selectedLanguage = typeof lang != 'string' ? lang.target.value : lang;
    localStorage.setItem('lang', selectedLanguage);
    this.lang = selectedLanguage;
    this.translateService.use(selectedLanguage);
    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = selectedLanguage;
    // Find the corresponding language ID from the langs array
    const selectedLanguageObj = this.envLang.find(
      (lang: any) => lang.slug === selectedLanguageSlug
    );
    this.language = selectedLanguageObj;

    // Default to a specific language ID if none is found (e.g., English)
    const selectedLanguageId = selectedLanguageObj ? selectedLanguageObj.id : 1;
    localStorage.setItem('lang_id', selectedLanguageId);
    // this.shareService.updateData({
    //   action: 'lang_updated',
    //   id: selectedLanguageId
    // })

    this.shareService.updateLanguage(selectedLanguageId);

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

    this.authService.logout();
  }

  themeText: string = 'Light Mode'

  toggleTheme(event: any): void {
    this.themeService.setDarkTheme(event.target.checked);
    this.onThemeToggle(event.target.checked);

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


  toggleSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  closeSidebar() {
    document.body.classList.toggle('mobile-sidebar-active');
  }

  // notifications: Notification[] = [
  //   {
  //     image: '../../../assets/images/1.jpg',
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
    this.talentService.getNotifications(userId, langId).subscribe({
      next: (response) => {
        console.log('Fetched notifications response:', response);

        if (response.status && response.notifications) {
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

  accountSetting() {
    goToActiveLog(this.router);
  }
}
