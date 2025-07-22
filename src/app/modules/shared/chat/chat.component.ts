/* --- Chat Component --- */
import {
    Component,
    AfterViewInit,
    inject,
} from '@angular/core';
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
export class ChatComponent implements AfterViewInit {
    readonly dialog = inject(MatDialog);
    userData: any;
    users: any[] = [];
    isLoading = true;
    theme: string = 'default';

    constructor(
        private talkService: TalkService,
        private globalSettings: GlobalSettingsService,
        private router: Router
    ) { }



    editinbox() {
        this.users = [];
        this.dialog.open(ChatPopupComponent, {
            height: '450px',
            width: '760px',
        }).afterClosed().subscribe(async users => {
            if (!users?.data || !Array.isArray(users.data)) return;

            users.data.forEach((user: any) => {
                let full_name = user?.first_name + ' ' + user?.last_name;
                if (["club", "klub", "klubb", "clube"].includes(user?.role_name?.toLowerCase())) {
                    if (user?.current_club_logo) {
                        user.meta.profile_image_path = 'https://api.socceryou.ch/uploads/' + user.current_club_logo;
                    }
                    if (user?.current_club_name) {
                        full_name = user.current_club_name;
                    }
                }
                if (user.meta?.profile_image_path) {
                    user.profile_image_path = user.meta.profile_image_path;
                }

                this.users.push({
                    id: user.id,
                    name: full_name,
                    email: user.username,
                    photoUrl: user.profile_image_path
                });
            });
            console.info('Users Selected for chats ', this.users)
            if (this.users.length === 1) {
                const u = this.users[0];
                await this.talkService.createOneOnOneConversation(u.id, u.name, u.email, u.photoUrl);
            } else if (this.users.length > 1) {
                // this.talkService.createGroupConversation(this.talkService['session']!.id + '_' + Date.now(), this.users);
                this.talkService.createGroupConversation(this.generateGroupId(), this.users);

            }
        });
    }

    generateGroupId(): string {
        const userIds = this.users.map(u => u.id).join('_');
        return 'group_' + userIds + '_' + Date.now();
    }
    async checkAndRemoveOpenChat() {
        const url = new URL(window.location.href);
        url.searchParams.delete('open_chat');
        window.history.replaceState({}, document.title, url.toString());

        const otherUserData = localStorage.getItem('otherUserData');
        console.info('otherUserData', otherUserData)
        if (otherUserData) {
            const otherUser = JSON.parse(otherUserData);
            await this.talkService.createOneOnOneConversation(
                otherUser.id,
                otherUser.name,
                otherUser.email,
                otherUser.photoUrl
            );
        }
        setTimeout(() => (this.isLoading = false), 100);
    }


    async ngAfterViewInit() {
        const themeStored = localStorage.getItem('theme');
        this.theme = themeStored === 'dark' ? 'dark_custom' : 'default';
        document.body.classList.toggle('dark-mode', this.theme === 'dark_custom');

        const userDataString = localStorage.getItem('userData');
        if (!userDataString) return;

        this.userData = JSON.parse(userDataString);

        if (this.userData.role === '2' && this.userData.club_logo_path) {
            this.userData.profile_image_path = this.userData.club_logo_path;
        }

        if (!this.userData.profile_image_path && this.userData.meta?.profile_image_path) {
            this.userData.profile_image_path = this.userData.meta.profile_image_path;
        }

        const user = {
            id: this.userData.id,
            name: this.userData.first_name + this.userData.last_name,
            email: this.userData.username,
            photoUrl: this.userData.profile_image_path,
            welcomeMessage: 'Hi!',
            role: this.userData.role === '1' ? 'hidden' : 'default'
        };

        // ✅ Set theme before init
        this.talkService.currentTheme = this.theme;
        let role;
        // if (this.userData.role && Number(this.userData.role) === 1) {
        //     role = 'hidden';
        // } else {

        // }
        this.talkService.setCurrentUserRoleAndId('default', this.userData.id);

        // ✅ Initialize session
        await this.talkService.init(user);

        // ✅ Mount inbox with theme
        this.talkService.mountInboxWithTheme();

        // Optional: handle open_chat param
        setTimeout(() => {
            const url = new URL(window.location.href);
            if (url.searchParams.get('open_chat') === 'true') {
                this.checkAndRemoveOpenChat();
            } else {
                this.isLoading = false;
            }
        }, 1500);
    }

}
