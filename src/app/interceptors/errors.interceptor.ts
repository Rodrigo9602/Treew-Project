import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP que maneja errores de respuesta de manera centralizada.
 * Transforma códigos de estado HTTP en mensajes de error más descriptivos
 * y user-friendly para mejorar la experiencia del usuario.
 * 
 * **Códigos de error manejados:**
 * - **400**: Bad Request - Solicitud malformada
 * - **401**: Unauthorized - Sin autenticación válida
 * - **402**: Payment Required - Pago requerido
 * - **403**: Forbidden - Recurso prohibido
 * - **404**: Not Found - Recurso no encontrado
 * - **405**: Method Not Allowed - Método HTTP no permitido
 * - **408**: Request Timeout - Tiempo de espera agotado
 * - **500**: Internal Server Error - Error interno del servidor
 * - **502**: Bad Gateway - Gateway incorrecto
 * - **Otros**: Errores no contemplados específicamente
 * 
 * @param req - Solicitud HTTP interceptada
 * @param next - Siguiente manejador en la cadena de interceptores
 * @returns Observable que emite la respuesta o lanza un error transformado
 * 
 * @example
 * ```typescript
 * // En app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([errorsInterceptor])
 *     )
 *   ]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // El interceptor transformará automáticamente:
 * // HTTP 404 -> Error('Not found')
 * // HTTP 401 -> Error('Unauthorized request')
 * // HTTP 500 -> Error('Internal Server Error')
 * ```
 */
export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      switch(error.status) {
        case 400:
          return throwError(() => new Error(`Bad request: ${error.error}`));
        case 401:
          return throwError(() => new Error('Unauthorized request'));
        case 403:
          return throwError(() => new Error('Forbidden Resource'));      
        case 402:
          return throwError(() => new Error('Payment required'));
        case 404:
          return throwError(() => new Error('Not found'));
        case 405:
          return throwError(() => new Error('Method Not Allowed'));
        case 408:
          return throwError(() => new Error('Request Timeout'));
        case 500:
          return throwError(() => new Error('Internal Server Error'));
        case 502:
          return throwError(() => new Error('Bad Gateway'));
        default:
          return throwError(() => new Error(error.message || 'Unknown error'));
      }
    })
  );
};