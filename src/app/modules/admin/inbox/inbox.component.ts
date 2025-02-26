import { Component, inject } from '@angular/core';
import Talk from 'talkjs';
import { InboxPopupComponent } from './inbox-popup/inbox-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { SocketService } from '../../../services/socket.service';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  readonly dialog = inject(MatDialog);
  userData:any;
  groupName: string = '';
  groupId: string = '';
  users: { id: string; name: string; email: string; photoUrl: string }[] = [];
  newUser : { id: string; name: string; email: string; photoUrl: string }[] = [];
  createdGroups: { groupId: string, groupName: string }[] = [];
  user:any = {};
  receiverUser:any = {};
  private isDarkMode = false;
  constructor(private talkService : TalkService, private socketService: SocketService) {}
  
  async ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      console.log('pic',this.userData)
      this.user = {
        id: this.userData.id,
        name: this.userData.first_name,
        email: this.userData.username,
        photoUrl: this.userData.profile_image_path,
        welcomeMessage: null,
        role: (this.userData.role == '1') ? "hidden" : "default"
      };
      const session = await this.talkService.init(this.user);
      const chatbox = session.createInbox();
      

      chatbox.onSendMessage((event) => {
        let getReceiverIds = Object.keys(event.conversation.participants)
          .filter(val => val != this.user.id);
        this.socketService.emit('sendMessage', {senderId: this.user.id, receiverIds: getReceiverIds});
    });

      // Defer mounting chatbox until next event loop cycle
      setTimeout(() => {
        chatbox.mount(document.getElementById('talkjs-container'));
      }, 0);
    }

    const theme = localStorage.getItem('theme');

    if(theme == 'dark'){
      this.talkService.toggleTheme(true);
    }
  }
  


   // Start a one-on-one chat
   startOneOnOneChat(user:any) {
    this.receiverUser = user;
    this.socketService.emit('sendMessage', {senderId: this.user.id, receiverIds: [user.id]});
    this.talkService.createOneOnOneConversation(user.id,user.name,user.email,user.photoUrl)
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
        .catch(err => {
          console.error('Error starting group chat:', err);
        });
    }

  editinbox() {
    this.users = [];
    this.dialog.open(InboxPopupComponent, {
      height: '450px',
      width: '850px',
    })
    .afterClosed()
      .subscribe(users => {
        
        for(let user of users.data){
            this.users.push({
              id: user.id,
              name: user.first_name,
              email: user.username,
              photoUrl: user.profile_image_path,
            })
        }
        if(this.users.length == 1){
          this.startOneOnOneChat(this.users[0]);
        }else if(this.users.length > 1){
          this.startGroupChat();
        }
        console.log('last users',this.users);
        //this.createGroup();
      });
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
}
