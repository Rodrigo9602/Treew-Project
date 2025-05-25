import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditListFormComponent } from './edit-list-form.component';

describe('EditListFormComponent', () => {
  let component: EditListFormComponent;
  let fixture: ComponentFixture<EditListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditListFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
