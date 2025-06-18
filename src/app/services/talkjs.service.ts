import { Injectable, AfterViewChecked } from '@angular/core';
import Talk from 'talkjs';
import { GlobalSettingsService } from './global-settings.service';

@Injectable({
  providedIn: 'root',
})
export class TalkService {
  private session: Talk.Session | null = null;
  private user: Talk.User | undefined;
  private inbox: Talk.Inbox | undefined;
  private me: Talk.User | undefined;
  currentUser: any;
  private currentConversationId!: string;


  constructor(private globalSettings: GlobalSettingsService) {
    let currentUserArr = localStorage.getItem('userData');
    if (typeof currentUserArr !== undefined && currentUserArr != '' && typeof currentUserArr == 'string') {
      //   let parseArr = JSON.parse(currentUserArr);

      //   this.currentUser = new Talk.User({
      //     id: parseArr.id,
      //     name: parseArr.first_name + ' ' + parseArr.last_name,
      //     email: parseArr.email,
      //     photoUrl: parseArr.meta.profile_image_path,
      //     role: 'default',
      //   });
    }

  }
  matPrimary = false;
  currentTheme: any = localStorage.getItem('theme') == 'light' ? 'default' : 'dark_custom';
  currentLocale: string = localStorage.getItem('lang') || this.globalSettings.getLanguage();
  otherUserDataArr: any;

