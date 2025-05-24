import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authHybridGuard } from './auth-hybrid.guard';

describe('authHybridGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authHybridGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
