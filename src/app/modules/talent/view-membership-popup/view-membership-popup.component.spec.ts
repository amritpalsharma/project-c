import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMembershipPopupComponent } from './view-membership-popup.component';

describe('ViewMembershipPopupComponent', () => {
  let component: ViewMembershipPopupComponent;
  let fixture: ComponentFixture<ViewMembershipPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewMembershipPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewMembershipPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
