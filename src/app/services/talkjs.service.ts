/* --- Chat Service --- */
import { Injectable } from '@angular/core';
import Talk from 'talkjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from './socket.service';
import { environment } from '../../environments/environment';

import { MatDialog } from '@angular/material/dialog';
import { TalkJsHelperComponent, ConfirmDialogData } from '../modules/shared/talk-js-helper/talk-js-helper.component';
import { NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

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
  clientEmail: string = 'testmails.cts@gmail.com';
  private apiUrl: string = environment?.apiUrl;

  constructor(
    public router: Router,
    private socketService: SocketService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private ngZone: NgZone,
    private toaster: ToastrService,
  ) {

  }
  async init(user: any): Promise<Talk.Session> {

    // 🔄 Fetch both appId and signature from backend
    const res = await fetch(this.apiUrl + '/get-talk-signature?chatMode=' + this.chatMode, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    let appID = ''; // testkey
    if (data?.chatMode && data?.chatMode == 'live') {
      this.clientEmail = 'info@socceryou.ch';
    }

    if (!data.signature || !data.appId) {
      console.error('Missing appId or signature in response.');
    } else {
      appID = data.appId;
    }


    this.currentLoggedInUser = user;


    await Talk.ready;
    this.currentUser = new Talk.User({
      id: String(user.id),
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      welcomeMessage: null,
      role: user.role || 'default',
      locale: localStorage.getItem('lang') || 'de'
      // role: 'default'
    });

    this.session = new Talk.Session({
      appId: appID,
      me: this.currentUser,
      tokenFetcher: async () => {
        return data.signature;
      }
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
      theme: this.currentTheme,
      conversationActions: [
        { id: 'delete_convo', label: this.getDeleteLabel(String(localStorage.getItem('lang'))), icon: 'trash' }
      ]
    } as any);
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
    this.registerConversationActionHandler(); // <-- add this line
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
    // const inbox = this.session!.createInbox({
    //   theme: this.currentTheme // ✅ theme applied here
    // });

    const inbox = this.session!.createInbox({
      theme: this.currentTheme,
      conversationActions: [
        { id: 'delete_convo', label: this.getDeleteLabel(String(localStorage.getItem('lang'))), icon: 'trash' }
      ]
    } as any);

    if (conversation) {
      inbox.select(conversation);
    }

    inbox.mount(document.getElementById('talkjs-container')!);
    this.registerConversationActionHandler();
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
      console.info('chat with  profile ', photoUrl);
      const ADMIN_ID = '1';
      const currentLang = localStorage.getItem('lang') || 'de';


      if (!this.session && this.currentUser) {
        await this.init(this.currentUser);
      }


      if (this.currentUserRole !== '1' && userId === ADMIN_ID) {
        console.warn('Regular users cannot chat with admin.');
        return;
      }

      // const otherUserConsole = {
      //   id: userId,
      //   name: name,
      //   email: email,
      //   photoUrl: this.getValidPhotoUrl(photoUrl),
      //   role: 'default',
      //   locale: currentLang
      // };

      // console.info("CHAT WITH ", otherUserConsole);

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
        email: this.clientEmail,
        role: 'admin',
        // photoUrl: this.getValidPhotoUrl(photoUrl),
      });
      const conversationId = Talk.oneOnOneId(this.currentUser!, otherUser);
      const conversation = this.session!.getOrCreateConversation(conversationId);

      // conversation.setParticipant(hiddenAdmin);
      conversation.setParticipant(this.currentUser!);
      conversation.setParticipant(otherUser);

      // conversation.setAttributes({
      //   photoUrl: this.getValidPhotoUrl(photoUrl, true), // For conversation header
      // });


      if (this.inbox) {
        this.inbox.destroy();
      }

      this.inbox = this.session!.createInbox({
        theme: this.currentTheme,
        conversationActions: [
          { id: 'delete_convo', label: this.getDeleteLabel(String(localStorage.getItem('lang'))), icon: 'trash' }
        ]
      } as any);

      this.inbox.select(conversation);
      this.inbox.mount(document.getElementById('talkjs-container')!);
      this.registerConversationActionHandler(); // <-- add this line
    } catch (err) {
      console.error('Error in createOneOnOneConversation:', err);
    }
  }



  private getValidPhotoUrl(photoUrl: string | undefined, appendTimestamp: boolean = false): string {
    const fallback = 'https://api.socceryou.ch/uploads/default_talent_img.png';

    if (typeof photoUrl === undefined) {
      console.info('photo url is undefined ', photoUrl, 'typeof photoUrl ', typeof photoUrl);
      return fallback + '?ts=' + Date.now();
    }

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

  private conversationActionSubscription: any = null;
  // helper to register handler (add to class)
  private registerConversationActionHandler() {
    if (!this.inbox) return;

    // there is text

    // unsubscribe previous
    try {
      if (this.conversationActionSubscription && this.conversationActionSubscription.unsubscribe) {
        this.conversationActionSubscription.unsubscribe();
      }
    } catch (e) { /* ignore */ }
    this.conversationActionSubscription = null;

    // listen for `delete` action
    this.conversationActionSubscription = this.inbox.onCustomConversationAction('delete_convo', async (event: any) => {
      try {
        const conversationId = event?.conversation?.id;
        if (!conversationId) {
          console.warn('No conversation id from event', event);
          return;
        }


        this.ngZone.run(() => {
          const dialogRef = this.dialog.open(TalkJsHelperComponent, {
            width: '500px',
            position: { top: '150px' },
            data: {
              action: 'confirmation'
            }
          });

          dialogRef.afterClosed().subscribe(async (result: boolean) => {
            if (!result) return;
            if (result) {
              // call your backend (secure) endpoint
              const resp = await fetch(`${this.apiUrl}deleteTalkConversation`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + localStorage.getItem('authToken') // your auth header
                },
                body: JSON.stringify({ conversationId })
              });

              if (resp.ok) {
                this.toaster.success(this.getDeleteSuccessMessage(String(localStorage.getItem('lang'))));
                if (this.inbox) {
                  this.inbox.destroy();
                  this.inbox = this.session!.createInbox({
                    theme: this.currentTheme,
                    conversationActions: [
                      { id: 'delete_convo', label: this.getDeleteLabel(String(localStorage.getItem('lang'))), icon: 'trash' }
                    ]
                  } as any);
                  this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
                  this.registerConversationActionHandler();
                }
              } else {
                const text = await resp.text();
                console.error('Delete failed', resp.status, text);
                // alert('Could not delete conversation. See console for details.');
              }
            }
          })
        });

      } catch (err) {
        console.error('Error handling delete action', err);
        // alert('Error deleting conversation.');
      }
    });
  }


  private getDeleteLabel(lang: string): string {
    const labels: Record<string, string> = {
      en: 'Delete',
      de: 'Löschen',
      fr: 'Supprimer',
      it: 'Elimina',
      es: 'Eliminar',
      pt: 'Excluir',
      da: 'Slet',
      sv: 'Radera'
    };
    return labels[lang] || labels['de'];
  }


  private getDeleteSuccessMessage(lang: string): string {
    const messages: any = {
      en: 'The conversation was deleted successfully.',
      de: 'Die Konversation wurde erfolgreich gelöscht.',
      fr: 'La conversation a été supprimée avec succès.',
      it: 'La conversazione è stata eliminata con successo.',
      es: 'La conversación se eliminó correctamente.',
      pt: 'A conversa foi excluída com sucesso.',
      da: 'Samtalen blev slettet med succes.',
      sv: 'Konversationen raderades framgångsrikt.'
    };
    return messages[lang] || messages.en;
  }



}