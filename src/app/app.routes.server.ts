import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client 
  }, 
  {
    path: 'ainalysis',
    renderMode: RenderMode.Client
  }, 
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  
];
