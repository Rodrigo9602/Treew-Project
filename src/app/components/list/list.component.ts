import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TrelloCard, TrelloList } from '../../services/authorization.service';
import { TrelloAuthService } from '../../services/authorization.service';
import { ToastService } from '../../services/components/toast.service';
import { GlobalVariablesService } from '../../services/global-variables.service';

import { CardComponent } from '../card/card.component';
import { NewCardComponent } from '../forms/new-card/new-card.component';

import { DragDropModule, CdkDragDrop, moveItemInArray, } from '@angular/cdk/drag-drop';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-list',
  imports: [CardComponent, NewCardComponent, DragDropModule, ClickOutsideDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Input() list: TrelloList | undefined;
  @Output() onMoveList = new EventEmitter<TrelloList>(); 
  @Output() onEditList = new EventEmitter<TrelloList>();

  public onAddNewCard: boolean = false;
  public cardsList: TrelloCard[] = [];  
  public menuOpen: boolean = false;
  private originalCardsList: TrelloCard[] = []; // Backup para restaurar orden original

  constructor(private trelloService: TrelloAuthService, private toast: ToastService, private globalService: GlobalVariablesService) {}

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

  private getListCards(listID: string):void {
    this.trelloService.getListCards(listID, true).subscribe((cards) => {              
      this.cardsList = cards;      
      this.originalCardsList = [...cards]; // Guardar copia del orden original
    });
  }

  addNewCard():void {   
    this.onAddNewCard = true;    
  }

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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  closeMenu() {
    this.menuOpen = false;
  }

  editList() {
    // setear lista actual como seleccionada en servicio global
    this.globalService.selectedListSubject.next(this.list?.id!);
    // lanzar el evento de ejecución de edicion
    this.onEditList.emit(this.list);
    this.closeMenu();
  }
  
  moveList() {
    // setear lista actual como seleccionada en servicio global
    this.globalService.selectedListSubject.next(this.list?.id!);
    // lanzar el evento de ejecución de cambio de posicion
    this.onMoveList.emit(this.list);
    this.closeMenu();
  }
  
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