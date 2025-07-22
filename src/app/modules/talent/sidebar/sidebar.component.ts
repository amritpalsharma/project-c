import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { AuthService } from '../../../services/auth.service';

// New Code
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'talent-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'] // Fixed 'styleUrl' to 'styleUrls'
})
export class SidebarComponent implements OnInit {
  sidebarOpen: boolean = true; // Initial state of the sidebar
  isNum: Number = 1;
  isUserVerified: boolean = false;
  loggedInUser: any = localStorage.getItem('userInfo');
  locksideBar: boolean = true;
  // New Code
  private routerEventsSubscription!: Subscription
  constructor(
    private authService: AuthService,
    private globalSettings: GlobalSettingsService,
    private socketService: SocketService,
    public dialog: MatDialog,
    private router: Router,// New Code
    // New Code
  ) { }

  ngOnInit(): void {
    // Add any initialization logic if needed
    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
    if (typeof this.loggedInUser !== 'undefined' && this.loggedInUser !== null && this.loggedInUser !== '') {
      // Do something
      this.loggedInUser = JSON.parse(this.loggedInUser);
    } else {
      // window.location.reload();
    }
    this.isUserVerified = false;
    this.getUserStatus();

    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // If the current URL is the same as the target URL, prevent any action
        const currentUrl = this.router.url;
        const targetUrl = event.url;  // The URL being navigated to
        console.info('currentUrl ' + currentUrl + ' targetUrl = ' + targetUrl)
        if (currentUrl === targetUrl) {
          console.log('You are already on the target page, no need to navigate');
          // Optionally, you can handle this case specifically, for example:
          // Resetting scroll position, showing a message, etc.
          const targetDiv = document.querySelector('.page-container');
          if (targetDiv) {
            targetDiv.scrollTo(0, 0);
          }
          return;  // Stop further execution if the route is the same
        }

        // If the navigation is to a different route, proceed with custom actions
        console.log('Navigating to a different route:', targetUrl);
        // You can perform actions like scroll reset, etc.
      }
    });
  }

  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      console.info('SideBar get status called::')
      if (result == 2) {
        this.isUserVerified = true;
      } else {
        this.isUserVerified = false;
      }
      this.locksideBar = false;
    });
  }


  toggleState(): void {
    this.sidebarOpen = !this.sidebarOpen; // Toggles the sidebar state
    console.log("working");

    // Update body classes based on sidebar state
    if (this.sidebarOpen) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
    } else {
      document.body.classList.add('compact-sidebar');
      document.body.classList.remove('mobile-sidebar-active');
    }
  }



  closeSidebar(isMobile: any): void {
    if (!isMobile) {
      this.sidebarOpen = false;
      document.body.classList.remove('mobile-sidebar-active');
      document.body.classList.add('compact-sidebar');
    }
    else {
      if (window.innerWidth < 992) {
        this.sidebarOpen = false;
        document.body.classList.remove('mobile-sidebar-active');
        document.body.classList.add('compact-sidebar');
      }
    }
  }

  showVerificationPopup(event: Event) {
    event.preventDefault();
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });

    event.preventDefault();
  }

  // openSidebar(): void {
  //   this.sidebarOpen = true;
  //   document.body.classList.remove('compact-sidebar');
  //   document.body.classList.add('mobile-sidebar-active');
  // }

  logout240625() {
    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
    }
    let lang_id = localStorage.getItem('lang_id');
    let cookieConsentTimestamp = localStorage.getItem('cookieConsentTimestamp');
    let cookiesent = localStorage.getItem('cookieConsent');

    console.log(userId);
    this.socketService.disconnectUser(userId);
    let theme = localStorage.getItem('theme') || 'light';
    let lang = localStorage.getItem('lang') || this.globalSettings.getLanguage();
    let domainLang = this.globalSettings.getLanguage();
    if (domainLang != '' && localStorage.getItem('lang') == '' || localStorage.getItem('lang') == undefined) {
      lang = domainLang;
    }
    localStorage.clear();
    localStorage.setItem('cookieConsent', cookiesent + '');
    localStorage.setItem('cookieConsentTimestamp', cookieConsentTimestamp + '');
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
    localStorage.setItem('lang_id', lang_id + '');
    this.authService.logout();
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


  ngOnDestroy() {
    // Cleanup the subscription when the component is destroyed
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Adding the click event listener to detect clicks anywhere in the document
    document.body.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      console.info('target', target.tagName)
      // Check if the target is an svg or p tag (children inside the a tag)
      if (target && (target.tagName === 'SVG' || target.tagName === 'P' || target.tagName === 'A')) {
        // Find the closest parent <a> tag
        const parentLink = target.closest('a') as HTMLElement;

        // Check if the parent <a> tag has the "active" class
        if (parentLink && parentLink.classList.contains('active')) {
          console.log('Clicked on an active link!');
          // You can add custom logic here, like resetting scroll position
          // Example: Reset scroll when clicking on the active link
          const targetDiv = document.querySelector('.page-container');
          if (targetDiv) {
            targetDiv.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }
        }
      }
    });
  }
}
