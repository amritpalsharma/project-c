import { Component, inject } from '@angular/core';
import Talk from 'talkjs';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { ChatPopupComponent } from './chat-popup/chat-popup.component';
import { ActivatedRoute } from '@angular/router';

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
  constructor(private talkService: TalkService, private route: ActivatedRoute) { }

  async ngOnInit() {

    const userDataString = localStorage.getItem('userData');

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



    const theme = localStorage.getItem('theme');

    if (theme == 'dark') {
      this.talkService.toggleTheme(true);
    }

   setTimeout(() => {
    this.checkAndRemoveOpenChat();
   }, 1000);
  }



  // Start a one-on-one chat
  startOneOnOneChat(user: any) {
    this.talkService.createOneOnOneConversation(user.id, user.name, user.email, user.photoUrl)
      .then(() => {
        this.talkService.mountChat('talkjs-container');
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

        for (let user of users.data) {
          this.users.push({
            id: user.id,
            name: user.first_name,
            email: user.username,
            photoUrl: user.profile_image_path,
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
    console.log('last users', users);
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

  checkAndRemoveOpenChat() {
    // Get the current URL
    let url = new URL(window.location.href);

    // Check if 'open_chat' param exists and is set to 'true'
    if (url.searchParams.get("open_chat") === "true") {
      // Remove the 'open_chat' param from the URL
      url.searchParams.delete("open_chat");

      // Reload the page with the updated URL (without 'open_chat')
      window.location.replace(url.toString());
    }
    const otherUserData = localStorage.getItem('otherUserData');

    if (otherUserData) {
      const otherUser = JSON.parse(otherUserData);
      console.log("Starting chat with:", otherUser);
      // window.location.reload();
      this.startOneOnOneChat(otherUser);
    }
  }
}