  // Generate a unique ID using Date and Math.random
  public generateUniqueId(): string {
    return `group-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  // async init(user: { id: string; name: string; email: string; photoUrl: string, role: string }) {
  //   console.log('with Chat Image ', user);

  //   const otherUserDataRaw = localStorage.getItem('otherUserData');

  //   if (otherUserDataRaw) {
  //     try {
  //       const otherUserData = JSON.parse(otherUserDataRaw);
  //       this.otherUserDataArr = otherUserData;
  //       this.startChatWithUser(otherUserData);
  //     } catch (e) {
  //       console.error('Failed to parse otherUserData from localStorage:', e);
  //     }
  //   }
  //   await Talk.ready;

  //   this.user = new Talk.User({
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     photoUrl: user.photoUrl,
  //     welcomeMessage: null,
  //     role: user.role,
  //     locale: this.currentLocale
  //     // theme: this.currentTheme
  //   });

  //   this.session = new Talk.Session({
  //     appId: 'tmI75KXB', //tHcyGZjg //tmI75KXB:live
  //     me: this.user,
  //   });
  //   return this.session;
  // }

  async init(userData: any): Promise<Talk.Session> {
    let themeFirstTym;
    if (this.currentTheme === 'dark') {
      themeFirstTym = 'dark_custom';
    } else {
      themeFirstTym = 'default';
    }
    await Talk.ready;

    const talkUser = new Talk.User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      photoUrl: userData.photoUrl,
      welcomeMessage: null,
      role: userData.role == '1' ? 'hidden' : 'default',
      locale: this.currentLocale,
      // theme: themeFirstTym
    });

    this.user = talkUser;
    this.session = new Talk.Session({
      appId: 'tmI75KXB',
      me: this.user,
      // theme: themeFirstTym
    });
    this.toggleTheme30042025(this.currentTheme)
    return this.session;
  }

  // Create a one-on-one conversation
  createOneOnOneConversation(id: string, name: string, email: string, photoUrl: string): Promise<void> {

    return new Promise((resolve, reject) => {
      if (!this.user || !this.session) {
        reject('User is not initialized');
        return;
      }

      // photoUrl = photoUrl + '?' + Math.random();
      let userArr = { id: id, name: name, email: email, photoUrl: photoUrl };
      console.info('user recived to create converstaion ', userArr);
      const otherUser = new Talk.User({
        id: id,
        name: name,
        email: email,
        photoUrl: userArr.photoUrl,
        welcomeMessage: null,
        role: 'default'
      });
      const conversation = this.session.getOrCreateConversation(Talk.oneOnOneId(this.user, otherUser));

      const hiddenUser = new Talk.User({
        id: 1,
        name: 'testmails.cts@gmail.com',
        email: 'testmails.cts@gmail.com',
        role: 'hidden'
      });

      console.info('this.user',this.user);
      conversation.setParticipant(this.user);
      conversation.setParticipant(otherUser);
      conversation.setParticipant(hiddenUser);
      // if (!this.inbox) {
      //   this.inbox = this.session.createInbox({ selected: conversation });
      // } else {
      //   this.inbox.select(conversation);
      // }

      // ✅ Only create inbox once
      if (!this.inbox) {

        // this.inbox = this.session.createInbox();
        if (this.currentTheme === 'dark') {
          this.inbox = this.session.createInbox({ theme: 'dark_custom' });
        } else {
          this.inbox = this.session.createInbox({ theme: 'default' });
        }
        this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
      }
      // ✅ Just select conversation if inbox already exists
      this.inbox.select(conversation);
      resolve();
    });
  }

  // Create a group conversation with multiple users
  createGroupConversation(groupName: string, userList: { id: string; name: string; email: string; photoUrl: string }[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.user || !this.session) {
        reject('User is not initialized');
        return;
      }


      // Generate a unique conversation ID
      const conversationId = this.generateUniqueId();


      // Create a new group conversation
      const conversation = this.session.getOrCreateConversation(conversationId);
      conversation.setAttributes({
        subject: groupName
      });

      // Add the current user
      conversation.setParticipant(this.user);

      // Add all other users to the conversation
      userList.forEach(user => {
        const participant = new Talk.User({
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
          welcomeMessage: 'Hey there! How can I help?',
          role: 'default'
        });
        conversation.setParticipant(participant);
      });

      const hiddenUser = new Talk.User({
        id: 1,
        name: '',
        email: 'testmails.cts@gmail.com',
        role: 'hidden'
      });
      conversation.setParticipant(hiddenUser);

      if (!this.inbox) {
        this.inbox = this.session.createInbox({ selected: conversation });
      } else {
        this.inbox.select(conversation);
      }

      resolve();
    });
  }

  // Mount the chat UI to a container
  mountChat(containerId: string): void {
    if (this.inbox) {
      this.inbox.mount(document.getElementById(containerId) as HTMLElement);
    }
  }


  toggleTheme(isDark: boolean) {
    let theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    this.currentTheme = isDark ? 'dark_custom' : 'light';

    if (!this.session) {
      console.error('TalkJS session not initialized');
      return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    this.inbox = this.session.createInbox({
      theme: isDark ? 'dark_custom' : 'default'
    });

    // Optionally re-mount immediately or allow the component to handle mounting
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);

  }

  toggleTheme30042025(currentTheme: string): void {
    if (!this.session) {
      console.error('TalkJS session not initialized');
      return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    this.inbox = this.session.createInbox({
      theme: currentTheme
    });

    // Optionally re-mount immediately or allow the component to handle mounting
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
  }

  changeLocale(locale: string) {
    this.currentLocale = locale;
  }

  startChatWithUser(otherUserData: any) {
    console.log('Recived User For Chat to Direct Chat', otherUserData);
    if (otherUserData) {
      let userData;
      // let userData = JSON.parse(otherUserData);
      try {
        userData = JSON.parse(otherUserData);
      } catch (e) {
        userData = otherUserData;
      }
      // console.info('User Recived In Talk js servie ', userData);
      let chatPersonName = '';
      if (typeof userData.name === 'undefined' || userData.name === '') {
        userData.name = 'Talk User';
      }

      if (typeof userData.profile_image === 'undefined' || userData.profile_image === '') {
        console.info('userData.profile_image not found ' + userData.profile_image + ' && userData.photoUrl ' + userData.photoUrl)
        // userData.name = 'Talk User';
        if (userData.photoUrl !== undefined && userData.photoUrl !== null && userData.photoUrl !== '') {
          userData.profile_image = userData.photoUrl;
        }
      }

      let userArr = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        // email: userData.username,
        photoUrl: userData.profile_image,
        welcomeMessage: null,
        role: (userData.role == '1') ? "hidden" : "default",
        locale: this.currentLocale
      };

      if (typeof userArr.name === undefined || userArr.name == '') {
        userArr.name = 'Talk User';
      }



      const currentUser = new Talk.User(userArr);
      const otherUser = new Talk.User(otherUserData);

      const session = new Talk.Session({ appId: 'tmI75KXB', me: currentUser });

      const conversation = session.getOrCreateConversation(Talk.oneOnOneId(currentUser, otherUser));

      conversation.setParticipant(currentUser);
      conversation.setParticipant(otherUser);
      // this.selectedConversationId = conversation.id;
      const conversationId = Talk.oneOnOneId(currentUser, otherUser);
      // session.updateUser(otherUser);
      // this.selectedConversationId = conversationId;

      let inbox;
      // const theme = localStorage.getItem('theme');
      if (this.currentTheme === 'dark') {
        inbox = session.createInbox({ theme: 'dark_custom' });
      } else {
        inbox = session.createInbox({ theme: 'default' });
      }
      inbox.select(conversation); // optional: opens the specific chat
      inbox.mount(document.getElementById('talkjs-container'));
    }
  }

}