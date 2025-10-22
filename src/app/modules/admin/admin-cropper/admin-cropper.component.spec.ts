import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCropperComponent } from './admin-cropper.component';

describe('AdminCropperComponent', () => {
  let component: AdminCropperComponent;
  let fixture: ComponentFixture<AdminCropperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCropperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
