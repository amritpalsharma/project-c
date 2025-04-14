import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubHistoryComponent } from './club-history.component';

describe('ClubHistoryComponent', () => {
  let component: ClubHistoryComponent;
  let fixture: ComponentFixture<ClubHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClubHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClubHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
