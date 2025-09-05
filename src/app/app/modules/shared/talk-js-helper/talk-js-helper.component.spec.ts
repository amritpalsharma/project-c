import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkJsHelperComponent } from './talk-js-helper.component';

describe('TalkJsHelperComponent', () => {
  let component: TalkJsHelperComponent;
  let fixture: ComponentFixture<TalkJsHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TalkJsHelperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TalkJsHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
