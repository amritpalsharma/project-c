import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCountryPlanComponent } from './update-country-plan.component';

describe('UpdateCountryPlanComponent', () => {
  let component: UpdateCountryPlanComponent;
  let fixture: ComponentFixture<UpdateCountryPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateCountryPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCountryPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
