import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMembershipProfileComponent } from './edit-membership-profile.component';

describe('EditMembershipProfileComponent', () => {
  let component: EditMembershipProfileComponent;
  let fixture: ComponentFixture<EditMembershipProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditMembershipProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMembershipProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
