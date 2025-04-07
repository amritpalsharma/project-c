import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

export function getPaginatorIntl(translate: TranslateService): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();

  const translateLabels = () => {
    paginatorIntl.itemsPerPageLabel = translate.instant('PAGINATOR.ITEMS_PER_PAGE');
    paginatorIntl.nextPageLabel = translate.instant('PAGINATOR.NEXT_PAGE');
    paginatorIntl.previousPageLabel = translate.instant('PAGINATOR.PREVIOUS_PAGE');
    paginatorIntl.firstPageLabel = translate.instant('PAGINATOR.FIRST_PAGE');
    paginatorIntl.lastPageLabel = translate.instant('PAGINATOR.LAST_PAGE');

    paginatorIntl.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return `0 ${translate.instant('PAGINATOR.OF')} ${length}`;
      }
      const startIndex = page * pageSize;
      return `${startIndex + 1} - ${Math.min(startIndex + pageSize, length)} ${translate.instant('PAGINATOR.OF')} ${length}`;
    };

    paginatorIntl.changes.next();
  };

  // ✅ Delay translation to avoid circular DI error
  Promise.resolve().then(() => translateLabels());

  translate.onLangChange.subscribe(() => {
    translateLabels();
  });

  return paginatorIntl;
}
