import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Makes it available globally
})
export class PaginatorHelperService extends MatPaginatorIntl {
  override itemsPerPageLabel = '';
  override nextPageLabel = '';
  override previousPageLabel = '';
  override firstPageLabel = '';
  override lastPageLabel = '';
  override changes = new Subject<void>(); // Required for dynamic updates

  constructor(private translate: TranslateService) {
    super();
    this.setTranslations();

    // Listen for language changes & update paginator labels dynamically
    this.translate.onLangChange.subscribe(() => {
      this.setTranslations();
      this.changes.next(); // Notify Angular Material paginator to refresh
    });
  }

  setTranslations() {
    this.itemsPerPageLabel = this.translate.instant('ITEMS_PER_PAGE');
    this.nextPageLabel = this.translate.instant('NEXT_PAGE');
    this.previousPageLabel = this.translate.instant('PREVIOUS_PAGE');
    this.firstPageLabel = this.translate.instant('FIRST_PAGE');
    this.lastPageLabel = this.translate.instant('LAST_PAGE');
  }
}
