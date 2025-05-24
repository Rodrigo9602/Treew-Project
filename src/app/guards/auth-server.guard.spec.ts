import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authServerGuard } from './auth-server.guard';

describe('authServerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authServerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
