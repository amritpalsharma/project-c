import { Injectable } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminHelperService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  /**
     * ✅ Convert Date-Time to 24-hour format
     * @param inputDateTime Example: "02.21.2025 - 10.30 AM"
     * @returns Formatted Date-Time in 24-hour format
     * Author : AmritPal Sharma
     */
  convertTo24HourFormatEmailTemplate(inputDateTime: string): string {
    try {
      const [datePart, timePart] = inputDateTime.split(' - ');

      const [month, day, year] = datePart.split('.').map(Number);
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      let [time, period] = timePart.split(' ');
      let [hours, minutes] = time.split('.').map(Number);

      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.error("Error converting date-time:", error);
      return "Invalid Date Format";
    }
  }

  dateTimeFormatEmailTemplates(dateTimeString: string): string {
    try {
      if (!dateTimeString) return "Invalid Date";

      const dateObj = new Date(dateTimeString);

      if (isNaN(dateObj.getTime())) return "Invalid Date";

      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month starts from 0
      const day = dateObj.getDate().toString().padStart(2, '0');

      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return "Invalid Date";
    }
  }

  convertAdminDateTime(datetime: string, pageName: string): string {
    // Convert the input string into a Date object
    let date = new Date(datetime);

    let language = 'de';
    if (isPlatformBrowser(this.platformId)) {
      language = localStorage.getItem('lang') || 'de'; // Default to English if null
    }

    // Define locale and time zone based on language
    let locale: string;
    let timeZone: string;

    switch (language) {
      case 'de':  // Germany / Switzerland
        locale = 'de-DE';
        timeZone = 'Europe/Zurich';
        break;
      case 'en':  // England
        locale = 'en-GB';
        timeZone = 'Europe/London';
        break;
      default:
        locale = 'en-GB';
        timeZone = 'UTC';
    }

    // Correct formatting options with valid types
    let options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: language === 'en', // AM/PM in English, 24-hour in German
      // timeZone: timeZone
    };

    // Format date and time correctly
    let formattedDate = new Intl.DateTimeFormat(locale, options).format(date);

    // Adjust format for German (replace ',' with ' Uhr')
    if (language === 'de') {
      formattedDate = formattedDate.replace(',', '') + ' Uhr';
    } else if (language === 'en') {
      formattedDate = formattedDate.replaceAll('/', '.');
      formattedDate = formattedDate.replaceAll(',', ' ');
      formattedDate = formattedDate.replaceAll('am', 'AM');
      formattedDate = formattedDate.replaceAll('pm', 'PM');
      // console.log(formattedDate);
      // formattedDate = formattedDate.replace(',', '') + ' Uhr';
    }

    // return formattedDate;
    return datetime;
  }

  getSwitzerlandTime11(inputDate: any) {
    const date = new Date(inputDate + " UTC");  // Appending ' UTC' to ensure the time is treated as UTC

    // Options for formatting date-time in Switzerland time zone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Zurich',   // Set the Switzerland time zone  (CET/CEST)
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,  // 24-hour format
    };

    // Format the date using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-GB', options);

    // Get the formatted date
    const formattedDate = formatter.format(date);

    // Split the formatted date into its components (day, month, year, etc.)
    const [day, month, year, hour, minute, second] = formattedDate.match(/\d+/g) || [];

    // Return in the desired format: "YYYY-MM-DD HH:mm:ss"
    // return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    // return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
  }


  getSwitzerlandTime(inputDate: any) {
    let date: Date;

    // Safely parse input (assuming input is like '2025-08-07 10:00:00')
    if (typeof inputDate === 'string' && inputDate.includes(' ')) {
      // Convert 'YYYY-MM-DD HH:mm:ss' to 'YYYY-MM-DDTHH:mm:ssZ'
      const isoString = inputDate.replace(' ', 'T') + 'Z';
      date = new Date(isoString);
    } else {
      date = new Date(inputDate);
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
      console.error('Invalid date provided:', inputDate);
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Zurich',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const formattedDate = formatter.format(date);

    const [day, month, year, hour, minute, second] = formattedDate.match(/\d+/g) || [];

    return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
  }
}
