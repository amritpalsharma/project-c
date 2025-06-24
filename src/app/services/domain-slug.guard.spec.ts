import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { domainSlugGuard } from './domain-slug.guard';

describe('domainSlugGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => domainSlugGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
