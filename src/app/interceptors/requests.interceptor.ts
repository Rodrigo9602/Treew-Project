import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TrelloAuthService } from '../services/authorization.service';

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


