import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

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
