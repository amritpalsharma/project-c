import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';  // Import environment config

@Injectable({
  providedIn: 'root'
})
export class MailchimpService {
  private url = "https://alerts.socceryou.ch/subscribe";  // Mailchimp API URL with list ID
  private apiKey = environment.mailchimp.apiKey;  // Mailchimp API Key

  constructor(private http: HttpClient) {}

  // Method to subscribe email to Mailchimp
  submitEmail(email: string, domain: string): Observable<any> {
    // Mailchimp payload structure
    const payload = {
      email: email,
      status: 'subscribed'  // Add to Mailchimp list as 'subscribed'
    };

    // Set up the request headers with Mailchimp API key (Bearer token)
    const headers = new HttpHeaders({
      // 'Authorization': `Bearer ${this.apiKey}`,  // Use the API key as Bearer token
      'Content-Type': 'application/json'  // Content type should be JSON
    });

    const apiUrl = `${this.url}?domain=${domain}`;

    // Make the POST request to Mailchimp's API to subscribe the email
    return this.http.post<any>(apiUrl, payload, { headers });
  }
}
