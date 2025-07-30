/* --- Chat Service --- */
import { Injectable } from '@angular/core';
import Talk from 'talkjs';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TalkService {
  private session: Talk.Session | null = null;
  private currentUser: Talk.User | null = null;
  currentTheme: string = localStorage.getItem('theme') == 'dark' ? 'dark_custom_users' : 'default_users';
  public currentUserRole: string = '';
  public currentUserId: string = '';
  private talkSession: Talk.Session | null = null;
  private inbox: Talk.Inbox | null = null;

  private currentLoggedInUser: any;

  constructor(public router: Router) {

  }
  async init(user: any): Promise<Talk.Session> {
    // console.info('Chat Init ', user)
    this.currentLoggedInUser = user;

    await Talk.ready;
    this.currentUser = new Talk.User({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      welcomeMessage: null,
      role: user.role || 'default',
      locale: localStorage.getItem('lang') || 'de'
      // role: 'default'
    });

    this.session = new Talk.Session({
      appId: 'tmI75KXB', // testt
      // appId: 'UAid8HWJ',
      me: this.currentUser,
    });


    // Code FOr First Time Theme
    if (!this.session) {
      console.error('TalkJS session not initialized');
      // return;
    }
    if (this.inbox) {
      this.inbox.destroy();
    }
    console.info('Chat init with theme '+this.currentTheme)
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

      // Init TalkJS session if not already initialized
      if (!this.session && this.currentUser) {
        await this.init(this.currentUser);
      }

      // Block regular users from chatting with admin
      if (this.currentUserRole !== '1' && userId === ADMIN_ID) {
        console.warn('Regular users cannot chat with admin.');
        return;
      }

      // Create the other user object
      const otherUser = new Talk.User({
        id: userId,
        name: name,
        email: email,
        photoUrl: this.getValidPhotoUrl(photoUrl),
        role: 'default',
        locale: currentLang
      });

      // Create hidden admin user (reuse if exists)
      const hiddenAdmin = new Talk.User({
        id: '1',
        name: 'Succer You Sports AG',
        email: 'testmails.cts@gmail.com',
        role: 'hidden',
        // photoUrl: 'https://yourdomain.com/admin-avatar.png'
      });
      const conversationId = Talk.oneOnOneId(this.currentUser!, otherUser);
      const conversation = this.session!.getOrCreateConversation(conversationId);

      conversation.setParticipant(this.currentUser!);
      conversation.setParticipant(hiddenAdmin);
      conversation.setParticipant(otherUser);

      conversation.setAttributes({
        subject: name,
        // photoUrl: this.getValidPhotoUrl(photoUrl, true), // For conversation header
      });

      // DESTROY existing inbox before mounting new one
      if (this.inbox) {
        this.inbox.destroy();
      }

      this.inbox = this.session!.createInbox({
        theme: this.currentTheme,
        // locale: currentLang,
      });

      this.inbox.select(conversation);
      this.inbox.mount(document.getElementById('talkjs-container')!);
    } catch (err) {
      console.error('Error in createOneOnOneConversation:', err);
    }
  }

  private getValidPhotoUrl(photoUrl: string, appendTimestamp: boolean = false): string {
    const fallback = 'https://api.socceryou.ch/uploads/default_talent_img.png';
    let validatedPhoto = this.isValidImageUrl(photoUrl) ? photoUrl : fallback;

    if (validatedPhoto.includes('/undefined')) {
      validatedPhoto = fallback;
    }

    if (appendTimestamp) {
      validatedPhoto += validatedPhoto.includes('?') ? '&' : '?';
      validatedPhoto += `ts=${Date.now()}`;
    }

    return validatedPhoto;
  }


}