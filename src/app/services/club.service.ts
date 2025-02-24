import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { User } from '../modules/admin/users/user.model';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // For storing data after fetching
import { loadStripe, StripeCardElement, StripeElements, Stripe } from '@stripe/stripe-js';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  event: string;
  message: string;
  senderId: number;
  receiverId: number;
  seen: number; // 0 for unseen, 1 for seen
  time: string; // Assuming this is a date-time string
  senderName: string;
  senderProfileImage: string;
}

@Injectable({
  providedIn: 'root'
})

export class ClubService {
  private apiUrl: string;
  private domain: any;
  private userToken: string | null;
  public teams: any[] = [];
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();
  public lang:any; // You can dynamically set this if needed
  languages:any = environment.langs;
  private apiUrl3 = "https://alerts.socceryou.ch/";

  constructor(private http: HttpClient) {

    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = localStorage.getItem('lang') || '';

    // Find the corresponding language ID from the langs array
    const lang = this.languages.find(
      (lang:any) => lang.slug === selectedLanguageSlug
    );

    // Default to a specific language ID if none is found (e.g., English)
    this.lang = lang ? lang.id : 1;
    this.apiUrl = environment.apiUrl;
    this.userToken = localStorage.getItem('authToken');
    this.domain = environment.targetDomain.id;

  }

  private apiUrl2 = environment.apiUrl;
  private stripe!: any;
  private stripePromise = loadStripe(environment.stripePublishableKey); // Replace with your Stripe publishable key

