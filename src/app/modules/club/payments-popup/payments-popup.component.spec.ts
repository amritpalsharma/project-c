import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsPopupComponent } from './payments-popup.component';

describe('PaymentsPopupComponent', () => {
  let component: PaymentsPopupComponent;
  let fixture: ComponentFixture<PaymentsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
