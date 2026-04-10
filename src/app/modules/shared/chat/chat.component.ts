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
import { ChatjsService } from '../../../services/chatjs.service';

import { ThemeService } from '../../../services/theme.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

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
        private router: Router,
        private chatjs: ChatjsService,
        private themeService: ThemeService,
        private translate: TranslateService
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
                    photoUrl: user.profile_image_path,
                    role: user.role_id
                });
            });
            console.info('Users Selected for chats ', this.users)
            if (this.users.length === 1) {
                const u = this.users[0];
                this.chatjs.createOneOnOneConversation2(u.id, u.name, u.email, u.photoUrl, u.role);
                // await this.talkService.createOneOnOneConversation(u.id, u.name, u.email, u.photoUrl);
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

    public test(theme: string) {
        console.info('Theme in ChatComponent.test is ', theme);
    }

    ngOnInit() {
        let themeStored = localStorage.getItem('theme') === 'dark' ? true : false;
        this.globalSettings.indexFunctionCall$.subscribe((data) => {
            console.log('Global Settings IndexFunction Call');
            themeStored = localStorage.getItem('theme') === 'dark' ? true : false;
            console.info('Theme in ChatComponent GlobalSettings IndexFunction Call is ', themeStored);

            const isDark = localStorage.getItem('theme') === 'dark';

            if ((window as any).ChatWidget?.updateTheme) {
                (window as any).ChatWidget.updateTheme(isDark);
            }
        });

        // let lang = "en"
        // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        //     lang = event.lang;

        //     if ((window as any).ChatWidget && (window as any).ChatWidget?.updateLanguage) {
        //         console.log('chat widget lang', event.lang, typeof(event.lang));
        //         (window as any).ChatWidget?.updateLanguage('de');
        //     }

        // });

        const script = document.createElement('script');
        script.id = 'chat-widget-script'; // 👈 give it an id
        script.src = 'https://bigstuffmovers.au/widget/build/static/js/main.19ab0eeb.js';
        script.onload = () => {
            (window as any)['ChatWidget'].init({
                projectId: "soccer",
                userId: "45",
                token: "jwt-token",
                isDarkMode: themeStored,
                lang: localStorage.getItem('lang'),

                theme: {
                    light: {
                        primaryGreen: "#6FB95D",
                        primaryRed: "#f93c65",
                        primaryDarkBg: "#fff",
                        secondaryDarkBg: "#ebeef2b3"
                    },
                    dark: {
                        primaryGreen: "#BDE34F",
                        primaryRed: "#f93c65",
                        primaryDarkBg: "#072944",
                        secondaryDarkBg: "#0C3453"
                    }
                }
            });
        };
        document.body.appendChild(script);
    }

    async ngAfterViewInit() {
        const themeStored = localStorage.getItem('theme');
        this.theme = themeStored === 'dark' ? 'dark_custom_users' : 'default_users';
        document.body.classList.toggle('dark-mode', this.theme === 'dark_custom_users');
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) return;

        this.userData = JSON.parse(userDataString);

        if (this.userData.role === '2' && this.userData.club_logo_path) {
            this.userData.profile_image_path = this.userData.club_logo_path;
        }

        if (!this.userData.profile_image_path && this.userData.meta?.profile_image_path) {
            this.userData.profile_image_path = this.userData.meta.profile_image_path;
        }

        let nameOfUser = this.userData.first_name + ' ' + this.userData.last_name;
        let profileImgOfUser = this.userData.profile_image_path;
        if (typeof this.userData.role !== undefined && Number(this.userData.role) === 2) {
            nameOfUser = this.userData?.current_club_name;
            profileImgOfUser = this.userData.club_logo_path;
            // console.info('this.userData_nameOfUser', this.userData)
        }
        const user = {
            id: this.userData.id,
            name: nameOfUser,
            email: this.userData.username,
            photoUrl: profileImgOfUser,
            welcomeMessage: null,
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

    ngOnDestroy(): void {
        if ((window as any).ChatWidget?.destroy) {
            (window as any).ChatWidget.destroy();
        }

        const script = document.getElementById('chat-widget-script');
        if (script) {
            let userDataString = localStorage.getItem('chatUserData');
            let userData = userDataString ? JSON.parse(userDataString) : null;
            (window as any)['ChatWidget'].disconnectChatUser({
                userId: userData?._id
            });
            script.remove();
        }
    }

}
