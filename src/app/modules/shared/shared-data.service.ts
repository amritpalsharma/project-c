import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // ensures it's a singleton
})
export class SharedDataService {
  private sharedTextSource = new BehaviorSubject<string>(''); // initial value
  sharedText$ = this.sharedTextSource.asObservable();

  setSharedText(text: string): void {
    this.sharedTextSource.next(text);
  }
}
