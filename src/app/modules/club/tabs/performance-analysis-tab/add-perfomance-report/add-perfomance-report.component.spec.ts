import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPerfomanceReportComponent } from './add-perfomance-report.component';

describe('AddPerfomanceReportComponent', () => {
  let component: AddPerfomanceReportComponent;
  let fixture: ComponentFixture<AddPerfomanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPerfomanceReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPerfomanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
