import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { requestsInterceptor } from './interceptors/requests.interceptor';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { LocationStrategy, PathLocationStrategy } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([requestsInterceptor])),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    provideAnimationsAsync(),
  ]
};
