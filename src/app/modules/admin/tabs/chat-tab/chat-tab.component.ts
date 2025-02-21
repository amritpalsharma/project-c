
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import Talk from 'talkjs';

@Component({
  selector: 'app-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss']
})
export class ChatTabComponent implements OnInit {
  userData: any;
  otherUsers: any;
  constructor(private userService: UserService){

  }
  ngOnInit(): void {

    Talk.ready.then(() => {
      const me = new Talk.User({
        id: "sebastian",
        name: "Sebastian",
        email: "sebastian@example.com",
        photoUrl: "https://talkjs.com/new-web/avatar-7.jpg",
        welcomeMessage: "Hi!",
      });

      const other = new Talk.User({
        id: "taylor",
        name: "Taylor",
        email: "taylor@example.com",
        photoUrl: "https://talkjs.com/new-web/avatar-8.jpg",
        welcomeMessage: "Hello, I'm Taylor. Nice to meet you too!",
      });
      const other1 = new Talk.User({
        id: "smith",
        name: "smith",
        email: "smith@example.com",
        photoUrl: "https://talkjs.com/new-web/avatar-8.jpg",
        welcomeMessage: "Hello, I'm smith. Nice to meet you too!",
      });
      const other3 = new Talk.User({
        id: "test",
        name: "test",
        email: "test@example.com",
        photoUrl: "https://talkjs.com/new-web/avatar-8.jpg",
        welcomeMessage: "Hello, I'm test. Nice to meet you too!",
      });

      const session = new Talk.Session({
        appId: "tmI75KXB",
        me: me,
      });


      const conversation = session.getOrCreateConversation(Talk.oneOnOneId(me, other3));
      conversation.setParticipant(me);
      conversation.setParticipant(other);
      conversation.setParticipant(other1);
      conversation.setParticipant(other3);

      const inbox = session.createInbox({
        showChatHeader: true
      });

      // const inbox = session.createInbox();
      inbox.select(conversation);
      inbox.mount(document.getElementById("talkjs-container"));
    })


    .catch((error) => {
      console.error('TalkJS initialization error:', error);
    });
  }

  async fetchUsers(): Promise<void> {
    const userDataString = localStorage.getItem('userData');
        try {

         /*  const response: any = await this.userService.getUsers().toPromise();
          if (response && response.status && response.data && response.data.userData) {
            Talk.ready.then(() => {
            if (userDataString) {
            this.userData = JSON.parse(userDataString);
            const me = new Talk.User({
              id: this.userData.id,
              name: this.userData.first_name,
              email: this.userData.username,
              photoUrl: "https://talkjs.com/new-web/avatar-7.jpg",
              welcomeMessage: "Hi!",
            });

            const session = new Talk.Session({
              appId: "tHcyGZjg",
              me: me,
            });
            let conversation;
            for (let user of response.data.userData) {
              let other = new Talk.User({
                id: user.id,
                name: user.first_name,
                email: user.username,
                photoUrl: "https://talkjs.com/new-web/avatar-8.jpg",
                welcomeMessage: "Hello, I'm Taylor. Nice to meet you too!",
              });
              conversation = session.getOrCreateConversation(Talk.oneOnOneId(me, other));
              conversation.setParticipant(me);
              conversation.setParticipant(other);
             }
             const inbox = session.createInbox({
               showChatHeader: true
             });
            inbox.select(conversation);
             // const inbox = session.createInbox();
             inbox.mount(document.getElementById("talkjs-container"));
            //end here
            }
              }).catch((error) => {
                console.error('TalkJS initialization error:', error);
              });
            } else {
            console.error('Invalid API response structure:', response);
          } */


        } catch (error) {
          console.error('Error fetching users:', error);
        }

  }
}
