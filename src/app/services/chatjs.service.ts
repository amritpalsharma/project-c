import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatjsService {

  constructor() { }

  async createOneOnOneConversation2(userId: string, name: string, email: string, photoUrl: string) {
  // async createOneOnOneConversation2() {
    (window as any)['ChatWidget'].createChat({
      userId: userId,
      name: name,
      email: email,
      photoUrl: photoUrl
    });
  }
}