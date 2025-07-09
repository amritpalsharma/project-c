import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BehaviorSubject, Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StripeLoaderService {
  // private readonly testKey = 'pk_test_DbR8a';
  // private readonly liveKey = 'pk_live_5haMAUKO';
  private readonly testKey = 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a';
  private readonly liveKey = 'pk_live_51PVE08Ru80loAFQXNIL4kBDfjj9YNWZNgyZZQRzDJXl1Xc629uJkegyUbV3qCSnFyfVlaKlM4u1Qmrs4waZB6Q55001haMAUKO';

  private stripePromise: Promise<Stripe | null> | null = null;
  private stripeLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // this.initStripe(); // Initialize Stripe on service creation
  }

  // This method is responsible for initializing Stripe
  // async getStripePublishKey11() {
  //   try {
  //     const headers = new HttpHeaders({
  //       Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
  //     });

  //     // Call the API to get the payment mode (test/live)
  //     const res: any = await this.http
  //       .get('https://api.socceryou.ch/api/get-payment-mode', { headers })
  //       .toPromise();

  //     const mode = res?.data?.mode; // API response mode (either 'test' or 'live')
  //     const publishableKey = mode == 'live' ? this.liveKey : this.testKey;

  //     return publishableKey;
  //     // Load Stripe with the appropriate key based on the API response
  //     // this.stripePromise = loadStripe(publishableKey);

  //     // Notify that Stripe has been loaded
  //     // this.stripeLoaded.next(true);
  //   } catch (err) {
  //     console.error('Failed to initialize Stripe:', err);
  //   }
  // }

  // Get the loaded Stripe instance
  getStripe(): Promise<Stripe | null> {
    return this.stripePromise!;
  }



  getStripePublishKey(): Observable<string | null> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    });

    // Return an Observable instead of using async/await with Promise
    return this.http
      .get<any>('https://api.socceryou.ch/api/get-payment-mode', { headers })
      .pipe(
        map((res) => {
          const mode = res?.data?.mode;
          console.info('Stripe Loaded getting :: '+mode)
          return mode === 'live' ? this.liveKey : this.testKey;
        })
      );
  }

  // Observable that you can subscribe to in components to know when Stripe is ready
  stripeReady$ = this.stripeLoaded.asObservable();
}
