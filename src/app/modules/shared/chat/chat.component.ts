import { Component, inject } from '@angular/core';
import Talk from 'talkjs';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { ChatPopupComponent } from './chat-popup/chat-popup.component';

@Component({
  selector: 'shared-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent  {
  readonly dialog = inject(MatDialog);
  userData:any;
  groupName: string = '';
  groupId: string = '';
  groupParticipants: { id: string, name: string,email:string,photoUrl:string }[] = [];
  users: { id: string; name: string; email: string; photoUrl: string }[] = [];
  newUser : { id: string; name: string; email: string; photoUrl: string }[] = [];
  createdGroups: { groupId: string, groupName: string }[] = [];
  user:any = {};
  constructor(private talkService : TalkService) {}
  
  async ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      this.user = {
        id: this.userData.id,
        name: this.userData.first_name,
        email: this.userData.username,
        photoUrl: this.userData.profile_image_path,
        welcomeMessage: "Hi!",
        role: (this.userData.role == '1') ? "hidden" : "default"
      };
      const session = await this.talkService.init(this.user);
      const chatbox = session.createInbox();
  
      // Defer mounting chatbox until next event loop cycle
      setTimeout(() => {
        chatbox.mount(document.getElementById('talkjs-container'));
      }, 0);
    }
  }
  


   // Start a one-on-one chat
   startOneOnOneChat(user:any) {
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
    this.dialog.open(ChatPopupComponent, {
      height: '450px',
      width: '760px',
    })
    .afterClosed().subscribe(users => {
        
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
}



