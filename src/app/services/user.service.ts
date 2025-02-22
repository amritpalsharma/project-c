
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../modules/admin/users/user.model';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl;
  private userToken;
  private apiUrl2 = 'https://api.socceryou.ch/api/admin';
  
  private adminImageUrlSource = new BehaviorSubject<string>('default');
  adminImageUrl = this.adminImageUrlSource.asObservable();

  constructor(private http: HttpClient) {
    this.apiUrl = environment?.apiUrl;
    this.userToken = localStorage.getItem('authToken');
  }

  changeImageUrl(newUrl: string) {
    this.adminImageUrlSource.next(newUrl);
  }

  // getUsers(pageIndex: number, pageSize: number, filter: string): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
  getUsers(data: any = {}): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
    // const params = new HttpParams()
    //   .set('offset',pageIndex)
    //   .set('search',filter)
    //   .set('limit', pageSize)
    //   .set('orderBy', 'id')
    //   .set('order', 'desc');

    let params = new HttpParams();
  
    // Loop through the queryParams object and set each parameter
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key]);
      }
    }
    // params = params.set("whereClause[membership]", 'free');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl}admin/users`,
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

    return this.http.post<any>(`${this.apiUrl2}/update-user-status`, { id: userIds, status: newStatus, lang:lang }, { headers });
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
    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl}get-domains`
    );
  }

  getProfileData(userId:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { userData: User[] } }>(
      `${this.apiUrl}admin/profile/${userId}`
    );
  }

  getGalleryData(userId:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}admin/get-gallery/${userId}`
    );
  }

  getFavoritesData(userId:any, params:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}admin/get-favorites/${userId}`, { params }
    );
  }
  
  addFavoritesData(id: any): Observable<any> {
    const formData = new FormData();
    formData.append('favorite_id', id);
    
    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}add-favorite`, 
      formData // directly pass formData here
    );
  }
  
  removeFavoritesData(id: any): Observable<any> {
    const formData = new FormData();
    formData.append('id[]', id);
    
    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}delete-favorites`, 
      formData // directly pass formData here
    );
  }

  removeSingleFavorite(id: any): Observable<any> {
    const formData = new FormData();
    formData.append('id[]', id);
    
    return this.http.post<{ status: boolean, message: string, data: {} }>(
      `${this.apiUrl}remove-favorites-talent`, 
      formData // directly pass formData here
    );
  }
  
  getPurchaseData(userId:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}admin/get-purchase-history/${userId}`
    );
  }

  getTransferData(userId:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}admin/get-transfer-detail/${userId}`
    );
  }

  deleteUser(userIds: any, langId: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/delete-user`, { id: userIds, lang: langId }, { headers });
  }

  getPerformanceData(userId:any): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-performance-detail/${userId}`
    );
  }

  getAllTeams(): Observable<any> {
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-teams`
    );
  }

  updatePerformance(performanceId:any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/edit-performance-detail/${performanceId}`, params, { headers });
  }

  updateTransfer(transferId:any, params: any): Observable<any> {
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

  uploadCoverImage(userId:any, formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/upload-cover-image/${userId}`, formdata, { headers });
  }

  deleteCoverImage(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/delete-cover-image/${userId}`, {headers}
    );
  }

  uploadGalleryImages(userId:any, formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    console.log('Data sending......')
    console.log(formdata);
    return this.http.post<any>(`${this.apiUrl2}/upload-gallery-image/${userId}/?lang=`+localStorage.getItem('lang_id'), formdata, { headers });
  }

  deleteGalleryImage(params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/delete-gallery-file`, params, { headers });
  }

  getScoutHistory(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-company-history/${userId}`, {headers}
    );
  }

  getClubHistory(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-club-history/${userId}`, {headers}
    );
  }

  updateScoutHistory(userId:any, history:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/add-company-history/${userId}`, {company_history: history}, { headers });
  }

  updateClubHistory(userId:any, history:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/edit-club-history/${userId}`, {club_history: history}, { headers });
  }

  getScoutPlayers(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-scout-players/${userId}`, {headers}
    );
  }

  deleteScoutPlayer(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/delete-scout-player/${id}`, {headers}
    );
  }

  getClubTeams(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-club-teams/${id}`, {headers}
    );
  }

  getTeamPlayers(teamId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-club-players/${teamId}`, {headers}
    );
  }

  getSightings(id:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-sightings/${id}`, {params}
    );
  }

  getSingleSighting(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-sighting/${id}`);
  }

  uploadProfileImage(userId:any, formdata: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/upload-profile-image/${userId}`, formdata, { headers }); 
  }

  getAdminProfile(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}profile`, {headers}
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
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-countries`, {headers}
    );
  }
  getPositions(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-positions`, {headers}
    );
  }

  getClubsForPlayer(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-clubs-list`, {headers}
    );
  }

  updateUser(userId:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/update-profile/${userId}`, params, { headers }); 
  }

  getRepresentators(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-representators/${userId}`, {headers}
    );
  }

  getTeamsByClub(clubId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl}get-club-teams/${clubId}`, {headers}
    );
  }

  sendInviteToRepresentator(userId:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/add-representator/${userId}`, params, { headers }); 
  }

  updateRepresentatorRole(id:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/update-representator-role/${id}`, params, { headers }); 
  }

  updateRepresentator(id:any, params:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.post<any>(`${this.apiUrl2}/update-profile/${id}`, params, { headers }); 
  }
  
  deleteRepresentator(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/delete-representator/${id}`, {headers}
    );
  }

  getAdminRepresentators(): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/get-representators`, {headers}
    );
  }

  sendInviteToAdminRepresentator(params:any): Observable<any> {
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
    
    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl2}/export-users?noLimit=1`,
      { params }
    );
  }

  exportSingleUser(userId:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<any>(
      `${this.apiUrl}export-single-user/${userId}`, {headers}
    );
  }

  deleteSightings(params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/delete-sighting`, params, { headers });
  }

  deleteAttachment(id:any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });
    return this.http.get<{ status: boolean, message: string, data: { } }>(
      `${this.apiUrl2}/delete-sighting-attachment/${id}`, {headers}
    );
  }

  getAllPlayers(): Observable<any> {
    const params = new HttpParams()
      .set('whereClause[role]',4)
      .set('noLimit', true)
      .set('orderBy', 'id')
      .set('order', 'desc');

    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl}admin/users`,
      { params }
    );
  }

  addSight(id:any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting/${id}`, params, { headers });
  }

  updateSight(id:any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/edit-sighting-detail/${id}`, params, { headers });
  }

  uploadSightAttachment(id:any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting-attachments/${id}`, params, { headers });
  }

  sendSightingInvite(id:any, params: any): Observable<any> {
    const userToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    return this.http.post<any>(`${this.apiUrl2}/add-sighting-invites/${id}`, params, { headers });
  }

  sendScoutPortfolioInvite(id:any, params: any): Observable<any> {
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


}
