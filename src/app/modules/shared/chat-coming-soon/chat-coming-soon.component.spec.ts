import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComingSoonComponent } from './chat-coming-soon.component';

describe('ChatComingSoonComponent', () => {
  let component: ChatComingSoonComponent;
  let fixture: ComponentFixture<ChatComingSoonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatComingSoonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatComingSoonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
