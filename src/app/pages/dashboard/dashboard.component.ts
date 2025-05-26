import { Component, OnInit } from '@angular/core';
import { TrelloAuthService, TrelloCard, TrelloList } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { ToastService } from '../../services/components/toast.service';
import { ListComponent } from '../../components/list/list.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { CardFormComponent } from '../../components/forms/card-form/card-form.component';
import { NewListFormComponent } from '../../components/forms/new-list-form/new-list-form.component';
import { ListOrderFormComponent } from '../../components/forms/list-order-form/list-order-form.component';
import { EditListFormComponent } from '../../components/forms/edit-list-form/edit-list-form.component';
import { NewBoardFormComponent } from '../../components/forms/new-board-form/new-board-form.component';

interface SelectOptions {
  label:string,
  value: string,
}

/**
 * Componente principal del dashboard que gestiona tableros, listas y tarjetas de Trello.
 * Proporciona funcionalidades para crear, editar, mover y gestionar elementos del tablero.
 */
@Component({
  selector: 'app-dashboard',
  imports: [ListComponent, ModalComponent, CardFormComponent, NewListFormComponent, ListOrderFormComponent, EditListFormComponent, NewBoardFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {  
  public selectedBoard: string | null = null;
  public selectedList: TrelloList | null = null;
  public boardLists: TrelloList[] = [];  
  public openCardModal: boolean = false;
  public createNewCard: boolean = false;
  public openNewListModal: boolean = false;
  public moveListModalOpen: boolean = false;
  public selectedListOrder: number = 0;
  public modalEditListOpen: boolean = false;
  public createNewBoardModal: boolean = false;
  public listOptions:SelectOptions[] = [];

  constructor(private trelloService: TrelloAuthService, private globalService: GlobalVariablesService, private toast: ToastService) { }

  /**
   * Inicializa el componente y configura las suscripciones a los observables
   * para gestionar cambios en tableros, listas archivadas y tarjetas seleccionadas.
   */
  ngOnInit(): void {
    // obtener el tablero seleccionado
    this.globalService.selectedBoardID$.subscribe((boardID) => {
      // obtener listas para el tablero seleccionado
      if(boardID) {
        this.selectedBoard = boardID;
        this.getBoardLists(boardID);
      }    
    }); 
    // suscribirse al observable de listas
    this.globalService.archivedList$.subscribe((archived) => {
      if(archived) {
        // si se ha archivado una lista, obtener las listas nuevamente
        this.getBoardLists(this.selectedBoard!);
      }
    });
    // suscribirse al observable de cards
    this.globalService.selectedCard$.subscribe((card)=> {
      if(card) {
        this.openCardModal = true;        
      }
    })
  }  

  /**
   * Obtiene todas las listas de un tablero específico desde la API de Trello.
   * Actualiza las opciones de listas disponibles para selección.
   * @private
   * @param boardID - ID del tablero del cual obtener las listas
   */
  private getBoardLists(boardID: string) {
    // obtener las listas del tablero seleccionado
    this.trelloService.getBoardLists(boardID).subscribe((response: any) => {          
      this.boardLists = response;
      // limpiar el array de opciones
      this.listOptions = [];
      this.getOptionsForList();
    });
  }

  /**
   * Convierte las listas del tablero en opciones de selección para formularios.
   * Genera un array de objetos con etiqueta y valor para cada lista.
   * @private
   */
  private getOptionsForList() {
    this.boardLists.forEach((list)=> {      
      this.listOptions.push({
        label: list.name,
        value: list.id
      });
    });    
  }

  /**
   * Ordena las listas del tablero según su posición numérica.
   * @private
   */
  private sortListsByPosition() {
    this.boardLists.sort((a, b) => a.pos - b.pos);
  }  

  /**
   * Calcula la nueva posición numérica para una lista que se está moviendo a un índice específico.
   * Utiliza un algoritmo de posicionamiento que evita conflictos y mantiene el orden.
   * @private
   * @param newIndex - Nuevo índice de posición donde se colocará la lista
   * @returns La nueva posición numérica calculada para la lista
   * @throws Error si no se encuentra la lista seleccionada
   */
  private calculateNewListPosition(newIndex: number): number {
    // 1) Ordenar copias por pos
    const sorted = [...this.boardLists].sort((a, b) => a.pos - b.pos);

    // 2) Extraer la lista que movemos
    const currentIdx = sorted.findIndex(l => l.id === this.selectedList?.id);
    if (currentIdx === -1) {
      throw new Error(`Lista con id ${this.selectedList?.id} no encontrada`);
    }
    const [moving] = sorted.splice(currentIdx, 1);

    // 3) Clamp newIndex y re-insertar
    const idx = Math.max(0, Math.min(newIndex, sorted.length));
    sorted.splice(idx, 0, moving);

    // 4) Si está al principio o al final, manejamos extremos:
    if (idx === 0) {
      // mitad de la siguiente
      return sorted[1].pos / 2;
    }
    if (idx === sorted.length - 1) {
      // un paso (p.ej. +1000) tras la anterior
      return sorted[sorted.length - 2].pos + 1000;
    }

    // 5) Caso intermedio: promedio entre prev y next
    const prevPos = sorted[idx - 1].pos;
    const nextPos = sorted[idx + 1].pos;
    return (prevPos + nextPos) / 2;
  }

  /**
   * Maneja el evento de actualización de una tarjeta.
   * Cierra el modal de tarjeta y muestra una notificación de éxito.
   */
  cardUpdatedEvent():void {
    // cerrar el modal
    this.onCloseCardModal();
    // mostrar notificacion y posteriormente cerrar el modal
    this.toast.success(
      'Card Updated',
      'The card was successfully updated'
    );   
  }

  /**
   * Abre el modal para crear una nueva lista.
   */
  onAddNewList():void {
    this.openNewListModal = true;
  }

  /**
   * Crea una nueva lista en el tablero actual.
   * Cierra el modal de nueva lista y actualiza la lista de listas disponibles.
   * @param event - Nombre de la nueva lista a crear
   */
  onNewList(event:string):void {
    // cerrar el modal
    this.onCloseNewListModal();
    // crear la nueva lista
    this.trelloService.createList(event, this.selectedBoard!).subscribe((newList) => {
      this.boardLists.push(newList);
      // notificar acerca de la creaciónd de nueva lista
      this.toast.success(
        'New list added',
        'The new list was successfully created'
      )      
    });
  }

  /**
   * Prepara la edición de una lista existente.
   * Establece la lista seleccionada y abre el modal de edición.
   * @param event - Lista que se desea editar
   */
  onEditList(event: TrelloList) {    
    this.selectedList = event;
    this.modalEditListOpen = true;
  }

  /**
   * Procesa la edición de una lista existente.
   * Actualiza el nombre de la lista y sincroniza los cambios con el servidor.
   * @param event - Nuevo nombre para la lista
   */
  onListEdited(event: string) {
    // cerrar el modal
    this.onCloseEditListModal();
    this.trelloService.updateList(this.selectedList?.id!, event).subscribe({
      next: (editedList) => {
        // reemplazar la nueva list en el array
        this.boardLists.splice(this.boardLists.findIndex((list) => list.id === this.selectedList?.id), 1, editedList);
        // mostrar notificación
        this.toast.success('List edited successfully', '');        
      },
      error: (err) => {
        console.error('Error editing list:', err);
        this.toast.danger('Error editing list', err.message)
      }
    });
  }

  /**
   * Prepara el movimiento de una lista a una nueva posición.
   * Establece la lista seleccionada, calcula su orden actual y abre el modal de reordenamiento.
   * @param event - Lista que se desea mover
   */
  onMoveList(event: TrelloList) {    
    this.selectedList = event;
    this.selectedListOrder = this.boardLists.findIndex((list) => list.id === event.id) + 1;    
    this.moveListModalOpen = true;
  }

  /**
   * Ejecuta el reordenamiento de una lista a una nueva posición.
   * Calcula la nueva posición numérica y actualiza el orden en el servidor.
   * @param newOrder - Nueva posición ordinal (1-based) donde colocar la lista
   */
  handleReorder(newOrder: number) {
    // cerrar el modal
    this.onCloseMoveListModal();

    const newPos = this.calculateNewListPosition(Number(newOrder)-1);
  
    this.trelloService.updateListOrder({
      id: this.selectedList?.id!,
      position: newPos
    }).subscribe({
      next: (listWithNewOrder: TrelloList) => {
        // Actualiza lista local
        const index = this.boardLists.findIndex(list => list.id === listWithNewOrder.id);
        this.boardLists.splice(index, 1, listWithNewOrder);
        this.sortListsByPosition(); // asegúrate que esta función ordena por `pos`
      },
      error: (err) => {
        console.error('Error moving list:', err);
        this.toast.danger('Error moving list', err.message)
      }
    });  
  }
  
  /**
   * Cierra el modal de visualización/edición de tarjetas.
   * Limpia la selección de tarjeta actual en el servicio global.
   */
  onCloseCardModal(): void {
    this.openCardModal = false; 
    this.globalService.selectedCardSubject.next(null);   
  } 

  /**
   * Cierra el modal de creación de nueva lista.
   */
  onCloseNewListModal(): void {
    this.openNewListModal = false;
  }

  /**
   * Cierra el modal de movimiento/reordenamiento de listas.
   * Limpia la selección de lista actual en el servicio global.
   */
  onCloseMoveListModal():void {
    this.moveListModalOpen = false;
    this.globalService.selectedListSubject.next(null);
  }

  /**
   * Cierra el modal de edición de listas.
   * Limpia la selección de lista actual en el servicio global.
   */
  onCloseEditListModal(): void {
    this.modalEditListOpen = false;
    this.globalService.selectedListSubject.next(null);
  }

  /**
   * Abre el modal para crear un nuevo tablero.
   */
  createNewBoard(): void {
    this.createNewBoardModal = true;
  } 

  /**
   * Crea un nuevo tablero con el nombre especificado.
   * Notifica a otros componentes sobre la creación y cierra el modal.
   * @param event - Nombre del nuevo tablero a crear
   */
  onCreateNewBoard(event: string) {
    this.trelloService.createBoard(event).subscribe({
      next: () => {
        this.trelloService.newBoardSubject.next(true);
        this.createNewBoardModal = false;
        this.toast.success('Board created successfully', 'The new board was created successfully');
      },
      error: (err) => {
        console.error('Error creating board:', err);
        this.toast.danger('Error creating board', err.message)
      }
    });
  }
}