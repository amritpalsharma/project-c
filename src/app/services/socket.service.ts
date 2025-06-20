// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

interface UserData {
  status: string;  // Define the exact type for 'status'
}
interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    userData: UserData;
    // Add other properties of 'data' if needed
  };
}

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  private socket: Socket;
  // private readonly socketUrl: string = 'https://alerts.socceryou.ch/'; // Replace with your backend URL
  private readonly socketUrl: string = environment.socketUrl; // Replace with your backend URL

  public onlineUsers: { [userId: string]: string } = {};
  userToken: any;
  constructor(private http: HttpClient) {
    // Initialize the socket connection
    this.socket = io(this.socketUrl);

    let jsonData = localStorage.getItem("userData");
    let langId = localStorage.getItem("lang_id");
    let userId : any;
    if (jsonData && langId) {
      let userData = JSON.parse(jsonData);
      userId = userData.id;
      this.connectUser({ userId: userData.id, langId });
    }
    else {
      console.log("No data found in localStorage.");
    }
    this.userToken = localStorage.getItem('authToken');
    this.socket.on('updateOnlineUsers', (data: { onlineUsers: { [userId: string]: string } }) => {
      this.onlineUsers = data.onlineUsers;
      console.log('Updated online users:', this.onlineUsers);
    });

    // Hemant Code
    this.socket.on('sendMessage', (data: any) => {
      let jsonData = localStorage.getItem("userData") || '';
      let userData = JSON.parse(jsonData);
      if (data?.senderId == userData.id) {
        this.socket.emit('sendMessage2', data)
      }
    })

  }

  // Method to emit 'connectUser' event
  connectUser({ userId, langId }: { userId: string; langId: string }) {
    if (userId == '1') {
      if (langId !== "1" && langId !== "2") {
        langId = "1";
      }
    }
    console.log(typeof (userId), userId, langId);
    this.socket.emit('connectUser', { userId, langId });
  }

  disconnectUser(userId: string) {
    console.log("angular disconnectUser", userId);
    this.socket.emit('disconnectUser', userId);
  }



  // Method to emit events to the server
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Method to listen to events from the server
  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
    });
  }

  // Method to disconnect the socket when no longer needed
  disconnect(): void {
    this.socket.disconnect();
  }


  getLoggedInUserStatus(): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = 'https://api.socceryou.ch/';

    return this.http.get<ApiResponse>(`${apiUrl}api/check-user-status`, { headers })
      .toPromise()
      .then((response: any) => {
        if (response.status === true && response.data.userData.status !== '' && response.data.userData.status !== undefined) {
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


  getLoggedInUserDetail(): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    const apiUrl = 'https://api.socceryou.ch/';

    return this.http.get<ApiResponse>(`${apiUrl}api/check-user-status`, { headers })
      .toPromise()
      .then((response: any) => {
        if (response.status === true && response.data.userData.status !== '' && response.data.userData.status !== undefined) {
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



}
