import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAboutPageComponent } from './add-about-page.component';

describe('AddAboutPageComponent', () => {
  let component: AddAboutPageComponent;
  let fixture: ComponentFixture<AddAboutPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAboutPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddAboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
