// src/app/services/user-state.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private isPremiumLoaded = false;
  private isPremiumSubject = new BehaviorSubject<boolean | null>(null);
  public isPremium$ = this.isPremiumSubject.asObservable();

  constructor(private http: HttpClient, private socketService: SocketService) { }

  loadPremiumStatus() {
    if (this.isPremiumLoaded) return;

    this.isPremiumLoaded = true;

    // this.http.get<{ isPremium: boolean }>('/api/check-premium-status')
    //   .subscribe(response => {
    //     this.isPremiumSubject.next(response.isPremium);
    //   });
    this.socketService.getUserMemberShipStatus().then((result) => {
      this.isPremiumSubject.next(result);
    }); 
  }

  get isPremiumValue(): boolean | null {
    return this.isPremiumSubject.value;
  }
}
