import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private title = new BehaviorSubject<string>('Dashboard');
  private loggedInUserName = new BehaviorSubject<string>('');
  private loggedInUserRole = new BehaviorSubject<string>('');
  currentTitle = this.title.asObservable();

  loggedInName = this.loggedInUserName.asObservable();
  loggedInRole = this.loggedInUserRole.asObservable();

  setTitle(newTitle: string) {
    this.title.next(newTitle);
  }

  setName(CurrentName: string) {
    this.loggedInUserName.next(CurrentName);
  }

  setRole(newRole: any) {
    this.loggedInUserRole.next(newRole);
  }
}
