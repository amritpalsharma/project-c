// src/app/services/talkjs.service.ts
import { Injectable } from '@angular/core';
import { locale } from 'moment';
import Talk from 'talkjs';
@Injectable({
  providedIn: 'root',
})
export class TalkService {
  private session: Talk.Session | null = null;
  private user: Talk.User | undefined;
  private inbox: Talk.Inbox | undefined;
  // selectedConversationId: string | null = null;
  selectedConversationId: string | null = null;
  public localeFirstTime: any = localStorage.getItem('lang');
  constructor() { 
    this.localeFirstTime = localStorage.getItem('lang')
  }

  // Generate a unique ID using Date and Math.random
  public generateUniqueId(): string {
    return `group-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async init(user: { id: string; name: string; email: string; photoUrl: string, role: string }) {
    console.warn('Chat is init lang is '+this.localeFirstTime);
    await Talk.ready;

    this.user = new Talk.User({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl + '?=' + Date.now(),
      welcomeMessage: null,
      role: user.role,
      locale:this.localeFirstTime // set by amrit when chat init
    });

    this.session = new Talk.Session({
      appId: 'tmI75KXB', //tHcyGZjg //tmI75KXB:live
      me: this.user,
    });
    return this.session;
  }


  /*createInbox(conversations: Talk.ConversationBuilder[]) {
      if (!this.session) {
      throw new Error('TalkJS session is not initialized');
      }
      const inbox = this.session.createInbox();
      inbox.setConversations(conversations);
      return inbox;
  } */


  // Create a one-on-one conversation
  createOneOnOneConversation(id: string, name: string, email: string, photoUrl: string): Promise<void> {

    return new Promise((resolve, reject) => {
      if (!this.user || !this.session) {
        reject('User is not initialized');
        return;
      }

      const otherUser = new Talk.User({
        id: id,
        name: name,
        email: email,
        photoUrl: photoUrl + '?=' + Date.now(),
        welcomeMessage: null,
        role: 'default'

      });
      const conversation = this.session.getOrCreateConversation(Talk.oneOnOneId(this.user, otherUser));

      const hiddenUser = new Talk.User({
        id: 1,
        name: 'Crest Tech',
        email: 'testmails.cts@gmail.com',
        role: 'hidden'
      });


      conversation.setParticipant(this.user);
      conversation.setParticipant(otherUser);
      conversation.setParticipant(hiddenUser);
      conversation.setAttributes({ custom: { search: `${this.user.name} ${otherUser.name}` } });
      if (!this.inbox) {
        this.inbox = this.session.createInbox({ selected: conversation });
      } else {
        this.inbox.select(conversation);
      }
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
      const otherNames = userList.map(user => user.name);
      const names = [this.user.name, ...otherNames].join(" ");
      conversation.setAttributes({ custom: { search: names } });
      console.info('Users Recived in TalkJs.Service', userList);
      // Add all other users to the conversation
      userList.forEach(user => {
        const participant = new Talk.User({
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl + '?=' + Date.now(),
          welcomeMessage: null,
          role: 'default'
        });
        conversation.setParticipant(participant);
      });

      const hiddenUser = new Talk.User({
        id: 1,
        name: 'Admin',
        email: 'testmails.cts@gmail.com',
        role: 'hidden'
      });

      // Group chat name
      // conversation.setAttributes({
      //     subject: "Group Chat!"
      // });

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


  toggleTheme(isDarkModeEnabled: boolean): void {
    if (!this.session) {
      console.error('TalkJS session not initialized');
      return;
    }

    // Get current conversation ID before destroying the inbox
    // const selectedConversationId = this.inbox?.getSelectedConversation()?.id;

    // Destroy old inbox
    if (this.inbox) {
      this.inbox.destroy();
    }

    // Create new inbox with the new theme
    this.inbox = this.session.createInbox({
      theme: isDarkModeEnabled ? 'dark_custom' : 'default'
    });
    if (this.selectedConversationId) {
      const conversation = this.session.getOrCreateConversation(this.selectedConversationId);
      this.inbox.select(conversation);
    }

    // Mount the new inbox
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);

    // Restore the selected conversation (if available)
    // if (selectedConversationId) {
    //   this.inbox.select(selectedConversationId);
    // }

  }

  public changeLocale(newLocale: string): void {
    if (!this.session || !this.user) {
      console.error('TalkJS session is not initialized.');
      return;
    }

    // Save current conversation ID if any
    // const selectedConversation = this.inbox?.selectedConversation;

    // Update user with new locale
    this.user = new Talk.User({
      id: this.user.id,
      name: this.user.name,
      email: this.user.email,
      photoUrl: this.user.photoUrl,
      welcomeMessage: null,
      role: this.user.role,
      locale: newLocale,
    });

    // Destroy old inbox and session
    if (this.inbox) {
      this.inbox.destroy();
      this.inbox = undefined;
    }

    if (this.session) {
      this.session.destroy();
    }

    // Create new session
    this.session = new Talk.Session({
      appId: 'tmI75KXB',
      me: this.user,
    });

    // Create new inbox
    this.inbox = this.session.createInbox();

    // If a conversation was open, restore it
    // if (selectedConversation) {
    //   this.inbox.select(selectedConversation);
    // }

    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
  }



  public changeLocale12_06_25(newLocale: string): void {
    if (!this.session || !this.user) {
      console.error('TalkJS session is not initialized.');
      return;
    }

    // Update the user with the new locale
    this.user = new Talk.User({
      id: this.user.id,
      name: this.user.name,
      email: this.user.email,
      photoUrl: this.user.photoUrl + '?=' + Date.now(),
      welcomeMessage: null,
      role: this.user.role,
      locale: newLocale,
    });

    // Destroy the current inbox if it exists
    if (this.inbox) {
      this.inbox.destroy();
      this.inbox = undefined;
    }

    // Reinitialize the session with the updated user
    this.session = new Talk.Session({
      appId: 'tmI75KXB',
      me: this.user,
    });

    // Optionally, re-create the inbox or re-mount your chat UI.
    // For example:
    this.inbox = this.session.createInbox();
    this.inbox.mount(document.getElementById('talkjs-container') as HTMLElement);
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
        locale:this.localeFirstTime
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
      this.selectedConversationId = conversationId;

      let inbox;
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        inbox = session.createInbox({ theme: 'dark_custom' });
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

  public attachMessageSendListener() {
    console.info('Function called:::');
    if (this.inbox) {
      (this.inbox as any).on("send", (event: any) => {
        console.info("Message sent:", event.message);
        // this.socketService.emit("sendMessage", {
        //   text: event.message.text,
        //   senderId: event.message.sender.id,
        //   conversationId: event.message.conversation.id,
        //   timestamp: event.message.sentAt,
        // });
      });
    }
  }
}
