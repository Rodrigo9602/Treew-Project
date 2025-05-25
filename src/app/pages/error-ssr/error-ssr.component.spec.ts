import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorSsrComponent } from './error-ssr.component';

describe('ErrorSsrComponent', () => {
  let component: ErrorSsrComponent;
  let fixture: ComponentFixture<ErrorSsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorSsrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorSsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
