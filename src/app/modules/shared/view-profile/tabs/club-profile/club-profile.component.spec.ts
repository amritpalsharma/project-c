import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubProfileComponent } from './club-profile.component';

describe('ClubProfileComponent', () => {
  let component: ClubProfileComponent;
  let fixture: ComponentFixture<ClubProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClubProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClubProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
