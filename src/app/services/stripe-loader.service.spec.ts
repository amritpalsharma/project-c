import { TestBed } from '@angular/core/testing';

import { StripeLoaderService } from './stripe-loader.service';

describe('StripeLoaderService', () => {
  let service: StripeLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StripeLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
