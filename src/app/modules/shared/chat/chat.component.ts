import { Component, inject } from '@angular/core';
import Talk from 'talkjs';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { ChatPopupComponent } from './chat-popup/chat-popup.component';
import { ActivatedRoute } from '@angular/router';
import { TitleService } from '../../../title.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../services/webpages.service';

@Component({
  selector: 'shared-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  readonly dialog = inject(MatDialog);
  userData: any;
  groupName: string = '';
  groupId: string = '';
  groupParticipants: { id: string, name: string, email: string, photoUrl: string }[] = [];
  users: { id: string; name: string; email: string; photoUrl: string }[] = [];
  newUser: { id: string; name: string; email: string; photoUrl: string }[] = [];
  createdGroups: { groupId: string, groupName: string }[] = [];
  user: any = {};
  chatBox: any;
  chatSession: any;
  isLoading: boolean = true;
  pageTitle: string = '';
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  constructor(
    private talkService: TalkService,
    private route: ActivatedRoute,
    private titleService: TitleService,
    private translateService: TranslateService,
    public webPages: WebPages,
  ) { }

  async ngOnInit() {
    this.getJsonTranslations();
    const userDataString = localStorage.getItem('userData');
    // alert(userDataString)
    console.warn('userDataString', userDataString)
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      this.user = {
        id: this.userData.id,
        name: this.userData.first_name,
        email: this.userData.username,
        photoUrl: this.userData.profile_image_path,
        welcomeMessage: null,
        role: (this.userData.role == '1') ? "hidden" : "default"
      };
      const session = await this.talkService.init(this.user);
      this.chatSession = session;
      // const chatbox = session.createInbox();
      this.chatBox = this.chatSession.createInbox();

      // Defer mounting chatbox until next event loop cycle
      setTimeout(() => {
        this.chatBox.mount(document.getElementById('talkjs-container'));
        // chatbox.mount(document.getElementById('talkjs-container'));
      }, 500);
    }
    setTimeout(() => {
      this.checkAndRemoveOpenChat();
    }, 3000);
    this.webPages.languageId$.subscribe((data) => {
      this.getJsonTranslations();
      let theme = localStorage.getItem('theme');
      if (theme == 'dark') {
        setTimeout(() => {
          this.talkService.toggleTheme(true);
        }, 2000);
      }
      console.info('currentTheme is '+theme)
    });
  }



  // Start a one-on-one chat
  startOneOnOneChat(user: any) {
    // console.info('Recived User is ',user);
    this.talkService.createOneOnOneConversation(user.id, user.name, user.email, user.photoUrl)
      .then(() => {
        this.talkService.mountChat('talkjs-container');

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      })
      .catch(err => {
        console.error('Error starting chat:', err);
      });
  }



  // Start a group chat
  startGroupChat() {
    this.talkService.createGroupConversation(this.talkService.generateUniqueId(), this.users)
      .then(() => {
        this.talkService.mountChat('talkjs-container');
      })
      .catch((err: any) => {
        console.error('Error starting group chat:', err);
      });
  }

  editinbox() {
    this.users = [];
    this.dialog.open(ChatPopupComponent, {
      height: '450px',
      width: '760px',
    })
      .afterClosed().subscribe(users => {
        console.info(users.data)
        for (let user of users.data) {
          console.info('User is ', user)
          // if (user.profile_image_path != '' && user.profile_image_path != undefined) {

          // } else
          //  if (user.profile_image != '' && user.profile_image != undefined) {
          //   user.profile_image = 'https://api.socceryou.ch/uploads/' + user.profile_image;
          // }
          this.users.push({
            id: user.id,
            name: user.first_name, // The opened chat options Here
            email: user.username,
            photoUrl: this.baseUrl + user.meta.profile_image,
          })
        }
        if (this.users.length == 1) {
          this.startOneOnOneChat(this.users[0]);
        } else if (this.users.length > 1) {
          this.startGroupChat();
        }
        console.log('last users', this.users);
        //this.createGroup();
      });
  }

  startNewChat(user: any) {
    let users = [];

    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
    })

    if (users.length === 1) {
      this.startOneOnOneChat(users[0]);
    } else if (users.length > 1) {
      this.startGroupChat();
    }
    console.info('last users', users);
  }

  ngOnDestroy() {
    // localStorage.removeItem('otherUserData');
    // Clean up the TalkJS chatbox
    if (this.chatBox) {
      this.chatBox.destroy();
      this.chatBox = null; // Reset chatbox reference to null
    }

    // Clean up the TalkJS session
    if (this.chatSession) { //this.chatSession
      this.chatSession.destroy();
      this.chatSession = null; // Reset session reference to null
    }

    // Ensure any TalkJS UI elements are removed from the DOM
    const existingContainer = document.getElementById('talkjs-container');
    if (existingContainer) {
      existingContainer.innerHTML = ''; // Clear the content of the container
    }

    // Optional: Reset any other component-related data or properties
    // For example, you might want to reset user-specific data
    this.user = {};
    this.users = [];
    this.userData = null;
  }


  getJsonTranslations() {
    this.translateService.get(['chat']).subscribe((translations) => {
      this.pageTitle = translations['chat'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

  checkAndRemoveOpenChat() {
    let url = new URL(window.location.href);

    if (url.searchParams.get("open_chat") === "true") {
      url.searchParams.delete("open_chat");
      window.history.replaceState({}, document.title, url.toString()); // ✅ no reload
    }

    const otherUserData = localStorage.getItem('otherUserData');

    if (otherUserData) {
      const otherUser = JSON.parse(otherUserData);
      // this.startOneOnOneChat(otherUser);
      this.talkService.startChatWithUser(otherUser);
      // localStorage.setItem('otherUserData','');
    }

    setTimeout(() => {
      this.isLoading = false;
      // const theme = localStorage.getItem('theme');
      // if (theme === 'dark') {
      //   this.talkService.toggleTheme(true);
      // }
    }, 1500);
  }

}