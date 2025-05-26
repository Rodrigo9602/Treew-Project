import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

/**
 * Guard de autenticación para aplicaciones que solo ejecutan en el navegador (CSR).
 * Protege rutas verificando si el usuario tiene un token válido de Trello
 * únicamente en el lado del cliente.
 * 
 * @param route - Ruta que se está intentando activar
 * @param state - Estado actual del router
 * @returns `true` si el usuario está autenticado o si no es navegador, `false` si debe redirigir al login
 * 
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authClientGuard]
 * }
 * ```
 */
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