  // Method to create common headers for all requests
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`,
      // 'Domain': this.domain,
      // 'Lang': this.lang
    });
  }

  async getStripe() {
    return await this.stripePromise;
  }

  // Initialize Stripe.js with your publishable key
  async initializeStripe() {
    this.stripe = await loadStripe(environment.stripePublishableKey); // Use your Stripe Publishable Key
    return this.stripe;
  }

  // Create a payment method using Stripe.js
  async createPaymentMethod(card: StripeCardElement) {
    return this.stripe.createPaymentMethod({
      type: 'card',
      card: card,
    });
  }

  getRepresentators(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}club/get-representators`, {headers}
    );
  }

  // Call the backend to create a customer
  createCustomer(email: string, name: string, paymentMethodId: string): Observable<any> {
    // Replace with your CodeIgniter backend API URL
    return this.http.post('http://your-backend-url/create-customer', { email, name, paymentMethodId });
  }

  getClubHistory(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}club/get-club-history`, {headers}
    );
  }

  updateClubHistory(history:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}club/edit-club-history`, {club_history: history}, { headers });
  }

  updatePicOnHeader(pic: string) {
    this.messageSource.next(pic);
  }

  getNotifications(userId: any = 1): Observable<any> {
    return this.http.get<{ status: boolean, notifications: Notification[], unseen_count: number, total_count:number }>(
      `${this.apiUrl3}notifications?userId=${userId}`,
    );
  }


  getPackages(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-packages`,
      { headers }
    );
  }

  getUser(user: any): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/profile/${user}`,
      { headers }
    );
  }

  getBoosterData(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}user/get-booster-stats`,
      { headers }
    );
  }

  // Modified function to search clubs based on a search term
  searchClubs(clubName: string): Observable<any> {
    // Prepare the headers (if needed)
    const headers = this.headers();

    // Make the GET request to the API with the query parameter
    return this.http.get(`${this.apiUrl}get-clubs-list?club_name=${clubName}`, { headers });
  }


  getClubsForPlayer(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-clubs-list`, {headers}
    );
  }


  getViewTransferData(id:any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-transfer-detail/${id}`, { headers }
    );
  }


  getUserDomains(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}user/get-active-domains`, { headers }
    );
  }


  getExportLinkPurchaseData(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/export-purchase-history`, { headers }    );
  }

  getUserPlans(): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/get-active-packages`
    );
  }


  // Update newsletter subscription
  updateNewsletter(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/settings/newsletter`, params, { headers });
  }


  // Method to track boosted profile views
  trackProfiles(user_id: number, profileId: any[], action: string): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
      params = params.append('user_id', user_id);
      params = params.append('action',  action);
      profileId.forEach(id => {
        params = params.append('profile_viewed[]', id);  // Append each ID to the 'ids[]' query param
      });

    // Send POST request with payload in body
    return this.http.post<any>(`${this.apiUrl}user/track-booster-profile`, params, { headers });
  }


  getPerformanceReportsData(id:any): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}get-performance-reports/${id}`,
      { headers }
    );
  }

  getPerformanceList(id:any): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}get-performance-detail/${id}`,
      { headers }
    );
  }


  getGalleryFiles(id:any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-gallery/${id}`, { headers }
    );
  }


  getHighlightsFiles(id:any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-gallery-highlights/${id}`, { headers }
    );
  }

  // Method to track boosted profile views
  updateBoosterAudience(audienceIds: any[]): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    audienceIds.forEach(id => {
      params = params.append('booster_audience[]', id);  // Append each ID to the 'ids[]' query param
    });

    // Send POST request with payload in body
    return this.http.post(`${this.apiUrl}user/update-booster-audience`, params , {headers});
  }


  validateCoupon(couponCode: string): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
      params = params.append('coupon_code', couponCode);

    return this.http.post(`${this.apiUrl}user/validate-coupon`, params , {headers});
  }


  updateShowTour(userId: number, showTour: number): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
      params = params.append('user[show_tour]', showTour);

    // Send POST request with payload in body
    return this.http.post(`${this.apiUrl}club/update-general-info`, params , {headers});
  }

  // Fetch teams and store globally and in localStorage
  searchTeams(team:string): Observable<any> {

    const headers = this.headers();

    // Fetch teams from the API, store in global variable and localStorage
    return this.http.get(`${this.apiUrl}get-teams?search=${team}`, { headers }).pipe(
      tap((response: any) => {
        if (response && response.status) {
          this.teams = response.data.teams; // Store teams globally
        }
      }),
      catchError(this.handleError<any>('getTeams', [])) // Handle errors gracefully
    );

  }

  // Error handling method
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`); // Log error to console
      return of(result as T); // Return an empty result
    };
  }


  getPurchaseData(pageNumber: number, pageSize: number): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/get-purchase-history`, {
        params: {
          page: pageNumber.toString(),
          // limit: pageSize.toString()
        }
        ,headers
      }
    );
  }


  getFavoritesData(params: any): Observable<any> {
    const headers = this.headers();

    // Construct HttpParams object
    let queryParams = new HttpParams()
      .set('offset', params.offset || 0)
      .set('limit', params.limit || 10)
      .set('search', params.search || '');

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-favorites`, { params: queryParams , headers }
    );
  }

  // Download reports (assuming backend supports this feature)
  downloadReports(reportIds: string[]): Observable<any> {

    const headers = this.headers(); // Assuming this.headers() provides correct headers
    const body = { id: reportIds }; // Send report IDs as an array in the request body

    return this.http.post(`${this.apiUrl}club/download-performance-reports`, body, {
      headers // Specify response type for downloading files
    });
  }

  // talent.service.ts
  subscribeToPlan(subscriptionData: { paymentMethodId: string; planId: number; }): Observable<any> {
    const headers = this.headers();

    return this.http.post('/api/subscribe', subscriptionData, { headers });
  }


  getCountries(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-countries`, { headers }
    );

  }

  getDomains(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-domains`, { headers }
    );
  }


  // Fetch teams (without any search term)
  getClubs(): Observable<any> {
    const headers = this.headers();

    return this.http.get(`${this.apiUrl}get-clubs-list`, { headers });
  }

  getLeagues(): Observable<any> {
    const headers = this.headers();
    return this.http.get(`${this.apiUrl}get-leagues`, {headers});
  }

  getGalleryData(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-gallery`,
      { headers }
    );
  }

  getHighlightsData(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-gallery-highlights`,
      { headers }
    );
  }

  getPlans(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-packages`,
      { headers }
    );
  }

  getProfileData(userId: any = 1): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}profile`,
      { headers }
    );
  }

  getCards(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-payment-methods`,
      { headers }
    );
  }

  getCoverImg(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}user/get-cover-image`, {headers}
    );
  }

  // Method to update user profile
  updateUserProfile(formData: FormData): Observable<any> {
    const headers = this.headers();

    return this.http.post(`${this.apiUrl}user/update-profile`, formData, { headers });
  }

  // Method to update user profile
  updateGeneralProfile(formData: FormData): Observable<any> {
    const headers = this.headers();

    return this.http.post(`${this.apiUrl}club/update-general-info`, formData, { headers });
  }

  removeFavorites(params: any): Observable<any> {
    const headers = this.headers();
    return this.http.post<any>(`${this.apiUrl}delete-favorites`, params, { headers });
  }

  uploadCoverImage(formdata: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/upload-cover-image/`, formdata, { headers });
  }

  getAllUses(): Observable<any> {
    const headers = this.headers();

    // Construct HttpParams object
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}users-frontend-with-login?noLimit=true`, { headers }
    );
  }

  deleteCoverImage(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}user/delete-cover-image/`, {headers}
    );
  }

  uploadProfileImage(formdata: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/upload-profile-image/`, formdata, { headers });
  }

  uploadGalleryImages(formdata: any): Observable<any> {
    const headers = this.headers();
    return this.http.post<any>(`${this.apiUrl}user/upload-gallery-image/?lang=`+localStorage.getItem('lang_id'), formdata, { headers });
  }

  deleteGalleryImage(params:any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/delete-gallery-file`, params, { headers });
  }

  uploadReport(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}club/upload-performance-report`, params, {
      headers: headers,
      reportProgress: true,  // This enables progress tracking
      observe: 'events',     // This allows us to observe the full event stream, including upload progress
    });
  }

  /**
   * Change password for the user.
   * @param newPassword The new password to set.
   * @param confirmPassword The confirmation of the new password.
   * @returns Observable of the API response.
   */
  changePassword(newPassword: string, confirmPassword: string): Observable<any> {
    const headers = this.headers();

    const formData = new FormData();
    formData.append('new_password', newPassword);
    formData.append('new_con_password', confirmPassword);

    // POST request to the change-password API
    return this.http.post<any>(`${this.apiUrl}change-password`, formData, { headers });
  }

  

  getPositions(): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}/get-positions`,
      { headers }
    );
  }

  toggleFeaturedFiles(reportIds: any[]): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    reportIds.forEach(id => {
      params = params.append('id[]', id);  // Append each ID to the 'ids[]' query param
    });

    return this.http.post(`${this.apiUrl}user/set-featured-file`, params , {headers});
  }


  getExploresData(params: any): Observable<any> {
    let queryParams = new HttpParams()
      // Basic pagination parameters
      .set('offset', params.offset || 0)
      .set('limit', params.limit || 10);

    // Add whereClause filters
    if (params.whereClause) {
      Object.keys(params.whereClause).forEach(key => {
        const value = params.whereClause[key];
        if (Array.isArray(value)) {
          // If the value is an array (like for position or age), append each value
          value.forEach(val => {
            queryParams = queryParams.append(`whereClause[${key}][]`, val);
          });
        } else {
          queryParams = queryParams.set(`whereClause[${key}]`, value);
        }
      });
    }

    // Add metaQuery filters
    if (params.metaQuery && Array.isArray(params.metaQuery)) {
      params.metaQuery.forEach((meta: any, index: number) => {
        // Set meta_key and operator directly
        queryParams = queryParams
          .set(`metaQuery[${index}][meta_key]`, meta.meta_key)
          .set(`metaQuery[${index}][operator]`, meta.operator);

        // Handle meta_value separately if it's an array
        if (Array.isArray(meta.meta_value)) {
          meta.meta_value.forEach((value: any, valueIndex: number) => {
            queryParams = queryParams.set(`metaQuery[${index}][meta_value][${valueIndex}]`, value);
          });
        } else {
          queryParams = queryParams.set(`metaQuery[${index}][meta_value]`, meta.meta_value);
        }
      });
    }

    // Add ordering parameters if needed
    if (params.orderBy) {
      queryParams = queryParams
        .set('orderBy', params.orderBy)
        .set('order', params.order || 'desc');
    }

    // Add other query parameters
    if (params.countOnly) {
      queryParams = queryParams.set('countOnly', 'true');
    }
    if (params.noLimit) {
      queryParams = queryParams.set('noLimit', 'true');
    }

    const headers = this.headers();

    // Send the HTTP GET request with both params and headers
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}users-frontend-with-login`,
      { params: queryParams, headers } // Combine params and headers here
    );
  }

  // Fetch teams and store globally and in localStorage
  getTeams(): Observable<any> {
    const headers = this.headers();

    const cachedTeams = localStorage.getItem('teams');

    if (cachedTeams) {
      // Parse and return teams from localStorage if available
      this.teams = JSON.parse(cachedTeams);
      return of(this.teams);
    } else if (this.teams.length) {
      // If teams are already fetched globally, return them
      return of(this.teams);
    } else {
      // Fetch teams from the API, store in global variable and localStorage
      return this.http.get<any>(`${this.apiUrl}get-teams`, { headers }).pipe(
        tap((response: any) => {
          if (response && response.status) {
            this.teams = response.data.teams; // Store teams globally
            localStorage.setItem('teams', JSON.stringify(this.teams)); // Cache in localStorage
          }
        }),
        catchError(this.handleError<any>('getTeams', [])) // Handle errors gracefully
      );
    }
  }

  getSightings(id:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}club/get-sightings`, {params}
    );
  }

  getSingleSighting(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}club/get-sighting/${id}`);
  }


  deleteSightings(params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}club/delete-sighting`, params, { headers });
  }

  deleteAttachment(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}club/delete-sighting-attachment/${id}`, {headers}
    );
  }


  getClubTeamPlayers(teamId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}club/get-club-players/${teamId}`, {headers}
    );
  }


  getAllPlayers(): Observable<any> {
    const params = new HttpParams()
      .set('whereClause[role]',4)
      .set('noLimit', true)
      .set('orderBy', 'id')
      .set('order', 'desc');

    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl}users-frontend-with-login`,
      { params }
    );
  }


  addSight(id:any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/add-sighting`, params, { headers });
  }

  updateSight(id:any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/edit-sighting-detail/${id}`, params, { headers });
  }

  uploadSightAttachment(id:any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/add-sighting-attachments/${id}`, params, { headers });
  }

  sendSightingInvite(id:any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/add-sighting-invites/${id}`, params, { headers });
  }

  addTeamPlayer(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/add-club-player`, params, { headers });
  }

  updateTeamPlayer(id:any,params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/edit-club-player/${id}`, params, { headers });
  }


  sendScoutPortfolioInvite(id:any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}club/add-club-player`, params, { headers });
  }


  sendInviteToRepresentator(userId:any, params:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl}club/add-representator`, params, { headers });
  }

  updateRepresentatorRole(id:any, params:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl}club/update-representator-role/${id}`, params, { headers });
  }

  updateRepresentator(id:any, params:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl}club/update-profile/${id}`, params, { headers });
  }


  deleteRepresentator(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}club/delete-representator/${id}`, {headers}
    );
  }


}

