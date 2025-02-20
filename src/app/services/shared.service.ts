import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Makes the service available globally
})
export class SharedService {
  private dataSubject = new BehaviorSubject<any>('Initial Data'); // Default value
  data$ = this.dataSubject.asObservable(); // Expose as an observable for components to subscribe

  updateData(newData: any) {
    this.dataSubject.next(newData); // Update the data
  }
}
