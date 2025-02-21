import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { User } from '../modules/admin/users/user.model';
import { environment } from '../../environments/environment';
import { Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // For storing data after fetching

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
export class TalentService {
  private apiUrl: string;
  private domain: any;
  private userToken: string | null;
  public teams: any[] = [];
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();
  public lang: any;
  languages: any = environment.langs;
  private apiUrl3 = "https://alerts.socceryou.ch/";

  constructor(private http: HttpClient) {

    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = localStorage.getItem('lang') || '';

    // Find the corresponding language ID from the langs array
    const lang = this.languages.find(
      (lang: any) => lang.slug === selectedLanguageSlug
    );

    // Default to a specific language ID if none is found (e.g., English)
    this.lang = lang ? lang.id : 1;

    this.apiUrl = environment.apiUrl;
    this.userToken = localStorage.getItem('authToken');
    this.domain = environment.targetDomain.id;
    console.log(this.domain);
  }

  // Method to create common headers for all requests
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`,
      // 'Domain': this.domain,
      // 'Lang': this.lang
    });
  }

  updatePicOnHeader(pic: string) {
    this.messageSource.next(pic);
  }

  getNotifications(userId: any = 1, langId: any): Observable<any> {
    return this.http.get<{ status: boolean, notifications: Notification[], unseen_count: number, total_count: number }>(
      `${this.apiUrl3}notifications?userId=${userId}&langId=${langId}`,
    );
  }

  updateNotificationSeen(id: number, seen: number): Observable<any> {
    return this.http.get<{ status: boolean, message: string }>(
      `${this.apiUrl3}updateNotificationSeen?id=${id}&seen=${seen}`,
    );
  }

  getProfileData(params: any = {}): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}profile`,
      { headers, params }
    );
  }

  getPackages(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-packages?lang=`+localStorage.getItem('lang_id'),
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

  getCards(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-payment-methods`,
      { headers }
    );
  }

  getUser(user: any, params: any = {}): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/profile/${user}`,
      { headers, params }
    );
  }

  getGalleryData(params: any = {}): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-gallery`,
      { headers, params }
    );
  }

  getHighlightsData(params: any = {}): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-gallery-highlights`,
      { headers, params }
    );
  }

  getBoosterData(params: any = {}): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-booster-stats`,
      { headers, params }
    );
  }

  // Modified function to search clubs based on a search term
  searchClubs(clubName: string): Observable<any> {
    // Prepare the headers (if needed)
    const headers = this.headers();

    // Make the GET request to the API with the query parameter
    return this.http.get(`${this.apiUrl}get-clubs-list?club_name=${clubName}`, { headers });
  }

  // Fetch teams (without any search term)
  getClubs(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.get(`${this.apiUrl}get-clubs-list`, { headers, params });
  }

  getClubsForPlayer(): Observable<any> {
    const headers = this.headers();
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-clubs-list`, { headers }
    );
  }

  getLeagues(params: any): Observable<any> {
    const headers = this.headers();
    return this.http.get(`${this.apiUrl}get-leagues`, { headers, params });
  }

  getCoverImg(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}user/get-cover-image`, { headers }
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

    return this.http.post(`${this.apiUrl}player/update-general-info`, formData, { headers });
  }

  getPerformanceData(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}player/get-performance-detail`, { headers }
    );
  }

  getTransferData(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}player/get-transfer-detail`, { headers }
    );
  }

  getViewTransferData(id: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-transfer-detail/${id}`, { headers }
    );
  }

  getCountries(params: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-countries`, { headers, params }
    );

  }

  getDomains(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-domains`, { headers, params }
    );
  }

  getUserDomains(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-active-domains`, { headers, params }
    );
  }

  removeFavorites(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}delete-favorites`, params, { headers });
  }

  getExportLinkPurchaseData(params: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/export-purchase-history`, { headers, params });
  }

  getUserPlans(params: any = {}): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/get-active-packages`, { params }
    );
  }

  uploadCoverImage(formdata: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/upload-cover-image/`, formdata, { headers });
  }

  // getFavoritesData(userId:any, params:any): Observable<any> {
  //   return this.http.get<{ status: boolean, message: string, data: { } }>(
  //     `${this.apiUrl}get-favorites`    );
  // }

  getAllUses(): Observable<any> {
    const headers = this.headers();

    // Construct HttpParams object
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}users-frontend-with-login?noLimit=true`, { headers }
    );
  }

  deleteCoverImage(): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/delete-cover-image/`, { headers }
    );
  }

  uploadProfileImage(formdata: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/upload-profile-image/`, formdata, { headers });
  }

  uploadGalleryImages(formdata: any): Observable<any> {
    const headers = this.headers();
    let currentLang = localStorage.getItem('lang_id');
    return this.http.post<any>(`${this.apiUrl}user/upload-gallery-image/${currentLang}/`, formdata, { headers });
  }

  deleteGalleryImage(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/delete-gallery-file`, params, { headers });
  }

  updateTransferDetails(transferId: number, transferData: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(
      `${this.apiUrl}player/edit-transfer-detail/${transferId}`,
      transferData,
      { headers }
    );
  }

  getPerformanceReports(): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}player/get-performance-reports`,
      { headers }
    );
  }


  updatePerformance(performanceId: any, params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/edit-performance-detail/${performanceId}`, params, { headers });
  }

  // Update newsletter subscription
  updateNewsletter(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}user/settings/newsletter`, params, { headers });
  }

  uploadReport(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/upload-performance-report`, params, {
      headers: headers,
      reportProgress: true,  // This enables progress tracking
      observe: 'events',     // This allows us to observe the full event stream, including upload progress
    });
  }


  addPerformance(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/add-performance-detail`, params, { headers });
  }

  deletePerformanceReport(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/delete-performance-report`, params, { headers });
  }

  deletePerformance(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(`${this.apiUrl}player/delete-performance-detail/${params}`, { headers });
  }

  updateTransfer(transferId: any, params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/edit-transfer-detail/${transferId}`, params, { headers });
  }

  addTransfer(params: any): Observable<any> {
    const headers = this.headers();

    return this.http.post<any>(`${this.apiUrl}player/add-transfer-detail/`, params, { headers });
  }

  deleteTransfer(id: any): Observable<any> {
    const headers = this.headers();

    // Make sure you use DELETE, not GET
    return this.http.get<any>(`${this.apiUrl}player/delete-transfer-detail/${id}`, { headers });
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


  getPositions(params: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}/get-positions`,
      { headers, params }
    );
  }

  toggleFeaturedFiles(reportIds: any[]): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    reportIds.forEach(id => {
      params = params.append('id[]', id);  // Append each ID to the 'ids[]' query param
    });

    return this.http.post(`${this.apiUrl}user/set-featured-file`, params, { headers });
  }


  getPerformanceReportsData(id: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}get-performance-reports/${id}`,
      { headers }
    );
  }

  getPerformanceList(id: any): Observable<any> {
    const headers = this.headers();

    return this.http.get<any>(
      `${this.apiUrl}get-performance-detail/${id}`,
      { headers }
    );
  }


  getGalleryFiles(id: any, params: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-gallery/${id}`, { headers, params }
    );
  }


  getHighlightsFiles(id: any, params: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-gallery-highlights/${id}`, { headers, params }
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
    return this.http.post(`${this.apiUrl}user/update-booster-audience`, params, { headers });
  }


  validateCoupon(couponCode: string): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    params = params.append('coupon_code', couponCode);

    return this.http.post(`${this.apiUrl}user/validate-coupon`, params, { headers });
  }


  updateShowTour(userId: number, showTour: number): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    params = params.append('user[show_tour]', showTour);

    // Send POST request with payload in body
    return this.http.post(`${this.apiUrl}player/update-general-info`, params, { headers });
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

  // Fetch teams and store globally and in localStorage
  searchTeams(team: string): Observable<any> {

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


  getPurchaseData(pageNumber: number, pageSize: number, lang: any = {}): Observable<any> {
    const headers = this.headers();

    return this.http.get<{ status: boolean, message: string, data: any }>(
      `${this.apiUrl}user/get-purchase-history`, {
      params: {
        page: pageNumber.toString(),
        lang: lang,
        // limit: pageSize.toString()
      }
      , headers
    }
    );
  }


  getFavoritesData(params: any): Observable<any> {
    const headers = this.headers();

    // Construct HttpParams object
    // let queryParams = new HttpParams()
    //   .set('offset', params.offset || 0)
    //   .set('limit', params.limit || 10)
    //   .set('search', params.search || '')
    //   .set('whereClause[user_domain]', params.location || '')
    //   .set('whereClause[role]', params.role || '');
    let queryParams = new HttpParams();

    // Conditionally append parameters only if they have a value
    // if (params.offset !== undefined) {
      queryParams = queryParams.set('offset', params.offset);
    // }

    // if (params.limit !== undefined) {
      queryParams = queryParams.set('limit', params.limit);
    // }

    // if (params.search) {
      queryParams = queryParams.set('search', params.search);
    // }

    if (params.user_domain) {
      queryParams = queryParams.set('whereClause[user_domain]', params.user_domain);
    }

    if (params.role) {
      queryParams = queryParams.set('whereClause[role]', params.role);
    }
    console.log(params);


    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-favorites`, { params: queryParams, headers }
    );
  }

  // Download reports (assuming backend supports this feature)
  // downloadReports(reportIds: string[]): Observable<any> {
  //   console.log(reportIds);

  //   const headers = this.headers();

  //   let params = new HttpParams();
  //   reportIds.forEach(id => {
  //     params = params.append('id[]', id);  // Append each ID to the 'ids[]' query param
  //   });

  //   return this.http.post(`${this.apiUrl}player/download-performance-reports`, { params, responseType: 'blob',headers });
  // }

  // Download reports (assuming backend supports this feature)
  downloadReports(reportIds: string[]): Observable<any> {

    const headers = this.headers(); // Assuming this.headers() provides correct headers
    const body = { id: reportIds }; // Send report IDs as an array in the request body

    return this.http.post(`${this.apiUrl}player/download-performance-reports`, body, {
      headers // Specify response type for downloading files
    });
  }

  // talent.service.ts
  subscribeToPlan(subscriptionData: { paymentMethodId: string; planId: number; }): Observable<any> {
    const headers = this.headers();

    return this.http.post('/api/subscribe', subscriptionData, { headers });
  }

  // Method to track boosted profile views
  trackProfiles(user_id: number, profileId: any[], action: string): Observable<any> {
    const headers = this.headers();

    let params = new HttpParams();
    params = params.append('user_id', user_id);
    params = params.append('action', action);
    profileId.forEach(id => {
      params = params.append('profile_viewed[]', id);  // Append each ID to the 'ids[]' query param
    });

    // Send POST request with payload in body
    return this.http.post<any>(`${this.apiUrl}user/track-booster-profile`, params, { headers });
  }

}
