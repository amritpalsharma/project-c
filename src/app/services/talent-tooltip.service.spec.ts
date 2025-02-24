import { TestBed } from '@angular/core/testing';

import { TalentTooltipService } from './talent-tooltip.service';

describe('TalentTooltipService', () => {
  let service: TalentTooltipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TalentTooltipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
