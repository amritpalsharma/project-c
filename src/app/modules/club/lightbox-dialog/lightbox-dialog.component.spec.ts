import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightboxDialogComponent } from './lightbox-dialog.component';

describe('LightboxDialogComponent', () => {
  let component: LightboxDialogComponent;
  let fixture: ComponentFixture<LightboxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LightboxDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LightboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
