import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPerformanceDetailsComponent } from './edit-performance-details.component';

describe('EditPerformanceDetailsComponent', () => {
  let component: EditPerformanceDetailsComponent;
  let fixture: ComponentFixture<EditPerformanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPerformanceDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPerformanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
