import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
    private apiUrl;
    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;
    
    }
    getCoupons(params:any): Observable<{ status: boolean, message: string, data: any }> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-coupons/${currentLang}`, {params}
          );
    }

    addPopups(record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/add-coupon/${currentLang}`, record);
    }
    // Method to update an existing record
    updatePopups(id: number, record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/edit-coupon/${id}/${currentLang}`, record);
    }

    // Method to delete a record by IDs
    deleteCoupons(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/delete-coupon/${currentLang}`, params);
    }

    publishCoupons(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/publish-coupon/${currentLang}`, params);
    }

    draftCoupons(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/draft-coupon/${currentLang}`, params);
    }

    expireCoupons(params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/expire-coupon/${currentLang}`, params);
    }
}