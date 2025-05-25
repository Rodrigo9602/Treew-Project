import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TrelloCard } from '../../services/authorization.service';

@Component({
  selector: 'app-card',
  imports: [NgOptimizedImage],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() card:TrelloCard | undefined;
  @Output() onCardSelected = new EventEmitter<string>();

  onCardOpen(cardId: string) {
    this.onCardSelected.emit(cardId);
  }

}
