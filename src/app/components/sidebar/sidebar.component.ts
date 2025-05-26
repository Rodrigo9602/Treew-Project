import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/components/sidebar.service';
import { SideItemComponent } from './side-item/side-item.component';
import { TrelloAuthService } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { ModalComponent } from '../modal/modal.component';
import { NewBoardFormComponent } from '../forms/new-board-form/new-board-form.component';

/**
 * Interfaz que define la estructura de un elemento del sidebar.
 */
export interface SideItem {
  /** Texto a mostrar en el elemento */
  label: string;
  /** Icono opcional del elemento */
  icon?: string;
  /** URL de navegación opcional */
  url?: string;
  /** Identificador único del elemento */
  id: string;
}

/**
 * Componente sidebar lateral de la aplicación.
 * 
 * Proporciona navegación lateral con lista de tableros de Trello,
 * capacidad de crear nuevos tableros y manejo responsivo del menú.
 * Se adapta automáticamente al tamaño de pantalla y permite la
 * selección de tableros activos.
 * 
 * @example
 * ```html
 * <app-sidebar></app-sidebar>
 * ```
 */
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, SideItemComponent, ModalComponent, NewBoardFormComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  /**
   * Estado de apertura del sidebar.
   * @default false
   */
  isOpen: boolean = false;

  /**
   * Lista de elementos a mostrar en el sidebar.
   * Generalmente contiene los tableros del usuario.
   * @default []
   */
  sideItems: SideItem[] = [];  

  /**
   * Controla la visibilidad del modal de creación de tableros.
   * @default false
   */
  public openCreateBoardModal: boolean = false;

  /**
   * Constructor del componente.
   * 
   * @param {SidebarService} sidenav - Servicio para controlar el estado del sidebar
   * @param {TrelloAuthService} trelloService - Servicio de integración con Trello
   * @param {GlobalVariablesService} globalService - Servicio de variables globales
   */
  constructor(private sidenav: SidebarService, private trelloService: TrelloAuthService, private globalService: GlobalVariablesService) { }

  /**
   * Inicializa el componente.
   * 
   * Obtiene los datos de los tableros, configura las suscripciones
   * para nuevos tableros y cambios de estado del sidebar, y
   * verifica el tamaño de pantalla inicial.
   * 
   * @returns {void}
   */
  ngOnInit(): void {
    this.getBoardsData(); 

    // suscribirse a cambios en la variable newBoard$
    this.trelloService.newBoard$.subscribe((newBoard)=> {
      if(newBoard) {
        this.getBoardsData();
      }
    })

    this.checkScreenSize();
    this.sidenav.stateChange$.subscribe((navState) => {
      this.isOpen = navState;
    });    
  }

  /**
   * Obtiene los datos de los tableros del usuario desde Trello.
   * 
   * Recupera todos los tableros del usuario autenticado y los
   * convierte en elementos del sidebar. Establece el primer
   * tablero como activo por defecto.
   * 
   * @private
   * @returns {void}
   */
  getBoardsData():void {
    // Obtener listado de tableros del usuario inicialmente
    this.trelloService.getUserBoards().subscribe((response: any) => {
      response.forEach((board: any) => {
        this.sideItems.push({
          label: board.name,          
          url: `/board/${board.id}`,
          id: board.id
        });

        // setear el primer tablero como activo
        if (response.length > 0) {
          this.globalService.selectedBoardIDSubject.next(response[0].id);
        }
      });
    });  
  }
 
  /**
   * Escucha el evento de redimensionamiento de ventana.
   * 
   * @param {any} event - Evento de redimensionamiento
   * @returns {void}
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  /**
   * Verifica el tamaño de pantalla y ajusta el estado del sidebar.
   * 
   * En pantallas pequeñas (< 768px) colapsa el sidebar,
   * en pantallas grandes (>= 768px) lo expande automáticamente.
   * 
   * @private
   * @returns {void}
   */
  checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.sidenav.setMenuExpanded(false);
    } else if (window.innerWidth >= 768) {
      this.sidenav.setMenuExpanded(true);
    }
  }

  /**
   * Selecciona un tablero como activo.
   * 
   * Actualiza el servicio global con el ID del tablero seleccionado,
   * permitiendo que otros componentes reaccionen al cambio.
   * 
   * @public
   * @param {string} boardId - ID del tablero a seleccionar
   * @returns {void}
   */
  selectBoard(boardId: string): void {
    this.globalService.selectedBoardIDSubject.next(boardId);
  }

  /**
   * Cierra el sidebar.
   * 
   * Útil para cerrar el menú lateral en dispositivos móviles
   * después de seleccionar una opción.
   * 
   * @public
   * @returns {void}
   */
  closeNav(): void {
    this.sidenav.setMenuExpanded(false);
  }  

  /**
   * Abre el modal para crear un nuevo tablero.
   * 
   * @public
   * @returns {void}
   */
  createNewBoard():void {   
    this.openCreateBoardModal = true;
  }

  /**
   * Maneja el evento de creación de un nuevo tablero.
   * 
   * Envía la solicitud a Trello para crear el tablero y,
   * si es exitosa, lo añade a la lista del sidebar y cierra el modal.
   * 
   * @public
   * @param {string} event - Nombre del nuevo tablero a crear
   * @returns {void}
   */
  onCreateNewBoard(event: string):void {
    this.trelloService.createBoard(event).subscribe({
      next: (newBoard) => {
        this.sideItems.push({
          label: newBoard.name,          
          url: `/board/${newBoard.id}`,
          id: newBoard.id
        });
        this.openCreateBoardModal = false;
      },
      error: (err) => {
        console.error('Error creating board:', err);        
      }
    });
  }
}