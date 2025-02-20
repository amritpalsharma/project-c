import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTalentComponent } from './add-new-talent.component';

describe('AddNewTalentComponent', () => {
  let component: AddNewTalentComponent;
  let fixture: ComponentFixture<AddNewTalentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewTalentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewTalentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
