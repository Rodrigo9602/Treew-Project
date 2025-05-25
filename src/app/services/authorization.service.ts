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

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
}

export interface TrelloCard {
  // Campos básicos actuales
  id: string;
  name: string;
  desc: string;
  url: string;
  idBoard: string;
  idList: string;
  closed: boolean;
  
  // Campos de fecha y tiempo
  due: string | null;                    // Fecha de vencimiento (ISO 8601)
  dueComplete: boolean;                  // Si la fecha de vencimiento está marcada como completada
  dueReminder: number | null;            // Recordatorio en minutos antes del vencimiento
  start: string | null;                  // Fecha de inicio
  
  // Campos de posición y orden
  pos: number;                          // Posición en la lista
  
  // Campos de actividad y fechas
  dateLastActivity: string;             // Última actividad en la tarjeta
  
  // Campos de etiquetas (labels) 
  labels: TrelloLabel[];                // Etiquetas de color (pueden usarse para prioridad)
  
  // Campos de miembros
  idMembers: string[];                  // IDs de miembros asignados
  members: TrelloMember[];              // Información completa de miembros (si se incluye)
  
  // Campos de checklist y progreso
  idChecklists: string[];               // IDs de checklists
  checklists: TrelloChecklist[];        // Checklists completos (si se incluye)
  checkItemStates: TrelloCheckItemState[]; // Estados de items de checklist
  
  // Campos de adjuntos
  badges: TrelloBadges;                 // Contadores (comentarios, adjuntos, checklists, etc.)
  
  // Campos de cover (imagen de portada)
  cover: TrelloCover | null;            // Imagen de portada
  
  // Campos de subscripción
  subscribed: boolean;                  // Si el usuario está suscrito a notificaciones
  
  // Campos personalizados
  customFieldItems: TrelloCustomFieldItem[]; // Campos personalizados
  
  // Campos de votación
  idMembersVoted: string[];             // Miembros que han votado
  
  // Información de archivo
  isTemplate: boolean;                  // Si es una plantilla
  cardRole: string | null;             // Rol de la tarjeta
  
  // Límites
  limits: TrelloLimits | null;          // Límites de la tarjeta
  
  // Coordenadas (para tableros con mapas)
  coordinates: TrelloCoordinates | null;
  
  // Campo de dirección
  address: string | null;
  locationName: string | null;
  
  // Stickers
  stickers: TrelloSticker[];
  
  // Plugin data
  pluginData: TrelloPluginData[];
}

// Interfaces de apoyo
export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: 'yellow' | 'purple' | 'blue' | 'red' | 'green' | 'orange' | 'black' | 'sky' | 'pink' | 'lime' | null;
  uses: number;
}

export interface TrelloMember {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  initials: string;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  pos: number;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  nameData: any;
  pos: number;
  state: 'complete' | 'incomplete';
  idChecklist: string;
  idMember: string | null;
  due: string | null;
}

export interface TrelloCheckItemState {
  idCheckItem: string;
  state: 'complete' | 'incomplete';
}

export interface TrelloBadges {
  votes: number;
  viewingMemberVoted: boolean;
  subscribed: boolean;
  fogbugz: string;
  checkItems: number;
  checkItemsChecked: number;
  checkItemsEarliestDue: string | null;
  comments: number;
  attachments: number;
  description: boolean;
  due: string | null;
  dueComplete: boolean;
  start: string | null;
  location: boolean;
}

export interface TrelloCover {
  idAttachment: string | null;
  color: string | null;
  idUploadedBackground: string | null;
  size: 'normal' | 'full';
  brightness: 'light' | 'dark';
  scaled: TrelloScaledCover[];
  edgeColor: string;
}

export interface TrelloScaledCover {
  id: string;
  scaled: boolean;
  url: string;
  bytes: number;
  height: number;
  width: number;
}

export interface TrelloCustomFieldItem {
  id: string;
  value: {
    text?: string;
    number?: string;
    checked?: string;
    date?: string;
  };
  idCustomField: string;
  idModel: string;
  modelType: string;
}

export interface TrelloLimits {
  attachments: {
    perCard: {
      status: string;
      disableAt: number;
      warnAt: number;
    };
  };
}

export interface TrelloCoordinates {
  latitude: number;
  longitude: number;
}

export interface TrelloSticker {
  id: string;
  top: number;
  left: number;
  zIndex: number;
  rotate: number;
  image: string;
  imageUrl: string;
  imageScaled: TrelloScaledImage[];
}

export interface TrelloScaledImage {
  id: string;
  scaled: boolean;
  url: string;
  bytes: number;
  height: number;
  width: number;
}

export interface TrelloPluginData {
  id: string;
  idPlugin: string;
  scope: string;
  idModel: string;
  value: string;
  access: string;
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

  // tablero seleccionado
  public selectedBoardIDSubject = new BehaviorSubject<string | null>(null);
  public selectedBoardID$ = this.selectedBoardIDSubject.asObservable();

  // lista seleccionada
  public selectedListSubject = new BehaviorSubject<TrelloList | null>(null);
  public selectedList$ = this.selectedListSubject.asObservable();

  // tarjeta seleccionada
  public selectedCardSubject = new BehaviorSubject<TrelloCard | null>(null);
  public selectedCard$ = this.selectedCardSubject.asObservable();


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

