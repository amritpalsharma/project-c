import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
    private apiUrl;
    // private currentLang;
    constructor(private http: HttpClient) {
        this.apiUrl = environment?.apiUrl;    
        // this.currentLang = localStorage.getItem('lang_id');    
    }
    getBlogs(params:any): Observable<{ status: boolean, message: string, data: any }> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-blogs/${currentLang}`, {params}
          );
    }
    getBlogBySlug(slug:any){
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-blog/${slug}`
          );
    }
    getBlogById(id:any){
        return this.http.get<{ status: boolean, message: string, data: any }>(
            `${this.apiUrl}admin/get-blog?id=${id}`
          );
    }
    addBlog(record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/add-blog/${currentLang}`, record);
    }
    // Method to update an existing record
    updateBlog(id: number, record: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.post<any>(`${this.apiUrl}admin/edit-blog/${id}/${currentLang}`, record);
    }

    // Method to delete a record by IDs
    deleteBlog(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/delete-blog`, params);
    }

    publishBlogs(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/publish-blog`, params);
    }

    draftBlogs(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/draft-blog`, params);
    }

}