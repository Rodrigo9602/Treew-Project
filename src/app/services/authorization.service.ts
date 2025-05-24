import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private document = inject(DOCUMENT);
  private redirectFlag: string | null = null;

  // Obtener token según el contexto
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth-token');
    }

    if (isPlatformServer(this.platformId)) {
      // En servidor, intentar leer de cookies del documento
      return this.getTokenFromServerCookies();
    }

    return null;
  }

  // Validación en servidor (más simple)
  isServerAuthenticated(): boolean {
    if (isPlatformServer(this.platformId)) {
      const token = this.getTokenFromServerCookies();
      return token ? this.isValidToken(token) : false;
    }
    return false;
  }

  // Obtener token de cookies en servidor
  private getTokenFromServerCookies(): string | null {
    try {
      // En Angular v19, las cookies del servidor pueden estar en el documento
      const cookieString = this.document.cookie || '';
      const cookies = this.parseCookies(cookieString);
      return cookies['auth-token'] || null;
    } catch (error) {
      console.warn('Error reading server cookies:', error);
      return null;
    }
  }

  // Guardar token (solo en cliente)
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth-token', token);
      // También establecer cookie para SSR
      this.document.cookie = `auth-token=${token}; path=/; secure; samesite=strict; max-age=86400`;
    }
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isValidToken(token) : false;
  }

  // Manejo de flags de redirección para coordinación servidor-cliente
  setRedirectFlag(path: string): void {
    this.redirectFlag = path;
  }

  getRedirectFlag(): string | null {
    return this.redirectFlag;
  }

  clearRedirectFlag(): void {
    this.redirectFlag = null;
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/login', credentials);
  }

  // Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth-token');
      this.document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  private isValidToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }
}