    const scope = 'read,write,account'; // Permisos necesarios
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

  // Obtener listas de un tablero específico
  getBoardLists(boardId: string): Observable<any[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
    const url = `${this.TRELLO_API_BASE}/boards/${boardId}/lists`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: 'id,name,closed'
    };
    return this.http.get<any[]>(url, { params });
  }

  // obterner tarjetas de una lista específica
  getListCards(listId: string, includeExtendedData: boolean = false): Observable<TrelloCard[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/lists/${listId}/cards`;
    
    // Campos básicos
    let fields = 'id,name,desc,url,idBoard,idList,closed,due,dueComplete,dueReminder,start,pos,dateLastActivity,subscribed,isTemplate,cardRole,address,locationName';
    
    // Parámetros básicos
    const params: any = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: fields
    };
  
    // Si se requieren datos extendidos, agregar más información
    if (includeExtendedData) {
      params.members = 'true';
      params.member_fields = 'id,username,fullName,avatarUrl,initials';
      params.checklists = 'all';
      params.checklist_fields = 'id,name,pos';
      params.checkItemStates = 'true';      
      params.labels = 'true';
      params.label_fields = 'id,name,color';
      params.customFieldItems = 'true';
      params.attachments = 'true';
      params.attachment_fields = 'id,name,url,bytes,date,isUpload,mimeType';
      params.stickers = 'true';
      params.pluginData = 'true';
    }
  
    return this.http.get<TrelloCard[]>(url, { params });
  }
  
  // Método actualizado para obtener tarjetas de un tablero con campos extendidos
  getBoardCards(boardId: string, includeExtendedData: boolean = false): Observable<TrelloCard[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/boards/${boardId}/cards`;
    
    let fields = 'id,name,desc,url,idBoard,idList,closed,due,dueComplete,dueReminder,start,pos,dateLastActivity,subscribed,isTemplate,cardRole,address,locationName';
    
    const params: any = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: fields
    };
  
    if (includeExtendedData) {
      params.members = 'true';
      params.member_fields = 'id,username,fullName,avatarUrl,initials';
      params.checklists = 'all';
      params.checklist_fields = 'id,name,pos';
      params.checkItemStates = 'true';
      params.labels = 'true';
      params.customFieldItems = 'true';
      params.attachments = 'true';
      params.attachment_fields = 'id,name,url,bytes,date,isUpload,mimeType';
      params.stickers = 'true';
      params.pluginData = 'true';
    }
  
    return this.http.get<TrelloCard[]>(url, { params });
  }
  
  // Nuevo método para obtener una tarjeta específica con todos los detalles
  getCardDetails(cardId: string): Observable<TrelloCard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      fields: 'all',
      members: 'true',
      member_fields: 'id,username,fullName,avatarUrl,initials',
      checklists: 'all',
      checklist_fields: 'all',
      checkItemStates: 'true',
      labels: 'true',
      customFieldItems: 'true',
      attachments: 'true',
      attachment_fields: 'all',
      stickers: 'true',
      pluginData: 'true',
      board: 'true',
      board_fields: 'id,name',
      list: 'true',
      list_fields: 'id,name'
    };
  
    return this.http.get<TrelloCard>(url, { params });
  }
  
  // Método para obtener campos personalizados de un tablero
  getBoardCustomFields(boardId: string): Observable<any[]> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/boards/${boardId}/customFields`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token
    };
  
    return this.http.get<any[]>(url, { params });
  }
  
  // Método para actualizar fecha de vencimiento de una tarjeta
  updateCardDueDate(cardId: string, dueDate: string | null, dueComplete: boolean = false): Observable<TrelloCard> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}`;
    const params: any = {
      key: this.TRELLO_API_KEY,
      token: token,
      due: dueDate,
      dueComplete: dueComplete.toString()
    };
  
    return this.http.put<TrelloCard>(url, null, { params });
  }
  
  // Método para agregar etiqueta a una tarjeta
  addLabelToCard(cardId: string, labelId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/idLabels`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      value: labelId
    };
  
    return this.http.post(url, null, { params });
  }
  
  // Método para remover etiqueta de una tarjeta
  removeLabelFromCard(cardId: string, labelId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/idLabels/${labelId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token
    };
  
    return this.http.delete(url, { params });
  }
  
  // Método para asignar miembro a una tarjeta
  addMemberToCard(cardId: string, memberId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/idMembers`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      value: memberId
    };
  
    return this.http.post(url, null, { params });
  }
  
  // Método para remover miembro de una tarjeta
  removeMemberFromCard(cardId: string, memberId: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/idMembers/${memberId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token
    };
  
    return this.http.delete(url, { params });
  }
  
  // Método para crear checklist en una tarjeta
  createChecklist(cardId: string, name: string): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/checklists`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      name: name
    };
  
    return this.http.post(url, null, { params });
  }
  
  // Método para actualizar item de checklist
  updateChecklistItem(cardId: string, checkItemId: string, state: 'complete' | 'incomplete'): Observable<any> {
    const token = this.getTrelloToken();
    if (!token) {
      throw new Error('No Trello token available');
    }
  
    const url = `${this.TRELLO_API_BASE}/cards/${cardId}/checkItem/${checkItemId}`;
    const params = {
      key: this.TRELLO_API_KEY,
      token: token,
      state: state
    };
  
    return this.http.put(url, null, { params });
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