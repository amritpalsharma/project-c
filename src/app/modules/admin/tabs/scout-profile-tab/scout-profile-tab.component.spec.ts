import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutProfileTabComponent } from './scout-profile-tab.component';

describe('ScoutProfileTabComponent', () => {
  let component: ScoutProfileTabComponent;
  let fixture: ComponentFixture<ScoutProfileTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoutProfileTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoutProfileTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
