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

  constructor(private trelloService: TrelloAuthService, private toast: ToastService, private globalService: GlobalVariablesService) {}

  ngOnInit(): void {
    // Obtener listado de tarjetas para la lista actual
    if (this.list) {
      this.trelloService.getListCards(this.list.id, true).subscribe((cards) => {              
        this.cardsList = cards;        
      });
    }
  }  

  addNewCard():void {   
    this.onAddNewCard = true;    
  }

  handleCreateCard(cardData: { name: string; desc: string }): void {
    this.trelloService.createCard(this.list?.id!, cardData.name, cardData.desc).subscribe((newCard:TrelloCard) => {
      this.cardsList.push(newCard);
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
    console.log('Archivar lista');
    this.closeMenu();
  }
  
  sortBy(option: 'creationDesc' | 'creationAsc' | 'alphabetical' | 'dueDate') {
    console.log('Ordenar por:', option);
    // Aquí implementa la lógica real de ordenamiento según `option`
    this.closeMenu();
  }
  
}
