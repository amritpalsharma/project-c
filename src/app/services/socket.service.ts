// src/app/services/socket.service.ts

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

interface UserData {
  status: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    userData: UserData;
    chat_mode?: string;
    payment_mode?: string;
    user_data?: any;
  };
}

@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket!: Socket;

  private platformId = inject(PLATFORM_ID);

  // private readonly socketUrl: string = 'https://alerts.socceryou.ch/';
  private readonly socketUrl: string = environment.socketUrl;

  public onlineUsers: { [userId: string]: string } = {};

  private paymentStatus: string = 'test';

  private chatMode: string = 'test';

  userToken: any;

  constructor(private http: HttpClient) {

    let jsonData = '';
    let langId = '';
    let userId: any;

    this.userToken = '';

    // SSR SAFE CHECK
    if (isPlatformBrowser(this.platformId)) {

      // Initialize socket only in browser
      this.socket = io(this.socketUrl);

      jsonData = localStorage.getItem("userData") || '';

      langId = localStorage.getItem("lang_id") || '';

      this.userToken = localStorage.getItem('authToken') || '';

      if (
        jsonData &&
        jsonData !== 'null' &&
        jsonData !== 'undefined' &&
        langId
      ) {

        try {

          const userData = JSON.parse(jsonData);

          if (userData?.id) {

            userId = userData.id;

            this.connectUser({
              userId: userData.id,
              langId
            });

          }

        } catch (error) {

          console.error('Invalid userData in localStorage', error);

        }

      } else {

        console.log('No userData found in localStorage.');

      }

      // Update online users
      this.socket.on(
        'updateOnlineUsers',
        (data: { onlineUsers: { [userId: string]: string } }) => {

          this.onlineUsers = data.onlineUsers;

          console.log('Updated online users:', this.onlineUsers);

        }
      );

      // Hemant Code
      this.socket.on('sendMessage', (data: any) => {

        console.log(data, 'from here');

        try {

          const userData = jsonData
            ? JSON.parse(jsonData)
            : null;

          if (
            userData?.id &&
            data?.senderId == userData.id
          ) {

            this.socket.emit('sendMessage2', data);

          }

        } catch (error) {

          console.error('Error parsing userData', error);

        }

      });

    } else {

      // SSR fallback
      this.socket = {} as Socket;

    }

  }

  // Method to emit 'connectUser' event
  connectUser({
    userId,
    langId
  }: {
    userId: string;
    langId: string;
  }) {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (userId == '1') {

      if (langId !== "1" && langId !== "2") {

        langId = "1";

      }

    }

    console.log(typeof (userId), userId, langId);

    this.socket?.emit('connectUser', {
      userId,
      langId
    });

  }

  disconnectUser(userId: string) {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log("angular disconnectUser", userId);

    this.socket?.emit('disconnectUser', userId);

  }

  // Method to emit events to the server
  emit(event: string, data: any): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.socket?.emit(event, data);

  }

  // Method to listen to events from the server
  on(event: string): Observable<any> {

    return new Observable((observer) => {

      if (!isPlatformBrowser(this.platformId)) {

        observer.complete();

        return;

      }

      this.socket?.on(event, (data) => {

        observer.next(data);

      });

    });

  }

  // Method to disconnect the socket when no longer needed
  disconnect(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.socket?.disconnect();

  }

  getLoggedInUserStatus(): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = environment.apiUrl;

    return this.http
      .get<ApiResponse>(`${apiUrl}/check-user-status`, { headers })
      .toPromise()
      .then((response: any) => {

        if (
          response.status === true &&
          response.data.userData.status !== '' &&
          response.data.userData.status !== undefined
        ) {

          return response.data.userData.status;

        } else {

          return false;

        }

      })
      .catch((error) => {

        console.error('Error:', error);

        return false;

      });

  }

  getLoggedInUserPaymentStatus(): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = environment.apiUrl;

    return this.http
      .get<ApiResponse>(`${apiUrl}/check-user-status`, { headers })
      .toPromise()
      .then((response: any) => {

        if (
          response.status === true &&
          response.data.chat_mode !== '' &&
          response.data.chat_mode !== undefined
        ) {

          this.chatMode = response.data.chat_mode;

        }

        if (
          response.status === true &&
          response.data.payment_mode !== '' &&
          response.data.payment_mode !== undefined
        ) {

          this.paymentStatus = response.data.payment_mode;

          return response.data.payment_mode;

        } else {

          return false;

        }

      })
      .catch((error) => {

        console.error('Error:', error);

        return false;

      });

  }

  getLoggedInUserDetail(): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = environment.apiUrl;

    return this.http
      .get<ApiResponse>(`${apiUrl}/check-user-status`, { headers })
      .toPromise()
      .then((response: any) => {

        if (
          response.status === true &&
          response.data.userData.status !== '' &&
          response.data.userData.status !== undefined
        ) {

          return response.data;

        } else {

          return false;

        }

      })
      .catch((error) => {

        console.error('Error:', error);

        return false;

      });

  }

  getUserMemberShipStatus(): Promise<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = environment.apiUrl;

    return this.http
      .get<ApiResponse>(`${apiUrl}/profile`, { headers })
      .toPromise()
      .then((response: any) => {

        console.info('SocketService', response);

        if (response?.status === true && response?.data) {

          if (
            response.data.user_data.status !== '' &&
            response.data.user_data.status !== undefined
          ) {

            if (
              response.data.user_data.role &&
              Number(response.data.user_data.role) === 4
            ) {

              return response?.data?.user_data?.active_subscriptions?.premium_talent?.length > 0
                ? true
                : false;

            } else {

              return response?.data?.user_data?.active_subscriptions?.premium?.length > 0
                ? true
                : false;

            }

          } else {

            return false;

          }

        } else {

          return false;

        }

      })
      .catch((error) => {

        console.error('Error:', error);

        return false;

      });

  }

  getPaymentStatus() {

    return (environment.paymentMode as string);

    // return this.paymentStatus;

  }

  getChatMode() {

    return this.chatMode;

  }

}