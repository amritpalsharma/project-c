import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  public teams: any[] = [];
  private apiUrl: string;
  private userToken: string | null;
  stripePromise: Promise<Stripe | null>;

  private readonly testKey = 'pk_test_51PVE08Ru80loAFQXg7MVGXFZuriJbluM9kOaTzZ0GteRhI0FIlkzkL2TSVDQ9QEIp1bZcVBzmzWne3fGkCITAy7X00gGODbR8a';
  private readonly liveKey = 'pk_live_51PVE08Ru80loAFQXNIL4kBDfjj9YNWZNgyZZQRzDJXl1Xc629uJkegyUbV3qCSnFyfVlaKlM4u1Qmrs4waZB6Q55001haMAUKO';


  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl; // Ensure this is defined in your environment
    this.userToken = localStorage.getItem('authToken');
    this.stripePromise = loadStripe(environment.stripePublishableKey);
    this.initStripe();
  }

  /**
 * Call API to get payment mode and initialize Stripe
 */
  async initStripe(): Promise<void> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.userToken || ''}`
      });

      const response: any = await this.http
        .get(`${this.apiUrl}get-payment-mode`, { headers })
        .toPromise();

      const mode = response?.data?.mode;

      const publishableKey = mode === 'live'
        ? this.liveKey
        : this.testKey;

      this.stripePromise = loadStripe(publishableKey);

      console.log(`Stripe initialized with ${mode} key`);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }


  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }

  createCheckoutSession(planId: string, booster_audience: any = '', couponCode: any = ''): Observable<any> {
    const userDataString = localStorage.getItem('userData');
    let successUrl = window.location.origin + '/success'; // Define your success URL
    let cancelUrl = window.location.origin + '/cancel';
    if (userDataString) {
      const userData = JSON.parse(userDataString); // Parse the JSON string into an object
      if (userData.role == 4) {
        successUrl = window.location.origin + '/talent/success';
        cancelUrl = window.location.origin + '/talent/cancel';
      } else if (userData.role == 2) {
        successUrl = window.location.origin + '/club/success';
        cancelUrl = window.location.origin + '/club/cancel';
      } else if (userData.role == 3) {
        successUrl = window.location.origin + '/scout/success';
        cancelUrl = window.location.origin + '/scout/cancel';
      }
    } else {
      successUrl = window.location.origin + '/success';
    }
    // Define your cancel URL

    // Define the request body with the necessary parameters
    const body: any = {
      planId: planId,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      booster_audience: booster_audience
    };

    // Only include the coupon code in the body if it's provided
    if (couponCode) {
      body.coupon_code = couponCode;
    }

    // Only include the coupon code in the body if it's provided
    if (booster_audience) {
      body.booster_audience = booster_audience;
    }

    // Sending the request as a POST with the body data
    // return this.http.post(`${this.apiUrl}create-payment-intent/${planId}`, body);
    return this.http.post(`${this.apiUrl}create-payment-intent/${planId}`, body);
  }


  cancelSubscription(subscriptionId: string): Observable<any> {
    const url = `${this.apiUrl}/user/cancel-subscription`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    const formData = new FormData();
    formData.append('subscription_id', subscriptionId);

    return this.http.post<any>(url, formData, { headers });
  }

  upgradeSubscription(subscriptionId: string, newPackageId: string): Observable<any> {
    const url = `${this.apiUrl}/user/upgrade-subscription`;
    const data = new FormData();
    data.append('subscription_id', subscriptionId);
    data.append('new_package_id', newPackageId);
    let currentLang = localStorage.getItem('lang_id');
    data.append('lang', currentLang + '');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(url, data, { headers });
  }

  generateLinkAndNavigate(): Observable<any> {
    const formData = new FormData();
    formData.append('return_url', window.location.protocol + "//" + window.location.hostname); // Add your URL here

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}` // Include your token here
    });

    return this.http.post<any>(
      'https://api.socceryou.ch/api/create-customer-portal',
      formData,
      { headers }
    );
  }
}
