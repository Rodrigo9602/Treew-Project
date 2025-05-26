import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TrelloCard, TrelloList } from '../../services/authorization.service';
import { TrelloAuthService } from '../../services/authorization.service';
import { ToastService } from '../../services/components/toast.service';
import { GlobalVariablesService } from '../../services/global-variables.service';

import { CardComponent } from '../card/card.component';
import { NewCardComponent } from '../forms/new-card/new-card.component';

import { DragDropModule, CdkDragDrop, moveItemInArray, } from '@angular/cdk/drag-drop';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

/**
 * Componente que representa una lista de Trello con funcionalidades completas de gestión.
 * 
 * Este componente maneja la visualización y gestión de listas de Trello, incluyendo
 * operaciones CRUD sobre tarjetas, reordenamiento mediante drag & drop, ordenamiento
 * por diferentes criterios, y gestión del estado de la lista (edición, movimiento, archivado).
 * 
 * @example
 * ```html
 * <app-list 
 *   [list]="trelloList"
 *   (onMoveList)="handleMoveList($event)"
 *   (onEditList)="handleEditList($event)">
 * </app-list>
 * ```
 * 
 * @example
 * ```typescript
 * // En el componente padre
 * export class BoardComponent {
 *   lists: TrelloList[] = [...];
 *   
 *   handleMoveList(list: TrelloList) {
 *     // Lógica para mover la lista
 *   }
 *   
 *   handleEditList(list: TrelloList) {
 *     // Lógica para editar la lista
 *   }
 * }
 * ```
 * 
 * @usageNotes
 * ### Funcionalidades principales:
 * - Visualización de tarjetas en formato lista
 * - Creación de nuevas tarjetas con formulario integrado
 * - Reordenamiento de tarjetas mediante drag & drop
 * - Ordenamiento por múltiples criterios (fecha, alfabético, vencimiento)
 * - Menú contextual con opciones de gestión
 * - Archivado de listas con confirmación
 * - Sincronización automática con la API de Trello
 * 
 * ### Dependencias:
 * - `TrelloAuthService` para operaciones con la API de Trello
 * - `ToastService` para notificaciones al usuario
 * - `GlobalVariablesService` para comunicación entre componentes
 * - `CardComponent` para renderizar tarjetas individuales
 * - `NewCardComponent` para el formulario de creación
 * 
 * ### Consideraciones de rendimiento:
 * - Mantiene copia de respaldo para restaurar orden en caso de error
 * - Optimiza llamadas a la API mediante batching de actualizaciones
 * - Gestiona suscripciones reactivas para actualizaciones en tiempo real
 * 
 * @since 1.0.0
 * @author [Nombre del desarrollador]
 */
