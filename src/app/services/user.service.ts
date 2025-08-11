
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../modules/admin/users/user.model';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl;
  private userToken;
  private apiUrl2 = 'https://api.socceryou.ch/api/admin';

  private adminImageUrlSource = new BehaviorSubject<string>('default');
  adminImageUrl = this.adminImageUrlSource.asObservable();
  errorTxt: string = '';
  errorMsgTxt: string = '';
  constructor(
    private http: HttpClient,
    private toaster: ToastrService,
    private translateService: TranslateService
  ) {
    this.apiUrl = environment?.apiUrl;
    this.userToken = localStorage.getItem('authToken');

  }

  changeImageUrl(newUrl: string) {
    this.adminImageUrlSource.next(newUrl);
  }

  // getUsers(pageIndex: number, pageSize: number, filter: string): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
  getUsers(data: any = {}): Observable<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }> {
    // const params = new HttpParams()
    //   .set('offset',pageIndex)
    //   .set('search',filter)
    //   .set('limit', pageSize)
    //   .set('orderBy', 'id')
    //   .set('order', 'desc');

    let params = new HttpParams();
    let currentLang = localStorage.getItem('lang_id');

    // Loop through the queryParams object and set each parameter
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key]);
      }
    }
    // params = params.set("whereClause[membership]", 'free');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }>(
      `${this.apiUrl}admin/users/${currentLang}`,
      { params }
    );
  }

  updateUserStatus(userIds: any, newStatus: number): Observable<any> {

    const userToken = localStorage.getItem('authToken');
    const lang = localStorage.getItem('lang_id');

    // Set headers with token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/update-user-status`, { id: userIds, status: newStatus, lang: lang }, { headers });
  }

  // getProfileData(): Observable<any> {
  //   const authToken = localStorage.getItem('authToken'); 

  //   // Example headers with authorization token
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${authToken}`,
  //     'Content-Type': 'application/json'
  //   });

  //   return this.http.get<any>(`${this.apiUrl2}/profile/`, { headers });
  // }

  getLocations(): Observable<any> {
    const lang = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }>(
      `${this.apiUrl}get-domains/${lang}?lang=` + lang
    );
  }

  getProfileData(userId: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}admin/profile/${lang_id}/${userId}`
    );
  }

  getProfileDataAdmin(userId: any, lang_id: number): Observable<any> {
    // let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}admin/profile/${lang_id}/${userId}`
    );
  }

  getGalleryData(userId: any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}admin/get-gallery/${userId}`
    );
  }

  getFavoritesData(userId: any, params: any): Observable<any> {
    // let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}admin/get-favorites/${userId}`, { params }
    );
  }

  addFavoritesData(id: any): Observable<any> {
    const formData = new FormData();
    let lang_id = localStorage.getItem('lang_id');
    formData.append('favorite_id', id);
    formData.append('lang_id', String(lang_id));
    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}add-favorite`,
      formData // directly pass formData here
    );
  }

  removeFavoritesData(id: any): Observable<any> {
    const formData = new FormData();
    let lang_id = localStorage.getItem('lang_id');
    formData.append('id[]', id);
    formData.append('lang_id', String(lang_id));
    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}delete-favorites`,
      formData // directly pass formData here
    );
  }

  removeSingleFavorite(id: any): Observable<any> {
    const formData = new FormData();
    let lang_id = localStorage.getItem('lang_id');
    formData.append('id[]', id);
    formData.append('lang_id', String(lang_id));

    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}remove-favorites-talent`,
      formData // directly pass formData here
    );
  }

  getPurchaseData(userId: any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}admin/get-purchase-history/${userId}`
    );
  }

  getTransferData(userId: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}admin/get-transfer-detail/${lang_id}/${userId}`
    );
  }

  deleteUser(userIds: any, langId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/delete-user`, { id: userIds, lang: langId }, { headers });
    // return this.http.post<any>(`${this.apiUrl2}/permanent-delete-user`, { id: userIds, lang: langId }, { headers });
  }

  getPerformanceData(userId: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-performance-detail/${lang_id}/${userId}`
    );
  }

  getPerformanceAnalysis(userId: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-performance-reports/${userId}`
    );
  }


  getAllTeams(): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-teams`
    );
  }

  updatePerformance(performanceId: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    console.info('recivedDataInService', params);
    if (params?.type == 'manual') {
      return this.http.post<any>(`${this.apiUrl2}/edit-performance-detail-manual/${performanceId}/${lang_id}`, params, { headers });
    } else {
      return this.http.post<any>(`${this.apiUrl2}/edit-performance-detail/${performanceId}/${lang_id}`, params, { headers });
    }
  }

  updateTransfer(transferId: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/edit-transfer-detail/${transferId}`, params, { headers });
  }

  removeFavorites(params: any): Observable<any> {
    // const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}delete-favorites`, params, { headers });
  }

  uploadCoverImage(userId: any, formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/upload-cover-image/${userId}`, formdata, { headers });
  }

  deleteCoverImage(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/delete-cover-image/${userId}`, { headers }
    );
  }

  // uploadGalleryImages(userId: any, formdata: any): Observable<any> {
  //   const userToken = localStorage.getItem('authToken');
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.userToken}`
  //   });
  //   console.log('Data sending......')
  //   console.log(formdata);
  //   return this.http.post<any>(`${this.apiUrl2}/upload-gallery-image/${userId}/?lang=` + localStorage.getItem('lang_id'), formdata, { headers });
  // }

  uploadGalleryImages(userId: any, formdata: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let currentLang = localStorage.getItem('lang_id') + '';
    return this.http.post<any>(`${this.apiUrl2}/upload-gallery-image/${userId}/?lang=` + localStorage.getItem('lang_id'), formdata,

      {
        headers, reportProgress: true,
        observe: 'events'
      });
  }

  deleteGalleryImage(params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/delete-gallery-file`, params, { headers });
  }

  getScoutHistory(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-company-history/${userId}`, { headers }
    );
  }

  getClubHistory(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-club-history/${userId}`, { headers }
    );
  }

  updateScoutHistory(userId: any, history: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/add-company-history/${userId}`, { company_history: history }, { headers });
  }

  updateClubHistory(userId: any, history: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/edit-club-history/${userId}`, { club_history: history }, { headers });
  }

  getScoutPlayers(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    let lang_id = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-scout-players/${lang_id}/${userId}`, { headers }
    );
  }

  getScoutPlayersAdmin(userId: any, lang_id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    // let lang_id = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-scout-players/${lang_id}/${userId}`, { headers }
    );
  }

  deleteScoutPlayer(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const lang_id = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/delete-scout-player/${id}/${lang_id}`, { headers }
    );
  }

  getClubTeams(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-club-teams/${id}`, { headers }
    );
  }

  getTeamPlayers(teamId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-club-players/${teamId}`, { headers }
    );
  }

  getSightings(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-sightings/${id}`, { params }
    );
  }

  getClubSightings(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-sightings/${id}?whereClause[status]=active`, { params }
    );
  }

  getClubSingleSighting(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}/get-sighting/${id}`);
  }

  getSingleSighting(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-sighting/${id}`);
  }

  uploadProfileImage(userId: any, formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/upload-profile-image/${userId}`, formdata, { headers });
  }

  getAdminProfile(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const lang = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}profile/${lang}`, { headers }
    );
  }

  updateAdminProfile(formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/settings/profile`, formdata, { headers });
  }

  updateAdminImage(formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/settings/upload-profile-image`, formdata, { headers });
  }

  getCountries(): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-countries/${lang_id}`, { headers }
    );
  }
  getPositions(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-positions/${lang_id}`, { headers }
    );
  }

  getClubsForPlayer(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-clubs-list`, { headers }
    );
  }

  updateUser(userId: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/update-profile/${userId}`, params, { headers });
  }

  getRepresentators(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-representators/${userId}`, { headers }
    );
  }

  getTeamsByClub(clubId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}get-club-teams/${clubId}`, { headers }
    );
  }

  sendInviteToRepresentator(userId: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/add-representator/${userId}`, params, { headers });
  }

  updateRepresentatorRole(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    return this.http.post<any>(`${this.apiUrl2}/update-representator-role/${id}/${lang_id}`, params, { headers });
  }

  updateRepresentator(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/update-profile/${id}`, params, { headers });
  }

  deleteRepresentator(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/delete-representator/${id}/${lang_id}`, { headers }
    );
  }

  getAdminRepresentators(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/get-representators`, { headers }
    );
  }

  sendInviteToAdminRepresentator(params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/add-representator`, params, { headers });
  }

  exportUsers(data: any): Observable<any> {

    let params = new HttpParams();
    // Loop through the queryParams object and set each parameter
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key]);
      }
    }

    return this.http.get<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }>(
      `${this.apiUrl2}/export-users?noLimit=1`,
      { params }
    );
  }

  exportSingleUser(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    let random = Math.random() * 10;
    return this.http.get<any>(
      `${this.apiUrl}export-single-user/${userId}/${lang_id}?num=${random}`, { headers }
    );
  }

  deleteSightings(params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/delete-sighting`, params, { headers });
  }

  deleteAttachment(id: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/delete-sighting-attachment/${id}`, { headers }
    );
  }

  getAllPlayers(): Observable<any> {
    const params = new HttpParams()
      .set('whereClause[role]', 4)
      .set('noLimit', true)
      .set('orderBy', 'id')
      .set('order', 'desc');

    return this.http.get<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }>(
      `${this.apiUrl}admin/users`,
      { params }
    );
  }

  addSight(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting/${id}`, params, { headers });
  }

  updateSight(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/edit-sighting-detail/${id}`, params, { headers });
  }

  uploadSightAttachment(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting-attachments/${id}`, params, { headers });
  }

  sendSightingInvite(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting-invites/${id}`, params, { headers });
  }

  sendScoutPortfolioInvite(id: any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-scout-player/${id}`, params, { headers });
  }


  searchUser(query: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<any[]>(`${this.apiUrl}search?search=${query}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error occurred during user search:', error);
        throw error;
      })
    );
  }

  exploreSearchUser(query: string, isOnlyTalent = false): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let whereClasue = '';
    if (isOnlyTalent) {
      whereClasue = "&whereClause[role]=4";
    }
    return this.http.get<any[]>(`${this.apiUrl}users-frontend-with-login?search=${query}&noLimit=1${whereClasue}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error occurred during user search:', error);
        throw error;
      })
    );

    // return this.http.get <any[]{ status: boolean, message: string, data: { } }> (
    //   `${this.apiUrl}users-frontend-with-login`,
    //   { params: queryParams, headers } // Combine params and headers here
    // );
  }
  // Function By amrit
  getUsersAll(data: any = {}): Observable<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }> {
    // const params = new HttpParams()
    //   .set('offset',pageIndex)
    //   .set('search',filter)
    //   .set('limit', pageSize)
    //   .set('orderBy', 'id')
    //   .set('order', 'desc');

    let params = new HttpParams();
    let currentLang = localStorage.getItem('lang_id');

    // Loop through the queryParams object and set each parameter
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key]);
      }
    }
    params = params.set('noLimit', true);
    // params = params.set("whereClause[membership]", 'free');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[], totalCount: number } }>(
      `${this.apiUrl}admin/users/${currentLang}`,
      { params }
    );
  }

  getRoles() {
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<any>(`${this.apiUrl}get-roles/${lang_id}`);
  }

  apiToasterError() {
    this.translateService.get(['error', 'forgotPassword.generalError']).subscribe((translations) => {
      this.errorTxt = translations['error'];
      this.errorMsgTxt = translations['forgotPassword.generalError'];
      this.toaster.error(this.errorMsgTxt, this.errorTxt);
    });
  }

  apiToastError(message: string) {
    this.toaster.error(message);
  }

  userGetScoutPlayers(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    let lang_id = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}/user/get-scout-players/${lang_id}/${userId}`, { headers }
    );
  }

  getUserPopups(data: any = {}): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    let params = new HttpParams();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(`whereClause[${key}]`, data[key]);
      }
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-system-popups/${lang_id}`, { headers, params }
      // https://api.socceryou.ch/api/user/get-system-popups/1
    );
    // return this.http.post<any>(`${this.apiUrl2}/edit-performance-detail/${performanceId}`, params, { headers });
  }

  getPopupSeen(data: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    let params = new HttpParams();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(`whereClause[${key}]`, data[key]);
      }
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-popup-seens/${lang_id}`, { headers, params }
    );
  }

  addPopupSeen(data: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');

    let formData = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(`${key}`, data[key]);
      }
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(
      `${this.apiUrl}user/add-popup-seen/${lang_id}`, formData, { headers }
    );
  }

  editPopupSeen(id: any, data: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');

    let formData = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(`${key}`, data[key]);
      }
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(
      `${this.apiUrl}user/edit-popup-seen/${id}/${lang_id}`, formData, { headers }
    );
  }

  userGetRepresentators(userId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/get-representators/${userId}`, { headers }
    );
  }

  deleteProfileImage(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    let lang_id = localStorage.getItem('lang_id');
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}user/delete-profile-image/${lang_id}`, { headers }
    );
  }

  deleteProfileImageAdmin(userId: any): Observable<any> {
    let lang_id = localStorage.getItem('lang_id');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl2}/delete-profile-image/${lang_id}/${userId}`, { headers }
    );
  }

  getClubTeamsByGroup(id: any, team_group: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      // `${this.apiUrl}get-club-teams/${id}?`, { headers }
      `${this.apiUrl}get-club-teams/${id}?team_group=${team_group}`, { headers }
    )
  }

  getClubTeamsByGroupAndClubId(id: any, team_group: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      // `${this.apiUrl}get-club-teams/${id}?`, { headers }
      `${this.apiUrl}get-teams?club_id=${id}&team_group=${team_group}`, { headers }
    )
  }

  searchTeams(team: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    // Fetch teams from the API, store in global variable and localStorage
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `https://api.socceryou.ch/api/get-teams?search=${team}`, { headers }
    );

  }


  searchTeamsAdmin(club_id: string): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    // Fetch teams from the API, store in global variable and localStorage
    return this.http.get<{ status: boolean, message: string, data: {} }>(
      `https://api.socceryou.ch/api/get-teams?club_id=${club_id}`, { headers }
    );

  }

  addTeamPlayerAdmin(params: any, clubID: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}admin/add-club-player/${clubID}`, params, { headers });
  }


  updateTeamPlayer(id: any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl}admin/edit-club-player/${id}`, params, { headers });
  }

}
