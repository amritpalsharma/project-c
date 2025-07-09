import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeLoaderService {
  // private stripePromise: Promise<Stripe | null> | null = null;

  private readonly testKey = 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a';
  private readonly liveKey = 'pk_live_51PVE08Ru80loAFQXNIL4kBDfjj9YNWZNgyZZQRzDJXl1Xc629uJkegyUbV3qCSnFyfVlaKlM4u1Qmrs4waZB6Q55001haMAUKO';

  private readonly userToken = localStorage.getItem('authToken');
  private stripeReady = new BehaviorSubject<boolean>(false);

  private stripePromise: Promise<Stripe | null> | null = null;
  private stripeLoaded = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {
    this.initStripe();
  }

  async initStripe(): Promise<void> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
      });

      const res: any = await this.http
        .get('https://api.socceryou.ch/api/get-payment-mode', { headers })
        .toPromise();

      const mode = res?.data?.mode;
      const publishableKey = mode === 'live'
        ? this.liveKey
        : this.testKey;

      this.stripePromise = loadStripe(publishableKey);
      this.stripeLoaded.next(true);
    } catch (err) {
      console.error('Failed to initialize Stripe:', err);
    }
  }

  /**
   * Get loaded Stripe instance
   */
  getStripe(): Promise<Stripe | null> {
    return this.stripePromise!;
  }

  /**
   * Use this if you want to listen when Stripe is ready
   */
  stripeReady$ = this.stripeLoaded.asObservable();
}
