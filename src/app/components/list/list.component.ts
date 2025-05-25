import { Component, OnInit, Input } from '@angular/core';
import { TrelloCard, TrelloList } from '../../services/authorization.service';
import { TrelloAuthService } from '../../services/authorization.service';

import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  imports: [CardComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Input() list: TrelloList | undefined;  

  public cardsList: TrelloCard[] = [];

  constructor(private trelloService: TrelloAuthService) {}

  ngOnInit(): void {
    // Obtener listado de tarjetas para la lista actual
    if (this.list) {
      this.trelloService.getListCards(this.list.id, true).subscribe((cards) => {              
        this.cardsList = cards;        
      });
    }
  }  
}
