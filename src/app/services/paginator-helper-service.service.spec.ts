import { TestBed } from '@angular/core/testing';

import { PaginatorHelperServiceService } from './paginator-helper-service.service';

describe('PaginatorHelperServiceService', () => {
  let service: PaginatorHelperServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginatorHelperServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
