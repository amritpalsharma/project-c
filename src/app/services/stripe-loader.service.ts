import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeLoaderService {
  private stripePromise: Promise<Stripe | null> | null = null;

  private readonly testKey = 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a';
  private readonly liveKey = 'pk_live_51PVE08Ru80loAFQXNIL4kBDfjj9YNWZNgyZZQRzDJXl1Xc629uJkegyUbV3qCSnFyfVlaKlM4u1Qmrs4waZB6Q55001haMAUKO';

  private readonly userToken = localStorage.getItem('authToken');
  private stripeReady = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initStripe();
  }

  private initStripe(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    });

    this.http.get<any>('https://api.socceryou.ch/api/get-payment-mode', { headers })
      .subscribe({
        next: (response) => {
          const mode = response?.data?.mode;
          const key = mode === 'live' ? this.liveKey : this.testKey;

          this.stripePromise = loadStripe(key);
          this.stripeReady.next(true); // Notify components
        },
        error: (err) => {
          console.error('Stripe mode fetch failed:', err);
        }
      });
  }

  getStripe(): Promise<Stripe | null> {
    return this.stripePromise!;
  }

  isReady(): Observable<boolean> {
    return this.stripeReady.asObservable();
  }
}
