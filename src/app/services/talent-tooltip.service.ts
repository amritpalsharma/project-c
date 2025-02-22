import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // ✅ Makes service available globally
})
export class TalentTooltipService {
  private tooltips = new BehaviorSubject<{ [key: string]: string }>({});

  constructor(private translate: TranslateService) {
    this.loadTooltips();

    // ✅ Update tooltips when the language changes
    this.translate.onLangChange.subscribe(() => {
      this.loadTooltips();
    });
  }

  private loadTooltips() {
    this.translate.get('TOOLTIPS').subscribe((tooltips: { [key: string]: string }) => {
      this.tooltips.next(tooltips);
    });
  }

  getTooltip(key: string): Observable<string> {
    return this.tooltips.asObservable().pipe(
      map(tooltips => tooltips[key] || 'No Tooltip Available') // ✅ Fallback message
    );
  }
}