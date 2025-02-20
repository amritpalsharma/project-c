import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
    private apiUrl;

    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;
    }

    getAdvertisements(params:any): Observable<{ status: boolean, message: string, data: any }> {
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-advertisements`, {params}
          );
    }

    createAd(record: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/add-advertisement`, record);
    }
    // Method to update an existing record
    updateAd(id: any, record: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/edit-advertisement/${id}`, record);
    }

    // Method to delete a record by IDs
    deleteAdvertisements(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/delete-advertisement`, params);
    }

    publishAdvertisements(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/publish-advertisement`, params);
    }

    draftAdvertisements(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/draft-advertisement`, params);
    }

    expireAdvertisements(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/expire-advertisement`, params);
    }

    getPageAds(){
        return this.http.get<any>(`${this.apiUrl}admin/get-pages`);
    }
    getAdvertisementType(id:any){
        return this.http.get<any>(`${this.apiUrl}admin/get-page-ads/${id}`);
    }
}