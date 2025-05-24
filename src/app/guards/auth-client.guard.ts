import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

export const authClientGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const trelloAuthService = inject(TrelloAuthService);

  // Solo ejecutar en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = trelloAuthService.getTrelloToken();

    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  }

  // Si no es navegador, permitir (el servidor manejará la autenticación)
  return true;
};
