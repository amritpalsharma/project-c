//   private isValidImageUrl(url: string): boolean {
//     if (!url) return false;
//     try {
//       const parsed = new URL(url);
//       return ['http:', 'https:'].includes(parsed.protocol);
//     } catch {
//       return false;
//     }
//   }

//   async createOneOnOneConversation(
//     userId: string,
//     name: string,
//     email: string,
//     photoUrl: string
//   ): Promise<void> {
//     try {
//       const ADMIN_ID = '1';
//       const currentLang = localStorage.getItem('lang') || 'de';

    
//       if (!this.session && this.currentUser) {
//         await this.init(this.currentUser);
//       }

    
//       if (this.currentUserRole !== '1' && userId === ADMIN_ID) {
//         console.warn('Regular users cannot chat with admin.');
//         return;
//       }

     
//       const otherUser = new Talk.User({
//         id: userId,
//         name: name,
//         email: email,
//         photoUrl: this.getValidPhotoUrl(photoUrl),
//         role: 'default',
//         locale: currentLang
//       });

 
//       const hiddenAdmin = new Talk.User({
//         id: '1',
//         name: 'Succer You Sports AG',
//         email: 'testmails.cts@gmail.com',
//         role: 'hidden',
       
//       });
//       const conversationId = Talk.oneOnOneId(this.currentUser!, otherUser);
//       const conversation = this.session!.getOrCreateConversation(conversationId);

//       conversation.setParticipant(this.currentUser!);
//       conversation.setParticipant(otherUser);
//       conversation.setParticipant(hiddenAdmin);

//       conversation.setAttributes({
//         photoUrl: this.getValidPhotoUrl(photoUrl, true), // For conversation header
//       });

     
//       if (this.inbox) {
//         this.inbox.destroy();
//       }

//       this.inbox = this.session!.createInbox({
//         theme: this.currentTheme,
      
//       });

//       this.inbox.select(conversation);
//       this.inbox.mount(document.getElementById('talkjs-container')!);
//     } catch (err) {
//       console.error('Error in createOneOnOneConversation:', err);
//     }
//   }

//   private getValidPhotoUrl(photoUrl: string, appendTimestamp: boolean = false): string {
//     const fallback = 'https://api.socceryou.ch/uploads/default_talent_img.png';
//     let validatedPhoto = this.isValidImageUrl(photoUrl) ? photoUrl : fallback;

//     if (validatedPhoto.includes('/undefined')) {
//       validatedPhoto = fallback;
//     }

//     if (appendTimestamp) {
//       validatedPhoto += validatedPhoto.includes('?') ? '&' : '?';
//       validatedPhoto += `ts=${Date.now()}`;
//     }

//     return validatedPhoto;
//   }
