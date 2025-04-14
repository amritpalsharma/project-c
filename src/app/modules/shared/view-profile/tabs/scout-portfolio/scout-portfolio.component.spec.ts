import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutPortfolioComponent } from './scout-portfolio.component';

describe('ScoutPortfolioComponent', () => {
  let component: ScoutPortfolioComponent;
  let fixture: ComponentFixture<ScoutPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoutPortfolioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoutPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
