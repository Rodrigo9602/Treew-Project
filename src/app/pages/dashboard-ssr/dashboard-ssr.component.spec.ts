import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSsrComponent } from './dashboard-ssr.component';

describe('DashboardSsrComponent', () => {
  let component: DashboardSsrComponent;
  let fixture: ComponentFixture<DashboardSsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSsrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
