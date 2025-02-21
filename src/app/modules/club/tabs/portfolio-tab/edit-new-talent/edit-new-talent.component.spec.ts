import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewTalentComponent } from './edit-new-talent.component';

describe('EditNewTalentComponent', () => {
  let component: EditNewTalentComponent;
  let fixture: ComponentFixture<EditNewTalentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditNewTalentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditNewTalentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
