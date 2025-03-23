import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomRouteReuseStrategy } from './custom-route-reuse-strategy'; // Adjust the path to match your project structure
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()), // bind route data to component inputs
    provideAnimationsAsync(),
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none', // Disables dark mode detection
        },
      },
    }),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
