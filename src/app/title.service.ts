import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private title = new BehaviorSubject<string>('Default Title');
  currentTitle = this.title.asObservable();

  setTitle(newTitle: string) {
    this.title.next(newTitle);
  }
}
