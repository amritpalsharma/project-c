// src/app/services/talkjs.service.ts
import { Injectable } from '@angular/core';
import Talk from 'talkjs';

@Injectable({
  providedIn: 'root',
})
export class TalkService {
  private session: Talk.Session | null = null;
  private user: Talk.User | undefined;
  private inbox: Talk.Inbox | undefined;

  constructor() {}

   // Generate a unique ID using Date and Math.random
  public generateUniqueId(): string {
    return `group-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async init(user: { id: string; name: string; email: string; photoUrl: string,role: string }) {
    await Talk.ready;

    this.user  = new Talk.User({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      welcomeMessage: 'Hey there! How can I help?',
      role:user.role
    });

    this.session = new Talk.Session({
       appId: 'tmI75KXB', //tHcyGZjg //tmI75KXB:live
      me:  this.user,
    });
    return this.session;
  }


/*     createInbox(conversations: Talk.ConversationBuilder[]) {
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
          photoUrl: photoUrl,
          welcomeMessage: 'Hey there! How can I help?',
          role:'default'

        });
        const conversation = this.session.getOrCreateConversation(Talk.oneOnOneId(this.user, otherUser));

        const hiddenUser = new Talk.User({
          id: 1,
          name: 'testmails.cts@gmail.com',
          email: 'testmails.cts@gmail.com',
          role:'hidden'
        });

    
        conversation.setParticipant(this.user);
        conversation.setParticipant(otherUser);
        conversation.setParticipant(hiddenUser);
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

    // Add all other users to the conversation
    userList.forEach(user => {
      const participant = new Talk.User({
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        welcomeMessage: 'Hey there! How can I help?',
        role:'default'
      });
      conversation.setParticipant(participant);
    });

    const hiddenUser = new Talk.User({
      id: 1,
      name: '',
      email: 'testmails.cts@gmail.com',
      role:'hidden'
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

}
