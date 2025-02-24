import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TemplateService {
    private apiUrl;
    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;
    
    }
    getTemplates(data:any): Observable<{ status: boolean, message: string, data: any }> {
        let params = new HttpParams();
        // Loop through the queryParams object and set each parameter
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                params = params.set(key, data[key]);
            }
        }
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-email-templates`, { params }
          );
    }

    getTemplateById(id: string): Observable<{ status: boolean, message: string, data: any }> {
        
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-email-template/${id}`
        );
    }
    
    addEmailTemplate(record: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/add-email-template`, record);
    }
    // Method to update an existing record
    updateEmailTemplate(id: number, record: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/edit-email-template/${id}`, record);
    }

    // Method to delete a record by IDs
    deleteEmailTemplate(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/delete-email-template`, params);
    }
}