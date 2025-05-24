import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface TrelloUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  url: string;
  idBoard: string;
  idList: string;
  closed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TrelloAuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  // Configuración de Trello API
  private readonly TRELLO_API_KEY = '3eff9fe8c77e7342654b9fbda1b05414';  
  private readonly TRELLO_API_BASE = 'https://api.trello.com/1';
  private readonly APP_NAME = 'Treello';
  
  // Estado del usuario
  private userSubject = new BehaviorSubject<TrelloUser | null>(null);
  public user$ = this.userSubject.asObservable();

  private redirectFlag: string | null = null;

  // Obtener token de Trello según el contexto
  getTrelloToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('trello-token');
    }

    if (isPlatformServer(this.platformId)) {
      return this.getTokenFromServerCookies();
    }

    return null;
  }

  // Validación en servidor
  isServerAuthenticated(): boolean {
    if (isPlatformServer(this.platformId)) {
      const token = this.getTokenFromServerCookies();
      return !!token;
    }
    return false;
  }

  // Obtener token de cookies en servidor
  private getTokenFromServerCookies(): string | null {
    try {
      const cookieString = this.document.cookie || '';
      const cookies = this.parseCookies(cookieString);
      return cookies['trello-token'] || null;
    } catch (error) {
      console.warn('Error reading server cookies:', error);
      return null;
    }
  }

  // Guardar token de Trello (solo en cliente)
  setTrelloToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('trello-token', token);
      // También establecer cookie para SSR
      this.document.cookie = `trello-token=${token}; path=/; secure; samesite=strict; max-age=2592000`; // 30 días
    }
  }

  // Verificar autenticación con Trello
  isAuthenticated(): boolean {
    const token = this.getTrelloToken();
    return !!token;
  }

  // Iniciar proceso de autenticación con Trello
  loginWithTrello(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scope = 'read,write,account,offline_access'; // Permisos necesarios
    const expiration = '30days'; // Duración del token
    const returnUrl = encodeURIComponent(window.location.origin + '/callback'); // url de redireccion para verificacion de token de usuario
    
    const authUrl = `https://trello.com/1/authorize?` +
      `expiration=${expiration}&` +
      `name=${encodeURIComponent(this.APP_NAME)}&` +
      `scope=${scope}&` +
      `response_type=token&` +
      `key=${this.TRELLO_API_KEY}&` +
      `return_url=${returnUrl}`;

    // Redireccionar a Trello para autenticación
    window.location.href = authUrl;
  }

  // Manejar callback de Trello (extraer token de URL)
  handleTrelloCallback(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // El token puede venir en query params o hash
    const token = urlParams.get('token') || hashParams.get('token');
    
    if (token) {
      this.setTrelloToken(token);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    
    return false;
  }

  // Obtener información del usuario actual de Trello
  getCurrentUser(): Observable<TrelloUser> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/members/me`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: 'id,username,fullName,email,avatarUrl'
    };

    return this.http.get<TrelloUser>(url, { params });
  }

  // Obtener tableros del usuario
  getUserBoards(): Observable<TrelloBoard[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/members/me/boards`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: 'id,name,desc,url,closed',
      filter: 'open' // Solo tableros abiertos
    };

    return this.http.get<TrelloBoard[]>(url, { params });
  }

  // Obtener tarjetas de un tablero específico
  getBoardCards(boardId: string): Observable<TrelloCard[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/boards/${boardId}/cards`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: 'id,name,desc,url,idBoard,idList,closed'
    };

    return this.http.get<TrelloCard[]>(url, { params });
  }

  // Crear una nueva tarjeta
  createCard(listId: string, name: string, desc?: string): Observable<TrelloCard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/cards`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      idList: listId,
      name: name,
      desc: desc || ''
    };

    return this.http.post<TrelloCard>(url, null, { params });
  }

  // Actualizar una tarjeta
  updateCard(cardId: string, updates: Partial<{name: string, desc: string}>): Observable<TrelloCard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/cards/${cardId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      ...updates
    };

    return this.http.put<TrelloCard>(url, null, { params });
  }  

  // Eliminar una tarjeta
  deleteCard(cardId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/cards/${cardId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token
    };

    return this.http.delete(url, { params });
  }

  // Crear un nuevo tablero
  createBoard(name: string, desc?: string): Observable<TrelloBoard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/boards`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      name: name,
      desc: desc || ''
    };

    return this.http.post<TrelloBoard>(url, null, { params });
  }

  // Actualizar un tablero
  updateBoard(boardId: string, updates: Partial<{name: string, desc: string}>): Observable<TrelloBoard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/boards/${boardId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      ...updates
    };

    return this.http.put<TrelloBoard>(url, null, { params });
  }

  // Eliminar (cerrar) un tablero
  deleteBoard(boardId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }

    const url = `${this.TRELLO_API_BASE}/boards/${boardId}/closed`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      value: 'true'
    };

    return this.http.put(url, null, { params });
  }

  // Inicializar usuario (llamar después de la autenticación)
  initializeUser(): void {
    if (this.isAuthenticated()) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.userSubject.next(user);
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.logout();
        }
      });
    }
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

  // Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('trello-token');
      this.document.cookie = 'trello-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  // Verificar si el token es válido haciendo una llamada a la API
  validateToken(): Observable<boolean> {
    return new Observable(observer => {
      this.getCurrentUser().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
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