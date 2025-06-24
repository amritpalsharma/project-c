import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
  sidebarOpen: boolean = false;
  loggedInUser: any = localStorage.getItem('userInfo');
  isNum: Number = 1;

  constructor(
    private authService: AuthService,
    private globalSettings: GlobalSettingsService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(this.loggedInUser);

    if (this.isNum == 1 && window.innerWidth >= 992) {
      document.body.classList.remove('compact-sidebar');
      document.body.classList.add('mobile-sidebar-active');
      this.isNum = 0;
    }
    console.log('shared sidebar');
    console.info('this.loggedInUser', this.loggedInUser);
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

  role(role: any) {
    if (role == 'Club') return "club";
    else if (role == 'Scout') return "scout";
    else return "talent";
  }

  logout() {
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
}
