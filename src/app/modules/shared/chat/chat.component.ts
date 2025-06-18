import { Component, inject, AfterViewChecked, OnChanges, SimpleChanges } from '@angular/core';
import Talk from 'talkjs';
import { MatDialog } from '@angular/material/dialog';
import { TalkService } from '../../../services/talkjs.service';
import { ChatPopupComponent } from './chat-popup/chat-popup.component';
import { GlobalSettingsService } from '../../../services/global-settings.service';
import { Router } from '@angular/router';

@Component({
    selector: 'talent-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
    readonly dialog = inject(MatDialog);
    componentVisible: boolean = true;
    userData: any;
    groupName: string = '';
    groupId: string = '';
    groupParticipants: { id: string, name: string, email: string, photoUrl: string }[] = [];
    users: { id: string; name: string; email: string; photoUrl: string }[] = [];
    newUser: { id: string; name: string; email: string; photoUrl: string }[] = [];
    createdGroups: { groupId: string, groupName: string }[] = [];
    user: any = {};
    isLoading: boolean = true;

    session: any;
    inbox: any;
    currentLocale: string = localStorage.getItem('lang') || this.globalSettings.getLanguage();  // Example default locale
    selectedConversation: any;     // Assuming this is set elsewhere
    theme: any;                   // Assuming you have a theme object
    otherUserDataArr: any; // any blank array
    constructor(
        private talkService: TalkService,
        private globalSettings: GlobalSettingsService,
        private router: Router
    ) {

    }

    async ngOnInit() {
        const theme = localStorage.getItem('theme');
        if (theme == 'dark') {
            this.theme = 'dark_custom';
            // this.talkService.toggleTheme(true);
        } else {
            this.theme = 'default';
        }

        this.globalSettings.themeAndLangCallSubject$.subscribe((response) => {
            setTimeout(() => {
                this.reloadChatComponent();
            }, 100);
        });

        const userDataString = localStorage.getItem('userData');


        if (userDataString) {
            this.userData = JSON.parse(userDataString);
            // console.log('My Array', this.userData)
            if (this.userData.role == 2 && this.userData.club_logo_path != '' && typeof this.userData.club_logo_path !== undefined) {
                // console.log('This is Club');
                this.userData.profile_image_path = this.userData.club_logo_path;
                // console.log('Club Profile set as club Logo');
            } else {
                if (this.userData?.meta?.profile_image_path != '' && typeof this.userData?.meta?.profile_image_path !== undefined) {
                    this.userData.profile_image_path = this.userData?.meta?.profile_image_path;
                }
            }
            console.warn(this.userData);

            this.user = {
                id: this.userData.id,
                name: this.userData.first_name,
                email: this.userData.username,
                photoUrl: this.userData.profile_image_path,
                welcomeMessage: "Hi!",
                role: (this.userData.role == '1') ? "hidden" : "default"
            };
            this.otherUserDataArr = this.user;
            const session = await this.talkService.init(this.user);
            const chatbox = session.createInbox();
            this.selectedConversation = { user: this.user };

            // Defer mounting chatbox until next event loop cycle
            setTimeout(() => {
                chatbox.mount(document.getElementById('talkjs-container'));

                setTimeout(() => {
                    let url = new URL(window.location.href);
                    if (url.searchParams.get("open_chat") === "true") {
                        this.checkAndRemoveOpenChat();
                    } else {
                        this.isLoading = false;
                    }
                }, 1500); //after 1.5 sec
            }, 0);
        }
    }

    reloadChatComponent() {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
        });
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
        // console.info('this.users',this.users)
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
            .afterClosed()
            .subscribe(users => {
                if (typeof users.data !== undefined) {
                    for (let user of users.data) {
                        console.log('user From Chat Popup', user);
                        let full_name = 'Full Name';
                        if (typeof user?.meta?.profile_image_path !== undefined && user?.meta?.profile_image_path != '') {
                            user.profile_image_path = user?.meta?.profile_image_path;
                        }

                        if (typeof user?.first_name !== undefined && user?.last_name != '') {
                            full_name = user?.first_name + ' ' + user?.last_name;
                        }

                        console.log('Modified User as ', user);
                        this.users.push({
                            id: user.id,
                            name: full_name,
                            email: user.username,
                            photoUrl: user.profile_image_path,
                        })
                    }
                    if (this.users.length == 1) {
                        // this.startOneOnOneChat(this.users[0]);
                        let chatWithUser = this.users[0];
                        this.talkService.createOneOnOneConversation(chatWithUser.id, chatWithUser.name, chatWithUser.email, chatWithUser.photoUrl);
                    } else if (this.users.length > 1) {
                        this.startGroupChat();
                    }
                    console.log('last users', this.users);
                }

            });
    }

    // checkAndRemoveOpenChat1545() {
    //     let url = new URL(window.location.href);

    //     if (url.searchParams.get("open_chat") === "true") {
    //         url.searchParams.delete("open_chat");
    //         window.history.replaceState({}, document.title, url.toString()); // ✅ no reload
    //     }

    //     const otherUserData = localStorage.getItem('otherUserData');
    //     console.log('selected User For Chat', otherUserData)

    //     if (otherUserData) {
    //         const otherUser = JSON.parse(otherUserData);
    //         console.info('From View Profile Chat With', otherUser);
    //         // this.startOneOnOneChat(otherUser);
    //         // this.talkService.startChatWithUser(otherUser);
    //         // localStorage.setItem('otherUserData','');



    //         this.user = {
    //             id: otherUser.id,
    //             name: otherUser.first_name,
    //             email: otherUser.email,
    //             photoUrl: otherUser.profile_image_path,
    //             welcomeMessage: "Hi!",
    //             role: "default"
    //         };
    //         this.otherUserDataArr = this.user;
    //         // const session = await this.talkService.init(this.user);
    //         const chatbox = session.createInbox();
    //         this.selectedConversation = { user: this.user };
    //     }

    //     setTimeout(() => {
    //         this.isLoading = false;
    //     }, 100);
    // }


    async checkAndRemoveOpenChat() {
        const url = new URL(window.location.href);

        if (url.searchParams.get("open_chat") === "true") {
            url.searchParams.delete("open_chat");
            window.history.replaceState({}, document.title, url.toString()); // ✅ no reload
        }

        const otherUserData = localStorage.getItem('otherUserData');
        console.info('selected User For Chat', otherUserData);

        if (otherUserData) {
            const otherUser = JSON.parse(otherUserData);

            // Define current user (you)
            // const currentUser = {
            //     id: 'your_user_id', // <-- replace with actual current user id
            //     name: 'Your Name',
            //     email: 'your@email.com',
            //     photoUrl: 'your_image.jpg',
            //     welcomeMessage: "Hi!",
            //     role: "default"
            // };
            const currentUser = this.user;
            console.info('currentUser', currentUser);
            // this.user = {
            //     id: otherUser.id,
            //     name: otherUser.first_name,
            //     // email: c,
            //     photoUrl: otherUser.profile_image_path,
            //     welcomeMessage: "Hi!",
            //     role: "default"
            // };

            this.talkService.createOneOnOneConversation(otherUser.id, otherUser.name, otherUser.email, otherUser.photoUrl);

            // const session = await this.talkService.init(currentUser); // You must return this.session from TalkService

            // const me = new Talk.User(currentUser);
            // const other = new Talk.User({
            //     id: otherUser.id,
            //     name: otherUser.first_name,
            //     email: otherUser.email,
            //     photoUrl: otherUser.profile_image_path,
            //     role: "default"
            // });
            // console.info('otherUser', other);

            // const conversation = session.getOrCreateConversation(Talk.oneOnOneId(me, other));
            // conversation.setParticipant(me);
            // conversation.setParticipant(other);

            // const chatbox = session.createInbox();
            // chatbox.select(conversation); // ✅ Required
            // chatbox.mount(document.getElementById("talkjs-container")!);

            // localStorage.removeItem('otherUserData'); // Optional
        }

        setTimeout(() => {
            this.isLoading = false;
        }, 100);
    }

}