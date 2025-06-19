import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverImageCropperComponent } from './cover-image-cropper.component';

describe('CoverImageCropperComponent', () => {
  let component: CoverImageCropperComponent;
  let fixture: ComponentFixture<CoverImageCropperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoverImageCropperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoverImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
