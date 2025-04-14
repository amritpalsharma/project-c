import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropperComponent2 } from './image-cropper.component';

describe('ImageCropperComponent', () => {
  let component: ImageCropperComponent2;
  let fixture: ComponentFixture<ImageCropperComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageCropperComponent2]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageCropperComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
