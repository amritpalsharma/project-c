import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipComponentComponent } from './membership.component';

describe('MembershipComponentComponent', () => {
  let component: MembershipComponentComponent;
  let fixture: ComponentFixture<MembershipComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MembershipComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MembershipComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
