import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyTableComponent } from './emplty-table.component';

describe('FooterComponent', () => {
  let component: EmptyTableComponent;
  let fixture: ComponentFixture<EmptyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
