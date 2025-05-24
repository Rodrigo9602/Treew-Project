import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

export const authHybridGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const authService = inject(TrelloAuthService);

  if (isPlatformServer(platformId)) {
    // En servidor: validación básica con cookies si están disponibles
    const isAuthenticated = authService.isServerAuthenticated();

    if (!isAuthenticated) {
      // En lugar de redireccionar, renderizamos pero marcamos para redirección en cliente
      authService.setRedirectFlag('/login');
    }

    // Siempre permitir en servidor para evitar problemas de hidratación
    return true;
  }

  if (isPlatformBrowser(platformId)) {
    // Verificar si hay flag de redirección del servidor
    const redirectFlag = authService.getRedirectFlag();
    if (redirectFlag) {
      authService.clearRedirectFlag();
      router.navigate([redirectFlag]);
      return false;
    }

    // Validación normal en cliente
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  }

  return true;
};
