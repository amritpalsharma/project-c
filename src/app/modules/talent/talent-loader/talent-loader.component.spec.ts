import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentLoaderComponent } from './talent-loader.component';

describe('TalentLoaderComponent', () => {
  let component: TalentLoaderComponent;
  let fixture: ComponentFixture<TalentLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TalentLoaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TalentLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
