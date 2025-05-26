import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * Guard de autenticación específico para el servidor en aplicaciones SSR.
 * Permite el renderizado inicial en el servidor sin realizar validaciones
 * complejas de autenticación, delegando la validación real al cliente
 * después de la hidratación.
 * 
 * **Propósito:**
 * - Evitar errores de hidratación en SSR
 * - Permitir renderizado inicial del contenido
 * - Preparar el terreno para validación en cliente
 * 
 * **Casos de uso:**
 * - Aplicaciones que requieren contenido inicial renderizado
 * - Cuando se necesita SEO en rutas protegidas
 * - Para mejorar el tiempo de carga inicial
 * 
 * @param route - Ruta que se está intentando activar
 * @param state - Estado actual del router
 * @returns Siempre `true` para permitir renderizado inicial
 * 
 * @example
 * ```typescript
 * // En app.routes.ts para rutas que necesitan renderizado inicial
 * {
 *   path: 'profile',
 *   component: ProfileComponent,
 *   canActivate: [authServerGuard] // Permite renderizado inicial
 * }
 * ```
 * 
 * @remarks
 * Este guard debe usarse junto con validación en el cliente para
 * proporcionar seguridad completa. El renderizado inicial puede
 * mostrar contenido que luego será protegido por el cliente.
 */
export const authServerGuard: CanActivateFn = (route, state) => {  
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    // En el servidor, permitimos el renderizado pero marcamos que necesita validación
    // La validación real se hará en el cliente después de la hidratación
    return true;
  }

  // Si no es servidor, permitir (el cliente manejará la autenticación)
  return true;
};