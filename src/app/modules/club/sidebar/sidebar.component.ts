import { Component } from '@angular/core';
import { UnverifiedUserComponent } from '../../shared/unverified-user/unverified-user.component';
import { SocketService } from '../../../services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'club-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
  sidebarOpen: boolean = false;
  isUserVerified: boolean = false;
  isNum: Number = 1;
  locksideBar: boolean = true;
  constructor(
    private authService: AuthService,
    private globalSettings: GlobalSettingsService,
    private socketService: SocketService,
    public dialog: MatDialog
  ) {

  }
  ngOnInit(): void {
    // Add any initialization logic if needed
    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
    this.getUserStatus();
  }

  getUserStatus() {
    this.socketService.getLoggedInUserStatus().then((result) => {
      // console.info('result',result)
      if (result == 2) {
        this.isUserVerified = true;
      } else {
        this.isUserVerified = false;
      }
      this.locksideBar = false;
    });
  }

  toggleState() {
    this.sidebarOpen = !this.sidebarOpen;

    // Toggle classes on body element
    if (!this.sidebarOpen) {
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

  showVerificationPopup() {
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
  }

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
}
