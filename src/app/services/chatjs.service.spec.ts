import { TestBed } from '@angular/core/testing';

import { ChatjsService } from './chatjs.service';

describe('ChatjsService', () => {
  let service: ChatjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
