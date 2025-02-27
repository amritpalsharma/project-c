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

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl; // Ensure this is defined in your environment
    this.userToken = localStorage.getItem('authToken');
    this.stripePromise = loadStripe(environment.stripePublishableKey);
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
      }
    }else{
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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(url, data, { headers });
  }
}
