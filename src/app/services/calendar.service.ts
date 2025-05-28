// src/app/shared/services/calendar.service.ts
import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private dateAdapter: DateAdapter<any>) {}

  setLocale(locale: string): void {
    moment.locale(locale);
    this.dateAdapter.setLocale(locale);
  }
}
