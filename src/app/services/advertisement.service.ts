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
        let currentLang = localStorage.getItem('lang_id');
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-advertisements/${currentLang}`, {params}
          );
    }

    createAd(record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/add-advertisement/${currentLang}`, record);
    }
    // Method to update an existing record
    updateAd(id: any, record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/edit-advertisement/${id}/${currentLang}`, record);
    }

    // Method to delete a record by IDs
    deleteAdvertisements(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/delete-advertisement/${currentLang}`, params);
    }

    publishAdvertisements(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/publish-advertisement/${currentLang}`, params);
    }

    draftAdvertisements(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/draft-advertisement/${currentLang}`, params);
    }

    expireAdvertisements(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/expire-advertisement/${currentLang}`, params);
    }

    getPageAds(){
        // let currentLang = localStorage.getItem('lang_id');
        return this.http.get<any>(`${this.apiUrl}admin/get-pages`);
    }
    getAdvertisementType(id:any){
        return this.http.get<any>(`${this.apiUrl}admin/get-page-ads/${id}`);
    }
}