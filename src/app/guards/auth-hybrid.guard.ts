import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

/**
 * Guard de autenticación híbrido para aplicaciones con Server-Side Rendering (SSR).
 * Maneja la autenticación tanto en el servidor como en el cliente, evitando
 * problemas de hidratación y proporcionando una experiencia fluida.
 * 
 * **Comportamiento en servidor:**
 * - Valida usando cookies/sessiones si están disponibles
 * - No redirige directamente, sino que marca flags para el cliente
 * - Siempre permite el renderizado para evitar problemas de hidratación
 * 
 * **Comportamiento en cliente:**
 * - Verifica flags de redirección del servidor
 * - Realiza validación completa de autenticación
 * - Maneja redirecciones reales al login
 * 
 * @param route - Ruta que se está intentando activar
 * @param state - Estado actual del router
 * @returns `true` para permitir acceso, `false` para redirigir
 * 
 * @example
 * ```typescript
 * // En app.routes.ts para aplicaciones SSR
 * {
 *   path: 'protected',
 *   component: ProtectedComponent,
 *   canActivate: [authHybridGuard]
 * }
 * ```
 */
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