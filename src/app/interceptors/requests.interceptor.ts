import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

/**
 * Interceptor HTTP que maneja la autenticación automática para diferentes APIs.
 * Aplica estrategias de autenticación específicas según el destino de la solicitud,
 * diferenciando entre la API de Trello y APIs backend propias.
 * 
 * **Estrategias de autenticación:**
 * 
 * **Para API de Trello (api.trello.com):**
 * - Agrega el token como parámetro de consulta (query parameter)
 * - Formato: `?token=your_trello_token`
 * - Cumple con los requerimientos específicos de la API de Trello
 * 
 * **Para APIs backend propias:**
 * - Agrega el token en el header Authorization
 * - Formato: `Authorization: Bearer your_token`
 * - Sigue el estándar OAuth 2.0 / JWT
 * 
 * **Casos especiales:**
 * - Si no hay token disponible, la solicitud continúa sin modificaciones
 * - Doble validación para evitar conflictos entre diferentes tipos de API
 * 
 * @param req - Solicitud HTTP interceptada
 * @param next - Siguiente manejador en la cadena de interceptores
 * @returns Observable con la solicitud modificada (si aplica) o la original
 * 
 * @example
 * ```typescript
 * // En app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([requestsInterceptor, errorsInterceptor])
 *     )
 *   ]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Transformaciones automáticas:
 * 
 * // Para Trello API:
 * // Original: GET https://api.trello.com/1/boards/123
 * // Modificada: GET https://api.trello.com/1/boards/123?token=abc123
 * 
 * // Para backend propio:
 * // Original: GET https://my-api.com/data
 * // Modificada: GET https://my-api.com/data
 * //             Headers: { Authorization: 'Bearer abc123' }
 * ```
 * 
 * @remarks
 * Este interceptor debe configurarse antes que el interceptor de errores
 * para asegurar que las solicitudes autenticadas se procesen correctamente
 * antes del manejo de errores.
 */
export const requestsInterceptor: HttpInterceptorFn = (req, next) => {
  const trelloAuthService = inject(TrelloAuthService);

  // Solo aplicar el interceptor a las URLs de Trello API
  if (req.url.includes('api.trello.com')) {
    const token = trelloAuthService.getTrelloToken();

    if (token) {
      // Para Trello, agregamos el token como parámetro de query en lugar del header
      // (aunque ya se maneja en el servicio, esto es por si hay llamadas directas)
      const modifiedReq = req.clone({
        setParams: {
          token: token
        }
      });
      return next(modifiedReq);
    }
  }

  // Para otras APIs (tu backend), usar el patrón tradicional con Authorization header
  const token = trelloAuthService.getTrelloToken();
  if (token && !req.url.includes('api.trello.com')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};


