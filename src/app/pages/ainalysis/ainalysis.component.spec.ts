import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AinalysisComponent } from './ainalysis.component';

describe('AinalysisComponent', () => {
  let component: AinalysisComponent;
  let fixture: ComponentFixture<AinalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AinalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AinalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
