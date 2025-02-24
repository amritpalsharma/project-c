import { TestBed } from '@angular/core/testing';

import { CommonHelperService } from './common-helper.service';

describe('CommonHelperService', () => {
  let service: CommonHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
