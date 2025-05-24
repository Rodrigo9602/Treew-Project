import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authClientGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Solo ejecutar en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    // Validar token
    if (!isValidClientToken(token)) {
      localStorage.removeItem('auth-token');
      router.navigate(['/login']);
      return false;
    }

    return true;
  }

  // Si no es navegador, permitir (el servidor manejará la autenticación)
  return true;
};

function isValidClientToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}