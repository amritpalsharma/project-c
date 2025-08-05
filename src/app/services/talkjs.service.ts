/* --- Chat Service --- */
import { Injectable } from '@angular/core';
import Talk from 'talkjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class TalkService {
  private session: Talk.Session | null = null;
  public currentUser: Talk.User | null = null;
  currentTheme: string = localStorage.getItem('theme') == 'dark' ? 'dark_custom_users' : 'default_users';
  public currentUserRole: string = '';
  public currentUserId: string = '';
  private talkSession: Talk.Session | null = null;
  private inbox: Talk.Inbox | null = null;

  private currentLoggedInUser: any;
  private chatMode: string = this.socketService.getChatMode();

  constructor(public router: Router, private socketService: SocketService) {

  }
  async init(user: any): Promise<Talk.Session> {

    let authToken = localStorage.getItem('authToken');
    const res = await fetch('https://api.socceryou.ch/api/get-talk-signature', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    console.error('Chat Init ', user)
    console.error('Api Response Talk ', data)
    this.currentLoggedInUser = user;

    console.error("Signature received from backend:", data.signature);

    if (!data.signature) {
      console.error('No valid signature received from backend.');
      // return;
    }
    await Talk.ready;
    this.currentUser = new Talk.User({
      id: String(user.id),
      // id: user.id.toString(), // ✅ must be string
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      welcomeMessage: null,
      role: user.role || 'default',
      locale: localStorage.getItem('lang') || 'de'
      // role: 'default'
    });
    let appID;
    let secretKey;
    if (this.chatMode == 'live') {
      appID = 'UAid8HWJ';
      // secretKey = 'sk_live_aJEAQN0XdY4f9NbrK0YP9muJyahXWzj3';
    } else {
      appID = 'tmI75KXB';
      // secretKey = 'sk_test_llIR3hv00wvqHx8DDp6MWBvObF7BScP8';
    }
    appID = 'tmI75KXB';
    this.session = new Talk.Session({
      appId: appID,
      me: this.currentUser,
      // signature: data.signature,
      // token: String(authToken)
    });


    // Code FOr First Time Theme
    if (!this.session) {
      console.error('TalkJS session not initialized');
      // return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    this.inbox = this.session.createInbox({
      theme: this.currentTheme
    });
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
    return this.session;
  }



  async createGroupConversation(convoId: string, users: any[]): Promise<void> {
    const talkUsers = users.map(user => new Talk.User(user));
    const conversation = this.session!.getOrCreateConversation(convoId);

    talkUsers.forEach(user => conversation.setParticipant(user));

    const inbox = this.session!.createInbox();
    inbox.select(conversation);
    inbox.mount(document.getElementById('talkjs-container')!);
  }

  mountChat(containerId: string): void {
    const inbox = this.session!.createInbox();
    inbox.mount(document.getElementById(containerId)!);
  }


  public generateUniqueId(): string {
    return `soccerYou-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  toggleTheme(isDark: boolean) {
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
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
  }


  changeLocale(newLocale: string) {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }




  mountInboxWithTheme(conversation?: Talk.Conversation) {
    const inbox = this.session!.createInbox({
      theme: this.currentTheme // ✅ theme applied here
    });

    if (conversation) {
      inbox.select(conversation);
    }

    inbox.mount(document.getElementById('talkjs-container')!);
  }

  setCurrentUserRoleAndId(role: string, id: string) {
    this.currentUserRole = role;
    this.currentUserId = id;
  }


  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  async createOneOnOneConversation(
    userId: string,
    name: string,
    email: string,
    photoUrl: string
  ): Promise<void> {
    try {
      const ADMIN_ID = '1';
      const currentLang = localStorage.getItem('lang') || 'de';


      if (!this.session && this.currentUser) {
        await this.init(this.currentUser);
      }


      if (this.currentUserRole !== '1' && userId === ADMIN_ID) {
        console.warn('Regular users cannot chat with admin.');
        return;
      }

      const otherUserConsole = {
        id: userId,
        name: name,
        email: email,
        photoUrl: this.getValidPhotoUrl(photoUrl),
        role: 'default',
        locale: currentLang
      };

      console.info("CHAT WITH ", otherUserConsole);

      const otherUser = new Talk.User({
        id: userId,
        name: name,
        email: email,
        photoUrl: this.getValidPhotoUrl(photoUrl),
        role: 'default',
        locale: currentLang
      });


      const hiddenAdmin = new Talk.User({
        id: '1',
        name: 'Succer You Sports AG',
        email: 'testmails.cts@gmail.com',
        role: 'hidden',

      });
      const conversationId = Talk.oneOnOneId(this.currentUser!, otherUser);
      const conversation = this.session!.getOrCreateConversation(conversationId);

      conversation.setParticipant(this.currentUser!);
      conversation.setParticipant(otherUser);
      // conversation.setParticipant(hiddenAdmin);

      conversation.setAttributes({
        //photoUrl: this.getValidPhotoUrl(photoUrl, true), // For conversation header
      });


      if (this.inbox) {
        this.inbox.destroy();
      }

      this.inbox = this.session!.createInbox({
        theme: this.currentTheme,

      });

      this.inbox.select(conversation);
      this.inbox.mount(document.getElementById('talkjs-container')!);
    } catch (err) {
      console.error('Error in createOneOnOneConversation:', err);
    }
  }



  private getValidPhotoUrl(photoUrl: string | undefined, appendTimestamp: boolean = false): string {
    const fallback = 'https://api.socceryou.ch/uploads/default_talent_img.png';

    // Handle undefined/null
    if (!photoUrl || !this.isValidImageUrl(photoUrl) || photoUrl.includes('/undefined')) {
      return fallback;
    }

    // Cache busting
    let validatedPhoto = photoUrl;
    if (appendTimestamp) {
      const separator = validatedPhoto.includes('?') ? '&' : '?';
      validatedPhoto += `${separator}ts=${Date.now()}`;
    }

    return validatedPhoto;
  }


}