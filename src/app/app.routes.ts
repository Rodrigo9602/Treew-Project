import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout/layout.component';
import { authHybridGuard } from './guards/auth-hybrid.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => {
          // Verificar si estamos en el servidor usando una propiedad global
          if (typeof window === 'undefined') {
            // Estamos en el servidor
            return import('./pages/dashboard-ssr/dashboard-ssr.component').then((m) => m.DashboardSsrComponent);
          } else {
            // Estamos en el cliente
            return import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent);
          }
        },
        canActivate: [authHybridGuard]
      },
      {
        path: 'ainalysis',
        loadComponent: () => import('./pages/ainalysis/ainalysis.component').then((m) => m.AinalysisComponent),
        canActivate: [authHybridGuard]
      }      
    ]
  },  
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.component').then((m) => m.CallbackComponent)   
  },
  {
    path: '**',
    loadComponent: () => import('./pages/error/error.component').then((m) => m.ErrorComponent)
  }
];