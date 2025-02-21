import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  private apiUrl: string;
  private domain: any;
  private userToken: string | null;
  public teams: any[] = [];
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();
  public lang:any; // You can dynamically set this if needed
  languages:any = environment.langs;

  private profilePicSource = new BehaviorSubject<string>('../../assets/images/default/talent-profile-default.png');
  profilePic$ = this.profilePicSource.asObservable();

  // Create a BehaviorSubject to store the current language
  private currentLangSubject = new BehaviorSubject<string>(localStorage.getItem('lang') || '1');

  // Observable to allow components to subscribe to language changes
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private http: HttpClient) {


    // Retrieve the selected language code from localStorage
    const selectedLanguageSlug = localStorage.getItem('lang') || '';

    // Find the corresponding language ID from the langs array
    const lang = this.languages.find(
      (lang:any) => lang.slug === selectedLanguageSlug
    );

    // Default to a specific language ID if none is found (e.g., English)
    this.lang = lang ? lang.id : 1;

    this.apiUrl = environment.apiUrl;
    this.userToken = localStorage.getItem('authToken');
    this.domain = environment.targetDomain.id;
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
    return this.http.get(
      `${this.apiUrl}get-domains`
    );
  }

  getAllCurrencies(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}get-currencies`
    );
  }
  getAllClubsbyId(id=0): Observable<any> {
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

}
