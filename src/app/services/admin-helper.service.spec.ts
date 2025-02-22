import { TestBed } from '@angular/core/testing';

import { AdminHelperService } from './admin-helper.service';

describe('AdminHelperService', () => {
  let service: AdminHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
