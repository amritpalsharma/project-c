import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponCodeAlertComponent } from './coupon-code-alert.component';

describe('CouponCodeAlertComponent', () => {
  let component: CouponCodeAlertComponent;
  let fixture: ComponentFixture<CouponCodeAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CouponCodeAlertComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CouponCodeAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
