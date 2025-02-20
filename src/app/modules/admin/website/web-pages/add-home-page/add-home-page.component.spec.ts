import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHomePageComponent } from './add-home-page.component';

describe('AddHomePageComponent', () => {
  let component: AddHomePageComponent;
  let fixture: ComponentFixture<AddHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddHomePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
