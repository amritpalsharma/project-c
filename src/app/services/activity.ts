import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
    private apiUrl;
    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;    
    }

    getActivity(params:any): Observable<{ status: boolean, message: string, data: any }> {
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}get-activity`, {params}
        );
    }

    deleteActivity(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}delete-activity`, params);
    }
}