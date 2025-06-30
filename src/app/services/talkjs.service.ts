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
      let parseArr = JSON.parse(currentUserArr);
      this.currentUser = parseArr;

      if (this.currentUser?.role && this.currentUser?.role == 2) {
        this.currentUser = {
          id: parseArr.id,
          name: parseArr.first_name + ' ' + parseArr.last_name,
          email: parseArr.email,
          photoUrl: parseArr?.meta?.profile_image_path,
          role: 'default',
        };
      } else {

      }
      this.currentUser = {};
      console.info('this.currentUserthis.currentUser', this.currentUser)
      //   
    }

  }
  matPrimary = false;
  // currentTheme: any = localStorage.getItem('theme') == 'dark' ? 'dark_custom' : 'default';
  currentTheme: any = localStorage.getItem('theme') == 'dark' ? 'dark_custom_users' : 'default_users';
  // currentTheme: any = 'dark_custom';
  currentLocale: string = localStorage.getItem('lang') || this.globalSettings.getLanguage();
  otherUserDataArr: any;

  // Generate a unique ID using Date and Math.random
  public generateUniqueId(): string {
    return `soccerYou-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }



  async init(userData: any): Promise<Talk.Session> {
    let themeFirstTym;
    if (this.currentTheme === 'dark') {
      themeFirstTym = 'dark_custom_users';
    } else {
      themeFirstTym = 'default_users';
    }
    let storage_theme = localStorage.getItem('theme');
    console.info('this.currentTheme is ' + this.currentTheme + ' And Storage theme is ' + storage_theme, 'And Current User Is ',userData);
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
    this.toggleThemeInit(this.currentTheme)
    return this.session;
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

      // Add all other users to the conver
      // sation
      userList.forEach(user => {
        console.info('GroupMember', user)
        const participant = new Talk.User({
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
          // welcomeMessage: 'Hey there! How can I help?',
          role: 'default'
        });
        conversation.setParticipant(participant);
      });

      const hiddenUser = new Talk.User({
        id: 1,
        name: 'Succer You Sports AG',
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
    console.log('isDark', isDark);
    let theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    this.currentTheme = isDark ? 'dark_custom_users' : 'default_users';

    if (!this.session) {
      console.error('TalkJS session not initialized');
      return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    this.inbox = this.session.createInbox({
      theme: isDark ? 'dark_custom_users' : 'default_users'
    });

    // Optionally re-mount immediately or allow the component to handle mounting
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
    console.log('themem set is ', theme);
  }

  toggleThemeInit(currentTheme: string): void {
    if (!this.session) {
      console.error('TalkJS session not initialized');
      return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    console.info('Init Tym theme is ' + currentTheme)
    this.inbox = this.session.createInbox({
      theme: currentTheme
    });

    // Optionally re-mount immediately or allow the component to handle mounting
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
  }

  changeLocale(locale: string) {
    this.currentLocale = locale;
  }


  async createOneOnOneConversation(
    id: string,
    name: string,
    email: string,
    photoUrl: string
  ): Promise<void> {
    // Validate TalkJS initialization
    if (!this.user || !this.session) {
      throw new Error('TalkJS user/session is not initialized');
    }

    // Container element check
    const container = document.getElementById('talkjs-container');
    if (!container) {
      throw new Error('TalkJS container element not found');
    }

    try {
      // Process profile image with cache busting
      const validatedPhoto = this.isValidImageUrl(photoUrl)
        ? photoUrl
        : 'https://api.socceryou.ch/uploads/default_talent_img.png';
      let finalPhotoUrl = `${validatedPhoto}${validatedPhoto.includes('?') ? '&' : '?'}ts=${Date.now()}`;
      if (finalPhotoUrl.includes("/undefined")) {
        finalPhotoUrl = 'https://api.socceryou.ch/uploads/default_talent_img.png';
      }
      // Create conversation participant
      const otherUser = new Talk.User({
        id,
        name,
        email,
        photoUrl: finalPhotoUrl,
        role: 'default',
        welcomeMessage: null
      });

      // Create hidden admin user (reuse if exists)
      const hiddenAdmin = new Talk.User({
        id: '1',
        name: 'Succer You Sports AG',
        email: 'testmails.cts@gmail.com',
        role: 'hidden',
        // photoUrl: 'https://yourdomain.com/admin-avatar.png'
      });

      // Get or create conversation
      const conversationId = Talk.oneOnOneId(this.user, otherUser);
      const conversation = this.session.getOrCreateConversation(conversationId);

      // Set participants (idempotent)
      conversation.setParticipant(this.user);
      conversation.setParticipant(otherUser);
      conversation.setParticipant(hiddenAdmin);

      // ✅ Force correct name and image in the chat header
      // conversation.setAttributes({
      //   subject: name, // Name in header
      //   photoUrl: finalPhotoUrl, // Image in header
      //   custom: {
      //     search: `${this.user.name} ${name}`.toLowerCase()
      //   }
      // });
      console.info('OtherUserProfileFound', finalPhotoUrl)
      // Set search metadata
      conversation.setAttributes({
        photoUrl: finalPhotoUrl, // Image in header
        custom: {
          // role:'hidden',
          // search: `${this.user.name} ${otherUser.name}`.toLowerCase()
        }
      });

      // Initialize or update inbox
      if (!this.inbox) {
        this.inbox = this.session.createInbox();
        this.inbox.mount(container);
      }

      // Activate conversation
      await this.inbox.select(conversation);

    } catch (error) {
      console.error('TalkJS conversation error:', error);
      throw new Error('Failed to start conversation');
    }
  }

  // Helper function for image validation
  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }


  async refreshTalkSessionWithUpdatedImage(userData: any): Promise<void> {
    console.info('User For Chat', userData);
    try {
      // ✅ Destroy previous session if exists
      if (this.session) {
        this.session.destroy();
      }

      // ✅ Apply cache busting to photoUrl
      const cacheBustedPhotoUrl = `${userData.photoUrl}?t=${Date.now()}`;

      // ✅ Create Talk User
      const talkUser = new Talk.User({
        id: userData.id,
        name: userData.name || 'Talk User',
        email: userData.email || '',
        photoUrl: cacheBustedPhotoUrl,
        role: userData.role === '1' ? 'hidden' : 'default',
        locale: this.currentLocale
      });

      // ✅ Create new TalkJS session
      this.session = new Talk.Session({
        appId: 'tmI75KXB', // Replace with your actual app ID
        me: talkUser
      });

      this.user = talkUser;

      // ✅ Destroy and re-create inbox
      if (this.inbox) {
        this.inbox.destroy();
      }

      this.inbox = this.session.createInbox({
        theme: this.currentTheme === 'dark' ? 'dark_custom_users' : 'default_users'
      });

      const container = document.getElementById('talkjs-container');
      if (!container) {
        throw new Error('TalkJS container element not found');
      }

      // ✅ Mount inbox
      this.inbox.mount(container);

      // ✅ Optionally store user in localStorage or class state
      this.currentUser = userData;

      // ✅ Create or open conversation with passed user
      const conversation = this.session.getOrCreateConversation(Talk.oneOnOneId(this.user, new Talk.User(userData)));
      // const conversation = this.session.getOrCreateConversation([this.user, new Talk.User(userData)]);

      // ✅ Select and open the conversation in the inbox
      this.inbox.select(conversation);

      console.log('✅ TalkJS session refreshed with updated image, and conversation opened');
    } catch (err) {
      console.error('❌ Error refreshing TalkJS session:', err);
      throw err;
    }
  }




  private getCurrentUserData() {
    console.info('Me ', this.currentUser);
    // Return your actual current user data from state/service
    return this.currentUser;
  }

  startChatWithUser(otherUserData: any) {
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
        // locale: this.localeFirstTime
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
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        inbox = session.createInbox({ theme: 'dark_custom_users' });
      } else {
        inbox = session.createInbox();
      }
      inbox.select(conversation); // optional: opens the specific chat
      inbox.mount(document.getElementById('talkjs-container'));

      // if (conversation?.id) {
      //   this.selectedConversationId = conversation.id;
      // }
    }
  }

}