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

  constructor(private trelloService: TrelloAuthService, private globalService: GlobalVariablesService, private toast: ToastService) { }

  ngOnInit(): void {
    // obtener el tablero seleccionado
    this.globalService.selectedBoardID$.subscribe((boardID) => {
      // obtener listas para el tablero seleccionado
      if(boardID) {
        this.selectedBoard = boardID;
        this.trelloService.getBoardLists(boardID).subscribe((response: any) => {          
          this.boardLists = response;             
        });
      }    
    }); 
    // suscribirse al observable de cards
    this.globalService.selectedCard$.subscribe((card)=> {
      if(card) {
        this.openCardModal = true;        
      }
    })
  }  

  private sortListsByPosition() {
    this.boardLists.sort((a, b) => a.pos - b.pos);
  }  

  calculateNewListPosition(newIndex: number): number | 'top' | 'bottom' {    
    const sortedLists = [...this.boardLists].sort((a, b) => a.pos - b.pos);
    if (newIndex === 1) {      
      return 'top'; // mueve al principio
    }  
    if (newIndex >= sortedLists.length) {
      return 'bottom'; // mueve al final
    }  
    const before = sortedLists[newIndex - 1].pos;
    const after = sortedLists[newIndex]?.pos;  
    // Calcula un punto medio entre las dos listas vecinas
    return (before + after) / 2 - 1;
  }
  

  cardUpdatedEvent():void {
    // mostrar notificacion y posteriormente cerrar el modal
    this.toast.success(
      'Card Updated',
      'The card was successfully updated'
    );

    this.onCloseCardModal();
  }

  onAddNewList():void {
    this.openNewListModal = true;
  }

  onNewList(event:string):void {
    this.trelloService.createList(event, this.selectedBoard!).subscribe((newList) => {
      this.boardLists.push(newList);
      // notificar acerca de la creaciónd de nueva lista
      this.toast.success(
        'New list added',
        'The new list was successfully created'
      )
      // cerrar el modal
      this.onCloseNewListModal()
    });
  }

  onEditList(event: TrelloList) {    
    this.selectedList = event;
    this.modalEditListOpen = true;
  }

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

  onMoveList(event: TrelloList) {    
    this.selectedList = event;
    this.selectedListOrder = this.boardLists.findIndex((list) => list.id === event.id) + 1;    
    this.moveListModalOpen = true;
  }

  handleReorder(newOrder: number) {
    const newPos = this.calculateNewListPosition(Number(newOrder));
  
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
  
    this.onCloseMoveListModal();
  }
  

  onCloseCardModal(): void {
    this.openCardModal = false; 
    this.globalService.selectedCardSubject.next(null);   
  } 

  onCloseNewListModal(): void {
    this.openNewListModal = false;
  }

  onCloseMoveListModal():void {
    this.moveListModalOpen = false;
    this.globalService.selectedListSubject.next(null);
  }

  onCloseEditListModal(): void {
    this.modalEditListOpen = false;
    this.globalService.selectedListSubject.next(null);
  }

  createNewBoard(): void {
    this.createNewBoardModal = true;
  } 

  onCreateNewBoard(event: string) {
    this.trelloService.createBoard(event).subscribe({
      next: () => {
        this.trelloService.newBoardSubject.next(true);
      },
      error: (err) => {
        console.error('Error creating board:', err);
        this.toast.danger('Error creating board', err.message)
      }
    });
  }
}
