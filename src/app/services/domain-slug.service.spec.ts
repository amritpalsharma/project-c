import { TestBed } from '@angular/core/testing';

import { DomainSlugService } from './domain-slug.service';

describe('DomainSlugService', () => {
  let service: DomainSlugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainSlugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
