import { Component, OnInit, Input } from '@angular/core';
import { TrelloCard, TrelloList } from '../../services/authorization.service';
import { TrelloAuthService } from '../../services/authorization.service';
import { ToastService } from '../../services/components/toast.service';

import { CardComponent } from '../card/card.component';
import { NewCardComponent } from '../forms/new-card/new-card.component';

import { DragDropModule, CdkDragDrop, moveItemInArray, } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-list',
  imports: [CardComponent, NewCardComponent, DragDropModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Input() list: TrelloList | undefined;   

  public onAddNewCard: boolean = false;
  public cardsList: TrelloCard[] = [];  

  constructor(private trelloService: TrelloAuthService, private toast: ToastService) {}

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
      'The card was succefuly added'
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
      next: () => {},
      error: (err) => console.error('Error actualizando orden:', err),
    });
  }
  
}
