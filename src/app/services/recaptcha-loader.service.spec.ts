import { TestBed } from '@angular/core/testing';

import { RecaptchaLoaderService } from './recaptcha-loader.service';

describe('RecaptchaLoaderService', () => {
  let service: RecaptchaLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecaptchaLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
