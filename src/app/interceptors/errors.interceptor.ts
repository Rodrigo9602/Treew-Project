import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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
