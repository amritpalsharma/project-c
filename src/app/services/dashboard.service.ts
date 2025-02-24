import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from 'talkjs/all';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private apiUrl;
    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;
    
    }
    getChartData(year:number, domain_id:number, lang_id:number): Observable<{ status: boolean, message: string, data: any }> {
        // let currentLang = localStorage.getItem('lang_id');
        // let domain_id = 1;
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-graph-data/${year}/${domain_id}/${lang_id}`,
          );
    }

    getNewRegistration(limit=3): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
        let currentLang = localStorage.getItem('lang_id');

        const params = new HttpParams()
        .set('limit', limit)
        .set('orderBy', 'id')
        .set('order', 'desc');
      return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
        `${this.apiUrl}admin/users/${currentLang}`,
        { params}
      );
    }
    getNewRegistrationWithRole(role=2,limit=3): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
      let currentLang = localStorage.getItem('lang_id');
      let whererole = [role];
      const params = new HttpParams()
      .set('limit', limit)
      .set('whereClause[role]',role)
      .set('orderBy', 'id')
      .set('order', 'desc');
    return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
      `${this.apiUrl}admin/users/${currentLang}`,
      { params}
    );
  }
    getUsers(): Observable<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }> {
        let currentLang = localStorage.getItem('lang_id');
        const params = new HttpParams()
          .set('limit', '10')
          .set('orderBy', 'id')
          .set('order', 'desc');
        return this.http.get<{ status: boolean, message: string, data: { userData: User[],totalCount:number } }>(
          `${this.apiUrl}admin/users/${currentLang}`,
          { params}
        );
      }

}