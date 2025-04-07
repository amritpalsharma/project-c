import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { GlobalSettingsService } from '../services/global-settings.service';

@Injectable({
    providedIn: 'root'
})

export class WebPages {

    constructor(private http: HttpClient, private globalSettings: GlobalSettingsService) {
        this.apiUrl = environment?.apiUrl;
    }
    private apiUrl = environment?.apiUrl;
    private url = environment?.url;
    // private frontendApiUrl = this.url + 'frontend/';
    private frontendApiUrl = 'https://api.socceryou.ch/frontend/';
    private domainDefaultLang = this.globalSettings.getLanguageId();
    private langId = localStorage.getItem('lang_id') || '' + this.domainDefaultLang + '';
    private languageId = new BehaviorSubject<string>(this.langId); // Initial value
    languageId$ = this.languageId.asObservable(); // Expose as observable

    updateData(data: string) {
        this.languageId.next(data); // Update the shared data
    }
 


    getAllPages(lang_id: any = 1, params: any): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');

        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}admin/get-pages/${currentLang}`, { params }
        );
    }

    getFrontendPages(lang_id: any, status: any = ''): Observable<any> {

        if (lang_id)
            return this.http.get<{ status: boolean, message: string, data: {} }>(
                `${this.frontendApiUrl}get-frontend-pages?lang_id=${lang_id}&status=${status}`
            );
        else
            return this.http.get<{ status: boolean, message: string, data: {} }>(
                `${this.frontendApiUrl}/get-frontend-pages?lang_id=${lang_id}&status=${status}`
            );

    }

    deleteWebPages(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/delete-page`, params);
    }

    getAllLanguage(): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}get-languages/${currentLang}`
        );
    }

    getAllLocations(): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}get-domains/${currentLang}`
        );
    }

    addNewPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}admin/add-page`, params);
    }

    getSinglePageDetail(pageId: string): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}admin/get-page/${pageId}`
        );
    }

    getPageBaseOnTheId(langId: string): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.frontendApiUrl}get-frontend-pages?lang_id=${langId}`
        );
    }

    addFaqPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-faqpage`, params);
    }

    addTalentPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-talentpage`, params);
    }

    addPricingPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-pricingpage`, params);
    }

    addClubnScoutPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-club-and-scout-page`, params);
    }

    addHomePage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-homepage`, params);
    }

    addHomePageTabData(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-tabs-homepage`, params);
    }

    getDynamicHomePage(langId: any): Observable<any> {
        let currentDomain = this.globalSettings.getdomainId();
        let random = Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.frontendApiUrl}get-page-by-slug?page_type=home&whereClause[role]=4&lang_id=${langId}&domain=${currentDomain}&num=${random}`
        );
    }

    getDynamicContentPage(content: any, langId: any): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.frontendApiUrl}get-page-by-slug?page_type=${content}&lang_id=${langId}`
        );
    }

    getNewsContentPage(id: any, langId: any): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.frontendApiUrl}get-single-news/${id}`
        );
    }

    addContactPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-contactpage`, params);
    }

    addAboutPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-aboutpage`, params);
    }

    addContentPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-content-page`, params);
    }

    addNewsPage(params: any): Observable<any> {
        return this.http.post<any>(`${this.frontendApiUrl}save-newspage`, params);
    }

    getPageByLangAndPageId(langId: any): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.frontendApiUrl}get-homepage-data?&lang_id=${langId}&page_id=9`
        );
    }

    getPageById(id: any): Observable<any> {
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}admin/get-pagecontent/${id}`
        );
    }

    getPriceAndCurrency(interVal: string): Observable<any> {
        let currentLang = localStorage.getItem('lang_id');
        let currentDomainId = this.globalSettings.getdomainId();
        return this.http.get<{ status: boolean, message: string, data: {} }>(
            `${this.apiUrl}/get-packages-by-domain/${interVal}/${currentDomainId}/${currentLang}`
        );
    }
}