@Component({
  selector: 'app-list',
  imports: [CardComponent, NewCardComponent, DragDropModule, ClickOutsideDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  
  /**
   * Datos de la lista de Trello a mostrar y gestionar.
   * 
   * Contiene toda la información de la lista incluyendo id, nombre,
   * posición y otras propiedades necesarias para la funcionalidad
   * del componente.
   * 
   * @input
   * @type {TrelloList | undefined}
   * 
   * @example
   * ```html
   * <app-list [list]="selectedList"></app-list>
   * ```
   * 
   * @example
   * ```typescript
   * // Estructura típica de TrelloList
   * const list: TrelloList = {
   *   id: '123',
   *   name: 'To Do',
   *   pos: 16384,
   *   closed: false
   * };
   * ```
   */
  @Input() list: TrelloList | undefined;
  
  /**
   * Evento emitido cuando se solicita mover la lista.
   * 
   * Se dispara cuando el usuario selecciona la opción de mover lista
   * desde el menú contextual, permitiendo al componente padre manejar
   * la lógica de reordenamiento de listas.
   * 
   * @output
   * @type {EventEmitter<TrelloList>}
   * 
   * @example
   * ```html
   * <app-list (onMoveList)="handleMoveList($event)"></app-list>
   * ```
   * 
   * @example
   * ```typescript
   * handleMoveList(list: TrelloList) {
   *   console.log('Mover lista:', list.name);
   *   // Abrir modal de posicionamiento
   * }
   * ```
   */
  @Output() onMoveList = new EventEmitter<TrelloList>(); 
  
  /**
   * Evento emitido cuando se solicita editar la lista.
   * 
   * Se dispara cuando el usuario selecciona la opción de editar lista
   * desde el menú contextual, permitiendo al componente padre abrir
   * formularios de edición o modales correspondientes.
   * 
   * @output
   * @type {EventEmitter<TrelloList>}
   * 
   * @example
   * ```html
   * <app-list (onEditList)="handleEditList($event)"></app-list>
   * ```
   * 
   * @example
   * ```typescript
   * handleEditList(list: TrelloList) {
   *   console.log('Editar lista:', list.name);
   *   // Abrir formulario de edición
   * }
   * ```
   */
  @Output() onEditList = new EventEmitter<TrelloList>();

  /**
   * Estado que controla la visibilidad del formulario de nueva tarjeta.
   * 
   * Cuando es `true`, se muestra el componente `NewCardComponent`
   * para permitir al usuario crear una nueva tarjeta en la lista.
   * 
   * @type {boolean}
   * @default false
   */
  public onAddNewCard: boolean = false;
  
  /**
   * Lista de tarjetas pertenecientes a esta lista de Trello.
   * 
   * Contiene todas las tarjetas actuales de la lista, se actualiza
   * dinámicamente cuando se agregan, eliminan o reordenan tarjetas.
   * 
   * @type {TrelloCard[]}
   * @default []
   */
  public cardsList: TrelloCard[] = [];  
  
  /**
   * Estado que controla la visibilidad del menú contextual.
   * 
   * Cuando es `true`, se muestra el menú con opciones como editar,
   * mover, archivar y ordenar la lista.
   * 
   * @type {boolean}
   * @default false
   */
  public menuOpen: boolean = false;
  
  /**
   * Copia de respaldo de la lista original de tarjetas.
   * 
   * Se utiliza para restaurar el orden original en caso de que
   * falle una operación de reordenamiento en la API de Trello.
   * 
   * @private
   * @type {TrelloCard[]}
   * @default []
   */
  private originalCardsList: TrelloCard[] = [];

  /**
   * Constructor del componente.
   * 
   * @param trelloService - Servicio para interacciones con la API de Trello
   * @param toast - Servicio para mostrar notificaciones al usuario
   * @param globalService - Servicio global para comunicación entre componentes
   */
  constructor(private trelloService: TrelloAuthService, private toast: ToastService, private globalService: GlobalVariablesService) {}

  /**
   * Inicialización del componente.
   * 
   * Carga las tarjetas de la lista y configura las suscripciones
   * para escuchar cambios globales en tarjetas.
   * 
   * @lifecycle
   * 
   * @example
   * ```typescript
   * // El método se ejecuta automáticamente cuando:
   * // 1. Se asigna una lista al componente
   * // 2. Se cargan las tarjetas de la lista
   * // 3. Se configuran las suscripciones reactivas
   * ```
   */
  ngOnInit(): void {
    // Obtener listado de tarjetas para la lista actual
    if (this.list) {
      this.getListCards(this.list.id!);
    }
    // Suscribirse al observable de cambio de lista por parte de tarjetas
    this.globalService.cardChanged$.subscribe((changed) => {
      if (changed) {
        // Actualizar la lista de tarjetas
        this.getListCards(this.list?.id!);
      }
    }); 
  }  

  /**
   * Obtiene las tarjetas de una lista específica desde la API de Trello.
   * 
   * Realiza una llamada a la API para obtener todas las tarjetas
   * de la lista y actualiza tanto la lista actual como el respaldo.
   * 
   * @private
   * @param listID - ID de la lista de Trello
   * 
   * @example
   * ```typescript
   * // Uso interno del método
   * this.getListCards('5f1234567890abcdef123456');
   * ```
   */
  private getListCards(listID: string):void {
    this.trelloService.getListCards(listID, true).subscribe((cards) => {              
      this.cardsList = cards;      
      this.originalCardsList = [...cards]; // Guardar copia del orden original
    });
  }

  /**
   * Activa el modo de creación de nueva tarjeta.
   * 
   * Cambia el estado para mostrar el formulario de creación
   * de tarjetas integrado en la lista.
   * 
   * @public
   * 
   * @example
   * ```html
   * <!-- En el template -->
   * <button (click)="addNewCard()">Add New Card</button>
   * ```
   */
  addNewCard():void {   
    this.onAddNewCard = true;    
  }

  /**
   * Maneja la creación de una nueva tarjeta.
   * 
   * Procesa los datos del formulario de nueva tarjeta, envía la petición
   * a la API de Trello y actualiza la lista local al recibir la respuesta.
   * 
   * @param cardData - Datos de la nueva tarjeta (nombre y descripción)
   * @param cardData.name - Nombre de la tarjeta
   * @param cardData.desc - Descripción de la tarjeta
   * 
   * @example
   * ```typescript
   * // Llamado desde NewCardComponent
   * const newCardData = {
   *   name: 'Nueva tarea',
   *   desc: 'Descripción de la nueva tarea'
   * };
   * this.handleCreateCard(newCardData);
   * ```
   * 
   * @public
   */
  handleCreateCard(cardData: { name: string; desc: string }): void {
    this.trelloService.createCard(this.list?.id!, cardData.name, cardData.desc).subscribe((newCard:TrelloCard) => {
      this.cardsList.push(newCard);
      this.originalCardsList.push(newCard);
    });
    // evento de notificación
    this.toast.success(
      'Card added',
      'The card was successfully added'
    );
    // cerrar el formulario
    this.onAddNewCard = false;
  }

  /**
   * Maneja el evento de drop del drag & drop de tarjetas.
   * 
   * Reordena las tarjetas localmente y sincroniza el cambio
   * con la API de Trello. En caso de error, restaura el orden original.
   * 
   * @param event - Evento del CDK drag & drop
   * @param event.previousIndex - Índice anterior de la tarjeta
   * @param event.currentIndex - Nuevo índice de la tarjeta
   * 
   * @example
   * ```html
   * <!-- En el template con CDK Drag & Drop -->
   * <div cdkDropList (cdkDropListDropped)="dropCard($event)">
   *   <div *ngFor="let card of cardsList" cdkDrag>
   *     <app-card [card]="card"></app-card>
   *   </div>
   * </div>
   * ```
   * 
   * @public
   */
  dropCard(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.cardsList, event.previousIndex, event.currentIndex);
  
    const reorderedCards = this.cardsList.map((card, index) => ({
      id: card.id,
      position: (index + 1) * 100,
    }));
  
    this.trelloService.updateCardOrder(this.list?.id!, reorderedCards).subscribe({
      next: () => {
        this.toast.success('Card was moved successfully', '')
        // Actualizar el orden original después de un drag exitoso
        this.originalCardsList = [...this.cardsList];
      },
      error: (err) => { 
        console.error('Error moving card:', err);
        this.toast.danger('Error moving card', err.message);
      }
    });
  }

  /**
   * Alterna el estado de visibilidad del menú contextual.
   * 
   * Cambia entre mostrar y ocultar el menú con opciones
   * de gestión de la lista.
   * 
   * @public
   * 
   * @example
   * ```html
   * <button (click)="toggleMenu()">⋮</button>
   * ```
   */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  /**
   * Cierra el menú contextual.
   * 
   * Establece el estado del menú como cerrado.
   * Utilizado por la directiva clickOutside y otras acciones.
   * 
   * @public
   * 
   * @example
   * ```html
   * <div (clickOutside)="closeMenu()" class="menu">
   *   <!-- Opciones del menú -->
   * </div>
   * ```
   */
  closeMenu() {
    this.menuOpen = false;
  }

  /**
   * Inicia el proceso de edición de la lista.
   * 
   * Establece la lista actual como seleccionada en el servicio global,
   * emite el evento de edición y cierra el menú contextual.
   * 
   * @public
   * 
   * @example
   * ```html
   * <button (click)="editList()">Edit List</button>
   * ```
   */
  editList() {
    // setear lista actual como seleccionada en servicio global
    this.globalService.selectedListSubject.next(this.list?.id!);
    // lanzar el evento de ejecución de edicion
    this.onEditList.emit(this.list);
    this.closeMenu();
  }
  
  /**
   * Inicia el proceso de movimiento de la lista.
   * 
   * Establece la lista actual como seleccionada en el servicio global,
   * emite el evento de movimiento y cierra el menú contextual.
   * 
   * @public
   * 
   * @example
   * ```html
   * <button (click)="moveList()">Move List</button>
   * ```
   */
  moveList() {
    // setear lista actual como seleccionada en servicio global
    this.globalService.selectedListSubject.next(this.list?.id!);
    // lanzar el evento de ejecución de cambio de posicion
    this.onMoveList.emit(this.list);
    this.closeMenu();
  }
  
  /**
   * Archiva la lista actual.
   * 
   * Envía una petición a la API de Trello para archivar la lista
   * y notifica al sistema global para actualizar la vista.
   * 
   * @public
   * 
   * @example
   * ```html
   * <button (click)="archiveList()" class="danger">Archive List</button>
   * ```
   */
  archiveList() {
    this.trelloService.updateListStatus(this.list?.id!, true).subscribe({
      next: () => {
        this.toast.success('List archived', 'The list was successfully archived');
        // Emitir evento para actualizar listas en el componente padre
        this.globalService.archivedListSubject.next(true);
      },
      error: (err) => {
        console.error('Error archiving list:', err);
        this.toast.danger('Error archiving list', err.message);
      }
    })
  }
  
  /**
   * Ordena las tarjetas según el criterio especificado.
   * 
   * Aplica diferentes algoritmos de ordenamiento según la opción seleccionada
   * y sincroniza el nuevo orden con la API de Trello.
   * 
   * @param option - Criterio de ordenamiento a aplicar
   * 
   * @example
   * ```html
   * <button (click)="sortBy('alphabetical')">Sort A-Z</button>
   * <button (click)="sortBy('dueDate')">Sort by Due Date</button>
   * <button (click)="sortBy('creationDesc')">Newest First</button>
   * <button (click)="sortBy('creationAsc')">Oldest First</button>
   * ```
   * 
   * @example
   * ```typescript
   * // Llamada programática
   * this.sortBy('alphabetical'); // Ordena alfabéticamente
   * this.sortBy('dueDate');      // Ordena por fecha de vencimiento
   * ```
   * 
   * @public
   */
  sortBy(option: 'creationDesc' | 'creationAsc' | 'alphabetical' | 'dueDate') {
    let sortedCards: TrelloCard[] = [...this.cardsList];
    
    switch(option) {
      case 'creationDesc':
        // Más reciente primero (basado en dateLastActivity o id)
        sortedCards.sort((a, b) => {
          const dateA = new Date(a.dateLastActivity || a.id).getTime();
          const dateB = new Date(b.dateLastActivity || b.id).getTime();
          return dateB - dateA;
        });
        break;
        
      case 'creationAsc':
        // Más antiguo primero
        sortedCards.sort((a, b) => {
          const dateA = new Date(a.dateLastActivity || a.id).getTime();
          const dateB = new Date(b.dateLastActivity || b.id).getTime();
          return dateA - dateB;
        });
        break;
        
      case 'alphabetical':
        // Orden alfabético por nombre
        sortedCards.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        break;
        
      case 'dueDate':
        // Por fecha de vencimiento - primero las que tienen fecha, luego las que no
        sortedCards.sort((a, b) => {
          // Si ambas tienen fecha de vencimiento
          if (a.due && b.due) {
            return new Date(a.due).getTime() - new Date(b.due).getTime();
          }
          // Si solo 'a' tiene fecha, va primero
          if (a.due && !b.due) return -1;
          // Si solo 'b' tiene fecha, va primero
          if (!a.due && b.due) return 1;
          // Si ninguna tiene fecha, mantener orden actual
          return 0;
        });
        break;
    }
    
    this.cardsList = sortedCards;
    
    // Actualizar posiciones en Trello API
    this.updateCardPositionsInTrello();
    
    // Mostrar notificación
    const sortMessages = {
      'creationDesc': 'Cards sorted by creation date (newest first)',
      'creationAsc': 'Cards sorted by creation date (oldest first)', 
      'alphabetical': 'Cards sorted alphabetically',
      'dueDate': 'Cards sorted by due date'
    };
    
    this.toast.success('Cards sorted', sortMessages[option]);
    this.closeMenu();
  }
  
  /**
   * Actualiza las posiciones de las tarjetas en la API de Trello.
   * 
   * Método auxiliar que sincroniza el orden local de tarjetas
   * con la API de Trello. En caso de error, restaura el orden original.
   * 
   * @private
   * 
   * @example
   * ```typescript
   * // Uso interno después de reordenar
   * this.updateCardPositionsInTrello();
   * ```
   */
  private updateCardPositionsInTrello(): void {
    const reorderedCards = this.cardsList.map((card, index) => ({
      id: card.id,
      position: (index + 1) * 100,
    }));
    
    this.trelloService.updateCardOrder(this.list?.id!, reorderedCards).subscribe({
      next: () => {
        // Actualizar el orden original después de ordenar exitosamente
        this.originalCardsList = [...this.cardsList];
      },
      error: (err) => {
        console.error('Error updating card positions:', err);
        this.toast.danger('Error updating card order', err.message);
        // Restaurar orden original en caso de error
        this.cardsList = [...this.originalCardsList];
      }
    });
  }
}