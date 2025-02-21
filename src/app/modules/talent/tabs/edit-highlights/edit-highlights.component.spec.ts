import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHighlightsComponent } from './edit-highlights.component';

describe('EditHighlightsComponent', () => {
  let component: EditHighlightsComponent;
  let fixture: ComponentFixture<EditHighlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditHighlightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
