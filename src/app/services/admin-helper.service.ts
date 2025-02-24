import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminHelperService {

  constructor() { }
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

      // ✅ Parse the input date-time
      const dateObj = new Date(dateTimeString);

      // ✅ Ensure valid date
      if (isNaN(dateObj.getTime())) return "Invalid Date";

      // ✅ Extract date components
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month starts from 0
      const day = dateObj.getDate().toString().padStart(2, '0');

      // ✅ Extract 24-hour format time
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      // console.error("❌ Error formatting date:", error);
      return "Invalid Date";
    }
  }
}
