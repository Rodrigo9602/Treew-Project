import { Component, OnInit } from '@angular/core';
import { TrelloAuthService, TrelloCard, TrelloList } from '../../services/authorization.service';
import { GlobalVariablesService } from '../../services/global-variables.service';
import { ToastService } from '../../services/components/toast.service';
import { ListComponent } from '../../components/list/list.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { CardFormComponent } from '../../components/forms/card-form/card-form.component';
import { NewListFormComponent } from '../../components/forms/new-list-form/new-list-form.component';

import { DragDropModule, CdkDragDrop, moveItemInArray, } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-dashboard',
  imports: [ListComponent, ModalComponent, CardFormComponent, NewListFormComponent, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {  
  public selectedBoard: string | null = null;
  public boardLists: TrelloList[] = [];  
  public openCardModal: boolean = false;
  public createNewCard: boolean = false;
  public openNewListModal: boolean = false;

  constructor(private trelloService: TrelloAuthService, private globalService: GlobalVariablesService, private toast: ToastService) { }

  ngOnInit(): void {
    // obtener el tablero seleccionado
    this.trelloService.selectedBoardID$.subscribe((boardID) => {
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

  cardUpdatedEvent():void {
    // mostrar notificacion y posteriormente cerrar el modal
    this.toast.success(
      'Card Updated',
      'The card was succefuly updated'
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
        'The new list was sucefuly created'
      )
      // cerrar el modal
      this.onCloseNewListModal()
    });
  }


  onCloseCardModal(): void {
    this.openCardModal = false; 
    this.globalService.selectedCardSubject.next(null);   
  } 

  onCloseNewListModal(): void {
    this.openNewListModal = false;
  }

  createNewBoard(): void {
    
  }

  dropList(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.boardLists, event.previousIndex, event.currentIndex);
  
    const reorderedLists = this.boardLists.map((list, index) => ({
      id: list.id,
      position: (index + 1) * 100,
    }));
  
    this.trelloService.updateListOrder(this.selectedBoard!, reorderedLists).subscribe({
      next: () => {},
      error: (err) => {console.error('Error actualizando orden:', err)}
    });
  }
}
