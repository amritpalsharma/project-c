import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumPurchaseComponent } from './premium-purchase.component';

describe('PremiumPurchaseComponent', () => {
  let component: PremiumPurchaseComponent;
  let fixture: ComponentFixture<PremiumPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PremiumPurchaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PremiumPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
