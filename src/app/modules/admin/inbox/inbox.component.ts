import { Component, inject } from '@angular/core';
import Talk from 'talkjs';
import { InboxPopupComponent } from './inbox-popup/inbox-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { SocketService } from '../../../services/socket.service';
import { TitleService } from '../../../title.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { ChatjsService } from '../../../services/chatjs.service';


@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  readonly dialog = inject(MatDialog);
  userData: any;
  groupName: string = '';
  groupId: string = '';
  users: any[] = [];
  newUser: { id: string; name: string; email: string; photoUrl: string }[] = [];
  createdGroups: { groupId: string, groupName: string }[] = [];
  user: any = {};
  receiverUser: any = {};
  pageTitle: string = '';
  private isDarkMode = false;
  apiUrl: string = environment?.apiUrl;
  isLoading: boolean = true;
  theme: string = 'default';
  constructor(
    private talkService: TalkService,
    private socketService: SocketService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private sharedservice: SharedService,
    private router: Router,
    private chatjs: ChatjsService,
    private globalSettings: GlobalSettingsService,
  ) { }


  async ngOnInit() {
    let themeStored = localStorage.getItem('theme') === 'dark' ? true : false;
    this.globalSettings.indexFunctionCall$.subscribe((data) => {
      console.log('Global Settings IndexFunction Call');
      themeStored = localStorage.getItem('theme') === 'dark' ? true : false;
      console.info('Theme in ChatComponent GlobalSettings IndexFunction Call is ', themeStored);

      const isDark = localStorage.getItem('theme') === 'dark';

      if ((window as any).ChatWidget?.updateTheme) {
        (window as any).ChatWidget.updateTheme(isDark);
      }
    });

    const script = document.createElement('script');
    script.src = 'https://bigstuffmovers.au/widget/build/static/js/main.c235f392.js';
    script.onload = () => {
      (window as any)['ChatWidget'].init({
        projectId: "soccer",
        userId: "45",
        token: "jwt-token",
        isDarkMode: themeStored,
        lang: localStorage.getItem('lang'),

        theme: {
          light: {
            primaryGreen: "#6FB95D",
            PrimaryRed: "#f93c65",
            primaryDarkBg: "#fff",
            secondaryDarkBg: "#ebeef2b3"
          },
          dark: {
            primaryGreen: "#BDE34F",
            PrimaryRed: "#f93c65",
            primaryDarkBg: "#072944",
            secondaryDarkBg: "#0C3453"
          }
        }
      });
    };
    document.body.appendChild(script);

    this.getJsonTranslations();
    this.sharedservice.data$.subscribe((data) => {
      if (data.action == 'lang_updated') {
        this.getJsonTranslations();
        // this.reloadChatComponent();
      }
    })
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      console.log('pic', this.userData)
      // this.user = {
      //   id: this.userData.id,
      //   name: this.userData.first_name,
      //   email: this.userData.username,
      //   photoUrl: this.userData.profile_image_path,
      //   welcomeMessage: null,
      //   role: "hidden"
      // };
      // const session = await this.talkService.init(this.user);
      // const chatbox = session.createInbox();


      // chatbox.onSendMessage((event) => {
      //   let getReceiverIds = Object.keys(event.conversation.participants)
      //     .filter(val => val != this.user.id);
      //   this.socketService.emit('sendMessage', { senderId: this.user.id, receiverIds: getReceiverIds });
      // });

      // // Defer mounting chatbox until next event loop cycle
      // setTimeout(() => {
      //   chatbox.mount(document.getElementById('talkjs-container'));

      // }, 0);
      // setTimeout(() => {
      //   this.isLoading = false;
      // }, 1500);

    }

    const theme = localStorage.getItem('theme');

    if (theme == 'dark') {
      this.talkService.toggleTheme(true);
    }
  }


  // reloadChatComponent() {
  //   const currentUrl = this.router.url;
  //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //     this.router.navigateByUrl(currentUrl);
  //   });
  // }



  // Start a one-on-one chat
  startOneOnOneChat(user: any) {
    this.receiverUser = user;
    this.socketService.emit('sendMessage', { senderId: this.user.id, receiverIds: [user.id] });
    // this.talkService.createOneOnOneConversation(user.id, user.name, user.email, user.photoUrl)
    //   .then(() => {
    //     this.talkService.mountChat('talkjs-container');
    //   })
    //   .catch(err => {
    //     console.error('Error starting chat:', err);
    //   });
  }



  // Start a group chat
  startGroupChat() {
    this.talkService.createGroupConversation(this.talkService.generateUniqueId(), this.users)
      .then(() => {
        this.talkService.mountChat('talkjs-container');
      })
      .catch(err => {
        console.error('Error starting group chat:', err);
      });
  }

  editinbox11() {
    this.users = [];
    this.dialog.open(InboxPopupComponent, {
      height: '450px',
      width: '760px',
      // height: '450px',
      // width: '760px',
    })
      .afterClosed()
      .subscribe(users => {
        if (this.users?.length > 0) {
          for (let user of users.data) {
            let full_name = 'Full Name';
            let currentRole = user?.role_name.toLowerCase();
            if (typeof user?.first_name !== undefined && user?.last_name != '') {
              full_name = user?.first_name + ' ' + user?.last_name;
            }
            if (typeof user?.role_name !== undefined && currentRole == 'club' || currentRole == 'clube' || currentRole == 'klub' || currentRole == 'klubb' && user?.current_club_logo != '') {
              user.meta.profile_image_path = this.apiUrl + '/uploads/' + user?.current_club_logo;
              // full_name = 
              if (user?.current_club_name && user?.current_club_name != '') {
                full_name = user.current_club_name;
              }
            }
            if (typeof user?.meta?.profile_image_path !== undefined && user?.meta?.profile_image_path != '') {
              user.profile_image_path = user?.meta?.profile_image_path;
            }



            // console.log('Modified User as ', user);
            this.users.push({
              id: user.id,
              name: full_name,
              email: user.username,
              photoUrl: user.profile_image_path,
            })
          }

          if (this.users.length == 1) {
            let chatWithUser = this.users[0];
            this.talkService.createOneOnOneConversation(chatWithUser.id, chatWithUser.name, chatWithUser.email, chatWithUser.photoUrl);
          } else if (this.users.length > 1) {
            this.startGroupChat();
          }
        }


        console.log('last users', this.users);
        //this.createGroup();
      });
  }

  startNewChat(user: any) {
    let users = [];

    users.push({
      id: user.id,
      name: user.first_name,
      email: user.username,
      photoUrl: user.profile_image_path,
    })

    if (users.length === 1) {
      // this.startOneOnOneChat(users[0]);
    } else if (users.length > 1) {
      this.startGroupChat();
    }
    console.log('last users', this.users);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const chatContainer = document.getElementById('talkjs-container');
    if (chatContainer) {
      if (this.isDarkMode) {
        chatContainer.classList.add('dark-theme');
        chatContainer.classList.remove('light-theme');
      } else {
        chatContainer.classList.add('light-theme');
        chatContainer.classList.remove('dark-theme');
      }
    }
  }


  toggleDarkMode(isDarkMode: boolean) {
    alert('testing');
    const iframe = document.querySelector('iframe[data-talkjs-container]') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      const iframeDocument = iframe.contentDocument;

      const htmlElement = iframeDocument.documentElement;

      if (isDarkMode) {
        htmlElement.style.setProperty('--background-color', '#1e1e1e');
        htmlElement.style.setProperty('--text-color', '#ffffff');
        htmlElement.style.setProperty('--message-sent-background-color', '#333333');
        htmlElement.style.setProperty('--message-received-background-color', '#2a2a2a');
      } else {
        htmlElement.style.setProperty('--background-color', '#ffffff');
        htmlElement.style.setProperty('--text-color', '#000000');
        htmlElement.style.setProperty('--message-sent-background-color', '#e6f7ff');
        htmlElement.style.setProperty('--message-received-background-color', '#f5f5f5');
      }
    }
  }
  // This method is called when the user toggles the dark mode switch
  onThemeToggle(isDarkModeEnabled: boolean): void {
    // Call the toggleTheme function from the service
    this.talkService.toggleTheme(isDarkModeEnabled);
  }

  getJsonTranslations() {
    this.translateService.get(['inbox']).subscribe((translations) => {
      this.pageTitle = translations['inbox'];
      this.titleService.setTitle(this.pageTitle);
    })
  }



  async checkAndRemoveOpenChat() {
    const url = new URL(window.location.href);
    url.searchParams.delete('open_chat');
    window.history.replaceState({}, document.title, url.toString());

    const otherUserData = localStorage.getItem('otherUserData');
    console.info('otherUserData', otherUserData)
    if (otherUserData) {
      const otherUser = JSON.parse(otherUserData);
      await this.talkService.createOneOnOneConversation(
        otherUser.id,
        otherUser.name,
        otherUser.email,
        otherUser.photoUrl
      );
    }
    setTimeout(() => (this.isLoading = false), 100);
  }


  // code by amrit
  async ngAfterViewInit() {
    const themeStored = localStorage.getItem('theme');
    this.theme = themeStored === 'dark' ? 'dark_custom_users' : 'default_users';
    document.body.classList.toggle('dark-mode', this.theme === 'dark_custom_users');
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    this.userData = JSON.parse(userDataString);

    if (this.userData.role === '2' && this.userData.club_logo_path) {
      this.userData.profile_image_path = this.userData.club_logo_path;
    }

    if (!this.userData.profile_image_path && this.userData.meta?.profile_image_path) {
      this.userData.profile_image_path = this.userData.meta.profile_image_path;
    }

    let nameOfUser = this.userData.first_name + ' ' + this.userData.last_name;
    let profileImgOfUser = this.userData.profile_image_path;
    if (typeof this.userData.role !== undefined && Number(this.userData.role) === 2) {
      nameOfUser = this.userData?.current_club_name;
      profileImgOfUser = this.userData.club_logo_path;
      // console.info('this.userData_nameOfUser', this.userData)
    }
    const user = {
      id: this.userData.id,
      name: nameOfUser,
      email: this.userData.username,
      photoUrl: profileImgOfUser,
      welcomeMessage: null,
      role: 'hidden'
    };

    // ✅ Set theme before init
    this.talkService.currentTheme = this.theme;
    let role;
    // if (this.userData.role && Number(this.userData.role) === 1) {
    //     role = 'hidden';
    // } else {

    // }
    this.talkService.setCurrentUserRoleAndId('hidden', this.userData.id);

    // ✅ Initialize session
    await this.talkService.init(user);

    // ✅ Mount inbox with theme
    this.talkService.mountInboxWithTheme();

    // Optional: handle open_chat param
    setTimeout(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('open_chat') === 'true') {
        this.checkAndRemoveOpenChat();
      } else {
        this.isLoading = false;
      }
    }, 1500);
  }


  // code by amrit
  editinbox() {
    this.users = [];
    this.dialog.open(InboxPopupComponent, {
      height: '450px',
      width: '760px',
    }).afterClosed().subscribe(async users => {
      if (!users?.data || !Array.isArray(users.data)) return;

      users.data.forEach((user: any) => {
        let full_name = user?.first_name + ' ' + user?.last_name;
        if (["club", "klub", "klubb", "clube"].includes(user?.role_name?.toLowerCase())) {
          if (user?.current_club_logo) {
            user.meta.profile_image_path = 'https://api.socceryou.ch/uploads/' + user.current_club_logo;
          }
          if (user?.current_club_name) {
            full_name = user.current_club_name;
          }
        }
        if (user.meta?.profile_image_path) {
          user.profile_image_path = user.meta.profile_image_path;
        }

        this.users.push({
          id: user.id,
          name: full_name,
          email: user.username,
          photoUrl: user.profile_image_path,
          role: user.role_id
        });
      });
      console.info('Users Selected for chats ', this.users)
      if (this.users.length === 1) {
        const u = this.users[0];
        this.chatjs.createOneOnOneConversation2(u.id, u.name, u.email, u.photoUrl, u.role);
        // await this.talkService.createOneOnOneConversation(u.id, u.name, u.email, u.photoUrl);
      } else if (this.users.length > 1) {
        // this.talkService.createGroupConversation(this.talkService['session']!.id + '_' + Date.now(), this.users);
        this.talkService.createGroupConversation(this.generateGroupId(), this.users);

      }
    });
  }

  generateGroupId(): string {
    const userIds = this.users.map(u => u.id).join('_');
    return 'SoccerYou_' + userIds + '_' + Date.now();
  }
}
