import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  private apiUrl: string;
  private domain: any;
  userToken: string = '';
  public teams: any[] = [];
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();
  public lang: any; // You can dynamically set this if needed
  languages: any = environment.langs;

  private profilePicSource = new BehaviorSubject<string>('../../assets/images/default/talent-profile-default.png');
  profilePic$ = this.profilePicSource.asObservable();

  // Create a BehaviorSubject to store the current language
  // private currentLangSubject = new BehaviorSubject<string>(localStorage.getItem('lang') || '1');
  private currentLangSubject = new BehaviorSubject<string>('1');

  // Observable to allow components to subscribe to language changes
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {

      if (typeof localStorage !== 'undefined') {

        const selectedLanguageSlug = localStorage.getItem('lang') || '';

        const lang = this.languages.find(
          (lang: any) => lang.slug === selectedLanguageSlug
        );

        this.lang = lang ? lang.id : 1;

        this.currentLangSubject.next(
          localStorage.getItem('lang') || '1'
        );

      } else {

        this.lang = 1;
      }

      this.apiUrl = environment.apiUrl;
      this.domain = environment.targetDomain.id;
    }
    this.apiUrl = environment.apiUrl;
  }


  // Method to create common headers for all requests
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`,
      // 'Domain': this.domain,
      // 'Lang': this.lang
    });
  }

  getAllCountries(): Observable<any> {
    let currentLang = '2';

    if (isPlatformBrowser(this.platformId)) {
      currentLang = localStorage.getItem('lang_id') || '2';
    }
    return this.http.get(
      `${this.apiUrl}get-domains/${currentLang}`
    );
  }

  getAllCurrencies(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}get-currencies`
    );
  }
  getAllClubsbyId(id = 0): Observable<any> {
    // console.log(" >>>>>>>>>>>>>>>>>>>> getAllClubsbyId id>> ", id);
    return this.http.get(
      `${this.apiUrl}get-clubs-list?country=${id}`
    );
  }
  getAllClubs(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}get-clubs-list`
    );
  }

  updateProfilePic(newUrl: string) {
    this.profilePicSource.next(newUrl);
  }

  // Change the language
  changeLanguage(lang: string) {
    this.currentLangSubject.next(lang);  // Emit the new language
  }

  getCurrentProfileImage(): string {
    return this.profilePicSource.getValue();
  }

}

