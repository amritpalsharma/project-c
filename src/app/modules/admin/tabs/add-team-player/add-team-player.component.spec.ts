import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeamPlayerComponent } from './add-team-player.component';

describe('AddTeamPlayerComponent', () => {
  let component: AddTeamPlayerComponent;
  let fixture: ComponentFixture<AddTeamPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTeamPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTeamPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
