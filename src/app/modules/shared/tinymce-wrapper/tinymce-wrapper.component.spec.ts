import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TinymceWrapperComponent } from './tinymce-wrapper.component';

describe('TinymceWrapperComponent', () => {
  let component: TinymceWrapperComponent;
  let fixture: ComponentFixture<TinymceWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TinymceWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TinymceWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
