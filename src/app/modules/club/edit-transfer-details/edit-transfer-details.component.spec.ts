import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransferDetailsComponent } from './edit-transfer-details.component';

describe('EditTransferDetailsComponent', () => {
  let component: EditTransferDetailsComponent;
  let fixture: ComponentFixture<EditTransferDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditTransferDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTransferDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
